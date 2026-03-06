import networkx as nx
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any, Set
import logging
import uuid
import asyncio
from backend.services.ips_service import ips_service
from backend.services.settings_service import settings_service

logger = logging.getLogger(__name__)

class ForensicsEngine:
    def __init__(self):
        self.graph = nx.DiGraph()
        self.data_store = []

    def ingest_data(self, data: List[Dict[str, Any]]):
        """Build graph from a list of network events"""
        self.data_store = data
        self.graph.clear()
        
        df = pd.DataFrame(data)
        if df.empty: return

        # Group by source/dest to create edges
        edge_data = df.groupby(['source_ip', 'dest_ip']).size().reset_index(name='count')
        
        self.graph = nx.from_pandas_edgelist(
            edge_data, 'source_ip', 'dest_ip', 
            ['count'], 
            create_using=nx.DiGraph()
        )

    async def analyze(self) -> Dict[str, Any]:
        """Run forensic patterns on the current graph"""
        if not self.data_store:
            return {
                "nodes": [], 
                "edges": [], 
                "forensic_alerts": [], 
                "summary": "No data available for analysis.",
                "stats": {
                    "total_nodes": 0,
                    "total_edges": 0,
                    "alert_count": 0,
                    "risk_level": "N/A"
                }
            }

        df = pd.DataFrame(self.data_store)
        df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
        
        alerts = []
        suspicious_nodes = set()

        # 1. Topology Loops (Potential Lateral Movement)
        try:
            detected_cycles = []
            cycles_count = 0
            prying_pairs = []
            prying_count = 0

            if len(self.graph.nodes()) < 100:
                cycles = list(nx.simple_cycles(self.graph))
                for cycle in cycles:
                    if 2 <= len(cycle) <= 5:
                        detected_cycles.append(cycle)
                        suspicious_nodes.update(cycle)
                cycles_count = len(detected_cycles)
                        
            if cycles_count > 0:
                alerts.append({
                    "id": str(uuid.uuid4()),
                    "type": "Information Circle",
                    "attack_category": "Denial of Service (DoS)",
                    "severity": "High",
                    "nodes": list(suspicious_nodes),
                    "description": f"Detected {cycles_count} repeating communication loop(s). This is like a rumor going around in a circle, clogging up the network.",
                    "impact": "When information travels in a redundant loop like this, it often means a smart virus is trying to repeat itself across your network.",
                    "recommendation": "ISOLATE the devices involved and check for misconfigured network settings.",
                    "metadata": {"count": cycles_count}
                })
            else:
                # Heuristic for large graphs or simple 2-way prying
                for u, v in self.graph.edges():
                    if self.graph.has_edge(v, u) and u != v:
                        edge_pair = tuple(sorted((u, v)))
                        if edge_pair not in [tuple(sorted(p)) for p in prying_pairs]:
                            prying_pairs.append([u, v])
                            suspicious_nodes.add(u)
                            suspicious_nodes.add(v)
                prying_count = len(prying_pairs)
                
                if prying_count > 0:
                    alerts.append({
                        "id": str(uuid.uuid4()),
                        "type": "Internal Prying",
                        "attack_category": "Remote-to-Local (R2L)",
                        "severity": "Medium",
                        "nodes": list(suspicious_nodes),
                        "description": f"Found {prying_count} case(s) of unusual internal whispering. This is like a guest trying to sneak into private rooms of your house.",
                        "impact": "It looks like computers are sneaking into each other's spaces to look at private files.",
                        "recommendation": "CHECK the login permissions for these devices and verify if the access is authorized.",
                        "metadata": {"count": prying_count}
                    })

        except Exception as e:
            logger.error(f"Cycle detection failed: {e}")

        # 2. Traffic Intensity Analysis (Fan-In/Out)
        mobs = []
        prowlers = []
        for node in self.graph.nodes():
            in_deg = self.graph.in_degree(node)
            out_deg = self.graph.out_degree(node)
            
            if in_deg > 20:
                mobs.append(node)
                suspicious_nodes.add(node)
            
            if out_deg > 20:
                prowlers.append(node)
                suspicious_nodes.add(node)
        
        if mobs:
            alerts.append({
                "id": str(uuid.uuid4()),
                "type": "Coordinated Mobs",
                "attack_category": "Denial of Service (DoS)",
                "severity": "Critical",
                "nodes": mobs,
                "description": f"{len(mobs)} of your devices are being crowded by too many sources at once.",
                "impact": "This is like a crowd of people shouting at your devices so they can't work properly. It can crash your system.",
                "recommendation": "HIDE these devices from the network for a few minutes to let the noise settle."
            })
            # Automatic Blocking
            auto_block = await settings_service.get_setting("auto_block", True)
            if auto_block:
                for node in mobs:
                    asyncio.create_task(ips_service.block_ip(node, "Automatic blocking: Detection of Coordinated Mob (DoS)", "DoS"))

        if prowlers:
            alerts.append({
                "id": str(uuid.uuid4()),
                "type": "Digital Prowlers",
                "attack_category": "Network Probe",
                "severity": "Medium",
                "nodes": prowlers,
                "description": f"{len(prowlers)} devices are 'prowling' your network to see which ones are 'home'.",
                "impact": "This is like a stranger walking around checking door handles. They are looking for a way to break in.",
                "recommendation": "SCAN these prowling devices for viruses immediately."
            })
            # For Medium, we might not block automatically, just suggest it. 
            # But let's follow the PDF's aggressive stance if requested. 
            # I'll only auto-block Critical for now.

        # Build Graph output for Frontend (vis-network)
        nodes = []
        for node in self.graph.nodes():
            is_suspicious = node in suspicious_nodes
            in_deg = self.graph.in_degree(node)
            out_deg = self.graph.out_degree(node)
            total_deg = in_deg + out_deg
            
            # Simple Internal/External classification
            is_internal = any(node.startswith(prefix) for prefix in ["192.168.", "10.", "172.", "127."])
            
            group = "external"
            if is_suspicious: group = "suspicious"
            elif total_deg > 15: group = "hub"
            elif is_internal: group = "internal"

            nodes.append({
                "id": node,
                "label": node,
                "group": group,
                "value": total_deg, # Vis-network uses 'value' for relative sizing
                "title": f"<b>IP: {node}</b><br/>Type: {group.upper()}<br/>Inbound: {in_deg}<br/>Outbound: {out_deg}"
            })

        edges = []
        for u, v, data in self.graph.edges(data=True):
            count = data.get('count', 1)
            edges.append({
                "from": u,
                "to": v,
                "label": str(count) if count > 1 else "",
                "arrows": "to",
                "width": min(count, 5), # Visually represent traffic volume
                "color": {"opacity": 0.4},
                "title": f"Traffic: {count} packets"
            })

        # Generate Human-Readable Summary
        summary = "Analysis Complete: "
        if not alerts:
            summary += "Your network topology looks clean. No suspicious relationship patterns or looping traffic were detected in this data bundle."
        else:
            summary += f"We identified {len(alerts)} suspicious patterns. "
            types = set(a['type'] for a in alerts)
            summary += f"Focus areas include: {', '.join(types)}. "
            if any(a['severity'] == "Critical" for a in alerts):
                summary += "Critical anomalies were found that require immediate investigation to prevent service disruption."
            else:
                summary += "The patterns found suggest unusual behavior that should be monitored."

        # Calculate Aggregate Stats
        risk_level = "Secure"
        if any(a['severity'] == "Critical" for a in alerts): risk_level = "Critical"
        elif any(a['severity'] == "High" for a in alerts): risk_level = "High"
        elif any(a['severity'] == "Medium" for a in alerts): risk_level = "Elevated"

        stats = {
            "total_nodes": len(self.graph.nodes()),
            "total_edges": len(self.graph.edges()),
            "alert_count": len(alerts),
            "risk_level": risk_level
        }

        return {
            "nodes": nodes,
            "edges": edges,
            "forensic_alerts": alerts,
            "summary": summary,
            "stats": stats
        }

forensics_engine = ForensicsEngine()

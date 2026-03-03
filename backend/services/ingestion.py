import pandas as pd
import io
import re
import logging
from typing import List, Dict, Any
from scapy.all import rdpcap, IP, TCP, UDP, ICMP
import magic

logger = logging.getLogger(__name__)

class UniversalIngestionService:
    def __init__(self):
        # Fuzzy mapping for CSV columns
        self.column_mapping = {
            'source_ip': ['source_ip', 'src_ip', 'source', 'src', 'Source', 'address_a'],
            'dest_ip': ['dest_ip', 'dst_ip', 'destination', 'dst', 'Destination', 'address_b'],
            'bytes': ['bytes', 'length', 'size', 'src_bytes', 'dst_bytes', 'pkt_len'],
            'timestamp': ['timestamp', 'time', 'date', 'Time', 'DateTime'],
            'protocol': ['protocol', 'proto', 'Protocol', 'service']
        }

    def process_file(self, content: bytes, filename: str) -> List[Dict[str, Any]]:
        """
        Detect file type and parse accordingly.
        """
        mime = magic.from_buffer(content, mime=True)
        logger.info(f"Processing {filename} (MIME: {mime})")

        if filename.endswith('.pcap') or 'pcap' in mime:
            return self._parse_pcap(content)
        elif filename.endswith('.csv') or 'csv' in mime or 'text/plain' in mime:
            # Check if it's a log or CSV
            decoded = content.decode('utf-8', errors='ignore')
            if ',' in decoded.split('\n')[0]:
                return self._parse_csv(content)
            else:
                return self._parse_logs(decoded)
        else:
            raise ValueError(f"Unsupported file type: {mime}")

    def _parse_csv(self, content: bytes) -> List[Dict[str, Any]]:
        df = pd.read_csv(io.BytesIO(content))
        return self._normalize_df(df)

    def _normalize_df(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        normalized = []
        reverse_map = {}
        for target, aliases in self.column_mapping.items():
            for alias in aliases:
                if alias in df.columns:
                    reverse_map[alias] = target
                    break
        
        df = df.rename(columns=reverse_map)
        
        # Ensure minimum required columns
        if 'source_ip' not in df.columns or 'dest_ip' not in df.columns:
            # Attempt to find any IP-like columns
            for col in df.columns:
                if df[col].astype(str).str.contains(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}').any():
                    if 'source_ip' not in df.columns: df = df.rename(columns={col: 'source_ip'})
                    elif 'dest_ip' not in df.columns: df = df.rename(columns={col: 'dest_ip'})

        # Convert to list of dicts using vectorized operations
        if 'timestamp' not in df.columns:
            df['timestamp'] = pd.Timestamp.now().isoformat()
        
        return df.to_dict('records')

    def _parse_pcap(self, content: bytes) -> List[Dict[str, Any]]:
        records = []
        # Use an in-memory buffer to avoid disk I/O if possible, or use temp file
        with open('temp.pcap', 'wb') as f:
            f.write(content)
        
        try:
            from scapy.all import PcapReader
            with PcapReader('temp.pcap') as pcap_reader:
                count = 0
                for pkt in pcap_reader:
                    if IP in pkt:
                        records.append({
                            'source_ip': pkt[IP].src,
                            'dest_ip': pkt[IP].dst,
                            'bytes': len(pkt),
                            'timestamp': float(pkt.time),
                            'protocol': self._get_proto_name(pkt)
                        })
                        count += 1
                    if count >= 10000: # Safety cap for now
                        break
        except Exception as e:
            logger.error(f"PCAP parsing error: {e}")
        
        return records

    def _get_proto_name(self, pkt):
        if TCP in pkt: return 'TCP'
        if UDP in pkt: return 'UDP'
        if ICMP in pkt: return 'ICMP'
        return 'Other'

    def _parse_logs(self, text: str) -> List[Dict[str, Any]]:
        records = []
        # Basic regex for IPv4
        ip_pattern = r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}'
        lines = text.split('\n')
        
        for line in lines:
            ips = re.findall(ip_pattern, line)
            if len(ips) >= 2:
                records.append({
                    'source_ip': ips[0],
                    'dest_ip': ips[1],
                    'timestamp': pd.Timestamp.now().isoformat(),
                    'raw_log': line[:200]
                })
        return records

ingestion_service = UniversalIngestionService()

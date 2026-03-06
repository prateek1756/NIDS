import logging
import threading
import queue
import time
from collections import deque
from typing import Optional, Callable

try:
    from scapy.all import Packet, IP, TCP, UDP, ICMP, AsyncSniffer
    SCAPY_AVAILABLE = True
except ImportError:
    SCAPY_AVAILABLE = False

logger = logging.getLogger(__name__)

class LiveSniffer:
    def __init__(self, callback: Callable):
        self.callback = callback
        self.sniffer: Optional[AsyncSniffer] = None
        self.is_running = False
        self.packet_queue = queue.Queue(maxsize=1000)
        self._thread = None

    def start(self, interface: Optional[str] = None):
        if not SCAPY_AVAILABLE:
            logger.error("Scapy not available for live sniffing.")
            return

        if self.is_running:
            return

        logger.info(f"Starting live sniffer on interface: {interface or 'default'}")
        self.is_running = True
        self.sniffer = AsyncSniffer(
            iface=interface,
            prn=self._process_packet,
            store=False
        )
        self.sniffer.start()
        
        # Start a worker thread to process queue
        self._thread = threading.Thread(target=self._worker, daemon=True)
        self._thread.start()

    def stop(self):
        self.is_running = False
        if self.sniffer:
            self.sniffer.stop()
            self.sniffer = None
        logger.info("Live sniffer stopped.")

    def _process_packet(self, pkt):
        if not self.is_running:
            return
        try:
            if not self.packet_queue.full():
                self.packet_queue.put(pkt, block=False)
        except queue.Full:
            pass

    def _worker(self):
        while self.is_running:
            try:
                pkt = self.packet_queue.get(timeout=1)
                self.callback(pkt)
                self.packet_queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"Sniffer worker error: {e}")

class PacketProcessor:
    def __init__(self):
        self.live_sniffer = LiveSniffer(self._handle_live_packet)
        self.live_subscribers: list[Callable] = []
        self.history = deque(maxlen=100) # Recent packet history for feature calculation
        if not SCAPY_AVAILABLE:
            logger.warning("Scapy not installed. PacketProcessor running in MOCK mode.")

    def subscribe(self, callback: Callable):
        self.live_subscribers.append(callback)

    def _handle_live_packet(self, pkt):
        features = self.extract_features(pkt)
        for sub in self.live_subscribers:
            try:
                sub(pkt, features)
            except Exception as e:
                logger.error(f"Subscriber error: {e}")

    def extract_features(self, packet_data) -> dict:
        """
        Extract features from a network packet, aligned with NSL-KDD training.
        """
        features = {
            "timestamp": time.time(),
            "protocol_type": "tcp",
            "service": "other",
            "flag": "SF",
            "src_bytes": 0,
            "dst_bytes": 0,
            "count": 1,
            "srv_count": 1,
            "serror_rate": 0.0,
            "rerror_rate": 0.0,
            "src_ip": "127.0.0.1",
            "dst_ip": "127.0.0.1"
        }
        
        if not SCAPY_AVAILABLE or packet_data is None:
            return features

        try:
            if IP in packet_data:
                features["src_ip"] = packet_data[IP].src
                features["dst_ip"] = packet_data[IP].dst
                features["src_bytes"] = len(packet_data[IP].payload)
                features["dst_bytes"] = 0 # In a live sniffer, we'd need flow tracking to get DST bytes
                
                # Protocol specific
                if TCP in packet_data:
                    features["protocol_type"] = "tcp"
                    flags = str(packet_data[TCP].flags)
                    features["flag"] = self._map_flags_to_nsl(flags)
                    features["service"] = self._map_port_to_service(packet_data[TCP].dport)
                elif UDP in packet_data:
                    features["protocol_type"] = "udp"
                    features["service"] = self._map_port_to_service(packet_data[UDP].dport)
                elif ICMP in packet_data:
                    features["protocol_type"] = "icmp"

                # Advanced Feature Calculation (Stateful)
                self.history.append(packet_data)
                
                # Count: number of connections to the same host in the last 2 seconds
                now = time.time()
                recent = [p for p in self.history if hasattr(p, 'time') and (now - float(p.time)) < 2.0]
                
                if recent:
                    features["count"] = len([p for p in recent if IP in p and p[IP].dst == features["dst_ip"]])
                    features["srv_count"] = len([p for p in recent if TCP in p and p[TCP].dport == packet_data[TCP].dport]) if TCP in packet_data else 1
                    
                    # serror_rate: % of connections that have 'SYN' errors (no ACK)
                    s0_count = len([p for p in recent if TCP in p and str(p[TCP].flags) == 'S'])
                    features["serror_rate"] = s0_count / len(recent) if recent else 0.0
                    
                    # rerror_rate: % of connections that have 'REJ' errors (Reset/Reject)
                    rej_count = len([p for p in recent if TCP in p and 'R' in str(p[TCP].flags)])
                    features["rerror_rate"] = rej_count / len(recent) if recent else 0.0

        except Exception as e:
            logger.error(f"Feature extraction failed: {e}")
            
        return features

    def _map_flags_to_nsl(self, flags: str) -> str:
        if 'S' in flags and 'A' not in flags: return 'S0'
        if 'R' in flags: return 'REJ'
        if 'F' in flags: return 'SF'
        return 'SF'

    def _map_port_to_service(self, port: int) -> str:
        services = {
            80: "http", 443: "http", 22: "ssh", 21: "ftp", 
            25: "smtp", 53: "dns", 3306: "other", 5432: "other"
        }
        return services.get(port, "other")

packet_processor = PacketProcessor()

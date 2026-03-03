import logging

try:
    from scapy.all import Packet, IP, TCP, UDP, ICMP
    SCAPY_AVAILABLE = True
except ImportError:
    SCAPY_AVAILABLE = False

logger = logging.getLogger(__name__)

class PacketProcessor:
    def __init__(self):
        if not SCAPY_AVAILABLE:
            logger.warning("Scapy not installed. PacketProcessor running in MOCK mode.")

    def extract_features(self, packet_data) -> dict:
        """
        Extract features from a network packet.
        If packet_data is a Scapy packet, it parses it.
        Otherwise, it might be a mock or raw byte stream.
        """
        features = {
            "duration": 0,
            "protocol_type": "tcp",
            "service": "http",
            "flag": "SF",
            "src_bytes": 0,
            "dst_bytes": 0,
            "land": 0,
            "wrong_fragment": 0,
            "urgent": 0,
            "count": 1,
            "srv_count": 1
        }
        
        if not SCAPY_AVAILABLE:
            return features # Return default mock features

        try:
            if isinstance(packet_data, IP):
                features["src_bytes"] = len(packet_data.payload)
                features["ttl"] = packet_data.ttl
                features["flags"] = str(packet_data.flags)
                features["length"] = len(packet_data)
                
                if TCP in packet_data:
                    features["protocol_type"] = "tcp"
                    features["tcp_flags"] = packet_data[TCP].flags
                    features["service"] = self._map_port_to_service(packet_data[TCP].dport)
                elif UDP in packet_data:
                    features["protocol_type"] = "udp"
                    features["service"] = self._map_port_to_service(packet_data[UDP].dport)
                elif ICMP in packet_data:
                    features["protocol_type"] = "icmp"
        except Exception as e:
            logger.error(f"Feature extraction failed: {e}")
            
        return features

    def _map_port_to_service(self, port: int) -> str:
        """Map common ports to service names"""
        services = {
            80: "http", 443: "https", 22: "ssh", 21: "ftp", 
            25: "smtp", 53: "dns", 3306: "mysql", 5432: "postgresql"
        }
        return services.get(port, "other")

packet_processor = PacketProcessor()

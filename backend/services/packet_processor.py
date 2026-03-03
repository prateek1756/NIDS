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
            # Placeholder for actual Scapy-based extraction logic
            # This would normally transform a packet into the 41 features of NSL-KDD
            if isinstance(packet_data, IP):
                features["src_bytes"] = len(packet_data.payload)
                if TCP in packet_data:
                    features["protocol_type"] = "tcp"
                elif UDP in packet_data:
                    features["protocol_type"] = "udp"
                elif ICMP in packet_data:
                    features["protocol_type"] = "icmp"
        except Exception as e:
            logger.error(f"Feature extraction failed: {e}")
            
        return features

packet_processor = PacketProcessor()

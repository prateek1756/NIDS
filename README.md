# AI-Based Network Intrusion Detection System (NIDS)

Real-time network intrusion detection and prevention system powered by machine learning and behavioral forensics.

## Features

- **Real-time Threat Detection** - ML-based anomaly detection with heuristic fallback
- **Behavioral Forensics** - Graph-based network topology analysis
- **Intrusion Prevention** - Automatic IP blocking for critical threats
- **Universal Ingestion** - Support for PCAP, CSV, and log files
- **Interactive Dashboard** - Real-time monitoring and visualization
- **Threat Intelligence** - Attack prediction and trend analysis

## Architecture

```
anti/
├── backend/          # FastAPI REST API
│   ├── api/         # API endpoints
│   ├── services/    # Business logic
│   ├── core/        # Configuration
│   └── models/      # Data models
└── frontend/        # React TypeScript UI
    └── src/
        ├── components/
        └── assets/
```

## Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB 4.4+

## Installation

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Configure MongoDB connection in `backend/core/config.py` or set environment variables:
```bash
export MONGODB_URL="mongodb://localhost:27017"
export DATABASE_NAME="nids_db"
```

### Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend
```bash
cd backend
python main.py
```
API runs on `http://localhost:8000`

### Start Frontend
```bash
cd frontend
npm run dev
```
UI runs on `http://localhost:5173`

## API Endpoints

- `GET /api/v1/dashboard/stats` - Dashboard statistics
- `GET /api/v1/alerts/alerts` - Recent security alerts
- `POST /api/v1/detection/analyze` - Analyze traffic
- `POST /api/v1/ingestion/upload` - Upload PCAP/CSV/logs
- `GET /api/v1/ips/blocked` - List blocked IPs
- `POST /api/v1/ips/block/{ip}` - Block IP address
- `GET /api/v1/threats/predict` - Attack trend prediction

## Usage

### Dashboard View
Monitor real-time network activity, attack distribution, and active threats.

### Forensics View
Upload network capture files for deep behavioral analysis:
1. Click "Behavioral Forensics" in sidebar
2. Upload PCAP, CSV, or log file
3. View graph topology and security incidents
4. Review AI-generated recommendations

### IPS View
Manage blocked IPs and configure automatic prevention rules.

## Attack Detection Categories

- **DoS** - Denial of Service attacks
- **Probe** - Network scanning and reconnaissance
- **R2L** - Remote-to-Local unauthorized access
- **U2R** - User-to-Root privilege escalation

## Security Considerations

⚠️ **Before Production Deployment:**
- Enable HTTPS/TLS for all communications
- Implement authentication and authorization
- Configure firewall rules
- Use environment variables for secrets
- Enable MongoDB authentication
- Review and fix security findings in Code Issues panel

## Technology Stack

**Backend:**
- FastAPI, Uvicorn
- MongoDB (Motor async driver)
- Scapy (packet processing)
- scikit-learn (ML models)
- NetworkX (graph analysis)

**Frontend:**
- React 18, TypeScript
- Vite
- ApexCharts, Recharts
- vis-network (graph visualization)
- Tailwind CSS

## Development

### Backend Testing
```bash
cd backend
pytest
```

### Frontend Build
```bash
cd frontend
npm run build
```

## License

MIT

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -am 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Create Pull Request

## Support

For issues and questions, please open a GitHub issue.

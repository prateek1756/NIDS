import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StatsCard from './components/StatsCard';
import RecentEvents from './components/RecentEvents';
import AttackChart from './components/AttackChart';
import ThreatMap from './components/ThreatMap';
import ForensicsView from './components/Forensics/ForensicsView';
import TrendPrediction from './components/TrendPrediction';
import IPSView from './components/IPSView';
import { ShieldAlert, Activity, Zap, Globe } from 'lucide-react';

interface Stats {
  total_alerts: number;
  high_severity: number;
  active_threats: number;
  uptime: string;
  traffic_rate: string;
  attack_distribution: { name: string; value: number }[];
}

const App: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/dashboard/stats');
        if (!response.ok) throw new Error('API error');
        const data = await response.json();
        setStats(data);
      } catch (e) {
        setStats({
          total_alerts: 1254,
          high_severity: 42,
          active_threats: 5,
          uptime: "12d 4h",
          traffic_rate: "1.2 Gbps",
          attack_distribution: [
            { name: 'DoS', value: 45 },
            { name: 'Probe', value: 25 },
            { name: 'R2L', value: 15 },
            { name: 'U2R', value: 5 },
            { name: 'Normal', value: 10 }
          ]
        });
      }
    };

    const fetchAlerts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/alerts/alerts?limit=5');
        if (!response.ok) throw new Error('API error');
        const data = await response.json();
        setAlerts(data);
      } catch (e) {
        setAlerts([
          { id: '1', attack_type: 'DoS Attack', timestamp: new Date().toISOString(), is_malicious: true, method: 'Heuristic' },
          { id: '2', attack_type: 'Probe/Port Scan', timestamp: new Date().toISOString(), is_malicious: true, method: 'Heuristic' },
        ]);
      }
    };

    fetchStats();
    fetchAlerts();
    const interval = setInterval(() => {
      fetchStats();
      fetchAlerts();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="neon-text" style={{ fontSize: '2rem' }}>
              {activeTab === 'dashboard' ? 'Security Overview' :
                activeTab === 'forensics' ? 'Behavioral Forensics' :
                  activeTab === 'ips' ? 'Intrusion Prevention' : 'Settings'}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {activeTab === 'dashboard'
                ? 'Real-time network intrusion monitoring and analysis'
                : activeTab === 'forensics'
                  ? 'Deep-dive behavioral analysis and threat graphing'
                  : 'Manage automatic IP blocking and network restrictions'}
            </p>
          </div>
          <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>System Live</span>
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <>
            <div className="stats-grid">
              <StatsCard
                title="Total Alerts"
                value={stats?.total_alerts || '...'}
                icon={ShieldAlert as any}
                trend="+12%"
                color="var(--danger)"
              />
              <StatsCard
                title="Network Traffic"
                value={stats?.traffic_rate || '...'}
                icon={Activity as any}
                trend="+5.4%"
                color="var(--accent-primary)"
              />
              <StatsCard
                title="Active Threats"
                value={stats?.active_threats || '...'}
                icon={Zap as any}
                color="var(--warning)"
              />
              <StatsCard
                title="Uptime"
                value={stats?.uptime || '...'}
                icon={Globe as any}
                color="var(--success)"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Attack Distribution</h3>
                <div style={{ flex: 1 }}>
                  <AttackChart data={stats?.attack_distribution || []} />
                </div>
              </div>

              <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Global Threat Map</h3>
                <div style={{ flex: 1 }}>
                  <ThreatMap />
                </div>
              </div>

              <div style={{ height: '400px' }}>
                <TrendPrediction />
              </div>
            </div>

            <RecentEvents alerts={alerts} />
          </>
        ) : activeTab === 'forensics' ? (
          <ForensicsView />
        ) : activeTab === 'ips' ? (
          <IPSView />
        ) : (
          <div className="glass-card">Settings & Config coming soon...</div>
        )}
      </main>
    </div>
  );
};

export default App;

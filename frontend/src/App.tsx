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
import { API_V1_URL } from './config/api';

import SettingsView from './components/SettingsView';
import Skeleton from './components/common/Skeleton';

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
        const response = await fetch(`${API_V1_URL}/dashboard/stats`);
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
        const response = await fetch(`${API_V1_URL}/alerts/alerts?limit=5`);
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <div className="stats-grid">
              {stats ? (
                <>
                  <StatsCard
                    title="Total Alerts"
                    value={stats.total_alerts}
                    icon={ShieldAlert as any}
                    trend="+12%"
                    color="var(--danger)"
                  />
                  <StatsCard
                    title="Network Traffic"
                    value={stats.traffic_rate}
                    icon={Activity as any}
                    trend="+5.4%"
                    color="var(--accent-primary)"
                  />
                  <StatsCard
                    title="Active Threats"
                    value={stats.active_threats}
                    icon={Zap as any}
                    color="var(--warning)"
                  />
                  <StatsCard
                    title="Uptime"
                    value={stats.uptime}
                    icon={Globe as any}
                    color="var(--success)"
                  />
                </>
              ) : (
                <>
                  <Skeleton height={140} className="glass-card" />
                  <Skeleton height={140} className="glass-card" />
                  <Skeleton height={140} className="glass-card" />
                  <Skeleton height={140} className="glass-card" />
                </>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Attack Distribution</h3>
                <div style={{ flex: 1 }}>
                  {stats ? <AttackChart data={stats.attack_distribution} /> : <Skeleton height="100%" variant="rect" />}
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

            {alerts.length > 0 ? (
              <RecentEvents events={alerts} />
            ) : (
              <div className="glass-card p-6">
                <Skeleton height={40} className="mb-4" />
                <Skeleton height={40} className="mb-2" />
                <Skeleton height={40} className="mb-2" />
                <Skeleton height={40} className="mb-2" />
              </div>
            )}
          </>
        );
      case 'forensics':
        return <ForensicsView />;
      case 'ips':
        return <IPSView />;
      case 'alerts':
        return (
          <div className="space-y-6">
            <RecentEvents events={alerts} />
          </div>
        );
      case 'threat-map':
        return (
          <div className="glass-card" style={{ height: 'calc(100vh - 250px)' }}>
            <ThreatMap />
          </div>
        );
      case 'settings':
        return <SettingsView />;
      default:
        return <div className="glass-card">Content coming soon for {activeTab}...</div>;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content custom-scrollbar">
        <header className="fade-in-up" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-accent-primary/10 text-accent-primary uppercase tracking-widest border border-accent-primary/20">
                Secure Environment
              </span>
            </div>
            <h1 className="neon-text font-black tracking-tighter" style={{ fontSize: '2.5rem', lineHeight: 1 }}>
              {activeTab === 'dashboard' ? 'Security Overview' :
                activeTab === 'forensics' ? 'Deep Discovery' :
                  activeTab === 'ips' ? 'Prevention Control' :
                    activeTab === 'alerts' ? 'Intelligence Logs' :
                      activeTab === 'threat-map' ? 'Global Landscape' : 'Engine Configuration'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, marginTop: '0.5rem' }}>
              {activeTab === 'dashboard'
                ? 'Advanced real-time intrusion monitoring and behavioral analysis'
                : activeTab === 'forensics'
                  ? 'Exhaustive network traffic investigation and relationship mapping'
                  : activeTab === 'ips'
                    ? 'Automated prevention protocols and active network blocking'
                    : activeTab === 'alerts'
                      ? 'Consolidated security incident records and detection matrix'
                      : activeTab === 'threat-map'
                        ? 'Geospatial visualization of inbound and outbound vectors'
                        : 'System-wide performance parameters and security rules'}
            </p>
          </div>
          <div className="glass-card hover:border-accent-primary/40 transition-all duration-500" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '16px' }}>
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-success animate-pulse shadow-[0_0_10px_var(--accent-success)]"></div>
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-accent-success animate-ping opacity-75"></div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'white' }}>System Shield Active</span>
          </div>
        </header>

        <div className="content-area scale-in" key={activeTab}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;

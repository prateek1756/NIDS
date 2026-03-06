import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StatsCard from './components/StatsCard';
import RecentEvents from './components/RecentEvents';
import AttackChart from './components/AttackChart';
import ThreatMap from './components/ThreatMap';
import ForensicsView from './components/Forensics/ForensicsView';
import TrendPrediction from './components/TrendPrediction';
import IPSView from './components/IPSView';
import SettingsView from './components/SettingsView';
import ReportingView from './components/Reporting/ReportingView';
import { ShieldAlert, Activity, Globe } from 'lucide-react';
import { API_V1_URL } from './config/api';

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
  const [isLive, setIsLive] = useState(false);
  const [liveTraffic, setLiveTraffic] = useState<any[]>([]);

  const toggleLiveMode = async () => {
    try {
      const nextState = !isLive;
      const response = await fetch(`${API_V1_URL}/detection/toggle-live?enabled=${nextState}`, { method: 'POST' });
      if (response.ok) {
        setIsLive(nextState);
        if (!nextState) setLiveTraffic([]);
      }
    } catch (e) {
      console.error("Failed to toggle live mode", e);
    }
  };

  useEffect(() => {
    let eventSource: EventSource | null = null;

    if (isLive) {
      eventSource = new EventSource(`${API_V1_URL}/detection/stream`);
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'alert') {
          setAlerts(prev => [data, ...prev].slice(0, 50));
        }
        setLiveTraffic(prev => [...prev, data].slice(-100)); // Keep last 100 packets
      };
      eventSource.onerror = (err) => {
        console.error("SSE connection failed", err);
        setIsLive(false);
        eventSource?.close();
      };
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [isLive]);

  useEffect(() => {
    const fetchStats = async () => {
      // ... existing fetchStats
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
                    title="Mitigated Threats"
                    value={stats.active_threats}
                    icon={ShieldAlert as any}
                    color="var(--success)"
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
              <div className="glass-card flex flex-col h-[450px] bg-gradient-to-br from-white/[0.02] to-transparent p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Inbound Risk Matrix</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Attack Characterization Vector</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-accent-primary/5 border border-accent-primary/10">
                    <Activity size={18} className="text-accent-primary" />
                  </div>
                </div>
                <div className="flex-1">
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
        return <ForensicsView liveData={isLive ? liveTraffic : null} />;
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
      case 'reporting':
        return <ReportingView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <div className="glass-card">Content coming soon for {activeTab}...</div>;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isLive={isLive} onToggleLive={toggleLiveMode} />
      <main className="main-content custom-scrollbar">
        <header className="fade-in-up flex justify-between items-end border-b border-white/5 pb-8 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-accent-primary/10 text-accent-primary uppercase tracking-[0.3em] border border-accent-primary/20 shadow-inner">
                Neural Defense Grid
              </span>
              <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-white/5 text-slate-500 uppercase tracking-[0.3em] border border-white/10">
                v4.0.2-Stable
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-gradient leading-none">
              {activeTab === 'dashboard' ? 'Sentinel Intelligence' :
                activeTab === 'forensics' ? 'Topological Discovery' :
                  activeTab === 'ips' ? 'Active Defense Protocol' :
                    activeTab === 'alerts' ? 'Signal Intelligence' :
                      activeTab === 'threat-map' ? 'Global Landscape' : 'System Configuration'}
            </h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-3 italic opacity-80">
              {activeTab === 'dashboard'
                ? 'Synthesizing real-time intrusion telemetry and behavioral heuristics'
                : activeTab === 'forensics'
                  ? 'Executing exhaustive network traffic interrogation and logic mapping'
                  : activeTab === 'ips'
                    ? 'Managing automated prevention matrices and terminal isolation'
                    : activeTab === 'alerts'
                      ? 'Consolidated security incident archives and forensic signal matrix'
                      : activeTab === 'threat-map'
                        ? 'Geospatial interrogation of active inbound and outbound vectors'
                        : 'Neural engine parameters and global security protocol configuration'}
            </p>
          </div>
          <div className={`glass-card p-4 transition-all duration-700 cursor-pointer flex items-center gap-4 rounded-2xl border ${isLive ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-white/10 bg-white/5 hover:border-accent-primary/40'}`}
            onClick={toggleLiveMode}>
            <div className="relative">
              <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' : 'bg-slate-600'} animate-pulse`}></div>
              {isLive && <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-75"></div>}
            </div>
            <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${isLive ? 'text-emerald-400' : 'text-white'}`}>
              {isLive ? 'Sniffing active' : 'Passive Monitoring'}
            </span>
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

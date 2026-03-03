import React from 'react';
import { AlertCircle, ShieldAlert, Shield, Download, Activity } from 'lucide-react';

interface RecentEventsProps {
    events?: any[]; // Allow for flexible input
    alerts?: any[]; // Allow for backwards compatibility with App.tsx
}

const RecentEvents: React.FC<RecentEventsProps> = ({ events, alerts }) => {
    // Merge or select the data source
    const displayData = events || alerts || [];

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(displayData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `nids_security_report_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const getDisplayFields = (item: any) => {
        return {
            id: item.id || Math.random().toString(),
            type: item.type || item.attack_type || 'Unknown Event',
            timestamp: item.timestamp || new Date().toISOString(),
            severity: item.severity || (item.is_malicious ? 'high' : 'low'),
            source_ip: item.source_ip || (item.features?.source_ip) || 'System'
        };
    };

    return (
        <div className="glass-card fade-in-up flex flex-col h-full" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <Activity className="text-accent-primary" size={20} />
                        Security Intelligence
                    </h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Real-time Traffic Forensics</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10"
                >
                    <Download size={14} className="text-accent-primary" />
                    Export JSON
                </button>
            </div>

            <div className="flex-1 overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                            <th className="pb-2 px-4">Event Type</th>
                            <th className="pb-2 px-4">Source Origin</th>
                            <th className="pb-2 px-4">Risk Level</th>
                            <th className="pb-2 px-4 text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayData.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Shield size={32} className="text-slate-700 animate-pulse" />
                                        <p className="text-slate-500 font-bold text-sm tracking-tight">Awaiting network activities...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            displayData.map((item, index) => {
                                const event = getDisplayFields(item);
                                return (
                                    <tr
                                        key={event.id}
                                        className="group hover:bg-white/[0.03] transition-all duration-300"
                                        style={{
                                            animation: `scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards ${index * 0.05 + 0.3}s`,
                                            opacity: 0,
                                            animationFillMode: 'forwards'
                                        }}
                                    >
                                        <td className="py-4 px-4 bg-white/[0.02] first:rounded-l-2xl border-y border-l border-white/5 group-hover:border-accent-primary/30">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg bg-opacity-10 ${event.severity === 'critical' ? 'bg-red-500 text-red-500' : 'bg-accent-primary text-accent-primary'}`}>
                                                    {getSeverityIcon(event.severity)}
                                                </div>
                                                <span className="text-sm font-bold text-white tracking-tight">{event.type}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 bg-white/[0.02] border-y border-white/5 font-mono text-xs text-slate-400 group-hover:text-accent-primary transition-colors">
                                            {event.source_ip}
                                        </td>
                                        <td className="py-4 px-4 bg-white/[0.02] border-y border-white/5">
                                            <span className={`status-badge ${event.severity === 'critical' || event.severity === 'high' ? 'status-critical' : 'status-secure'}`}>
                                                {event.severity}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 bg-white/[0.02] last:rounded-r-2xl border-y border-r border-white/5 group-hover:border-accent-primary/30 text-right">
                                            <span className="text-xs font-bold text-slate-500 font-mono">
                                                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const getSeverityIcon = (severity: string) => {
    const s = severity.toLowerCase();
    switch (s) {
        case 'critical': return <ShieldAlert className="text-danger" />;
        case 'high': return <AlertCircle className="text-warning" />;
        case 'medium': return <AlertCircle style={{ color: '#fbbf24' }} />;
        default: return <Shield className="text-primary" />;
    }
};

export default RecentEvents;

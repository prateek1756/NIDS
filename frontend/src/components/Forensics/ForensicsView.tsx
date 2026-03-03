import React, { useState } from 'react';
import UnifiedUploader from './UnifiedUploader';
import ThreatGraph from './ThreatGraph';
import {
    BrainCircuit, Activity, Network, ShieldAlert, Cpu, Share2,
    Lock, Search, Users, RefreshCcw, AlertCircle, Shield
} from 'lucide-react';

const ForensicsView: React.FC = () => {
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const getAlertIcon = (type: string) => {
        const t = (type || '').toLowerCase();
        if (t.includes('prowling')) return <Search className="w-5 h-5" />;
        if (t.includes('mob')) return <Users className="w-5 h-5" />;
        if (t.includes('circle')) return <RefreshCcw className="w-5 h-5" />;
        if (t.includes('prying')) return <Lock className="w-5 h-5" />;
        return <AlertCircle className="w-5 h-5" />;
    };

    const handleUploadSuccess = (data: any) => {
        setAnalysisResult(data);
    };

    return (
        <div className="space-y-8 fade-in-up">
            {!analysisResult ? (
                <div className="flex flex-col gap-10 max-w-4xl mx-auto py-12">
                    <div className="text-center space-y-4">
                        <div className="inline-block p-4 rounded-3xl bg-accent-primary/10 border border-accent-primary/20 mb-4">
                            <BrainCircuit className="w-12 h-12 text-accent-primary" />
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight">AI Forensics Intelligence</h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                            Upload network captures or log files to generate an exhaustive behavioral relationship map and threat synthesis.
                        </p>
                    </div>

                    <div className="glass-card p-1 bg-white/[0.02] border-white/5">
                        <UnifiedUploader onUploadSuccess={handleUploadSuccess} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: Network, title: 'Topology Mapping', desc: 'Identify every node and connection in your capture.' },
                            { icon: ShieldAlert, title: 'Threat Discovery', desc: 'Find hidden patterns of lateral movement.' },
                            { icon: Cpu, title: 'Behavioral ML', desc: 'Analyze intent using our forensic intelligence engine.' },
                        ].map((feature, i) => (
                            <div key={i} className="glass-card p-6 text-center hover:bg-white/[0.05] transition-all">
                                <feature.icon className="w-8 h-8 text-slate-500 mx-auto mb-4" />
                                <h4 className="text-white font-bold mb-2">{feature.title}</h4>
                                <p className="text-slate-500 text-xs leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-accent-primary/10 text-accent-primary">
                                <ShieldAlert size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white leading-tight">Forensic Intelligence Matrix</h2>
                                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Dataset: <span className="text-accent-primary">{analysisResult.filename}</span></p>
                            </div>
                        </div>
                        <button
                            onClick={() => setAnalysisResult(null)}
                            className="btn-primary"
                        >
                            Analyze Fresh Dataset
                        </button>
                    </div>

                    {/* Dashboard Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="glass-card p-6 border-l-4 border-accent-primary bg-gradient-to-br from-accent-primary/5 to-transparent">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-accent-primary/10 text-accent-primary">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black">Risk Posture</p>
                                    <p className={`text-2xl font-black ${analysisResult?.analysis?.stats?.risk_level === 'Critical' ? 'text-red-500' :
                                        analysisResult?.analysis?.stats?.risk_level === 'Secure' ? 'text-emerald-400' : 'text-orange-400'
                                        }`}>
                                        {analysisResult?.analysis?.stats?.risk_level || 'Calculating...'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                                    <Cpu className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black">Digital Assets</p>
                                    <p className="text-2xl font-black text-white">{analysisResult?.analysis?.stats?.total_nodes ?? 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                                    <Share2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black">Topology Edges</p>
                                    <p className="text-2xl font-black text-white">{analysisResult?.analysis?.stats?.total_edges ?? 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-accent-secondary/10 text-accent-secondary">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black">Analyzed Packets</p>
                                    <p className="text-2xl font-black text-white">{analysisResult?.events_count ?? 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="lg:w-2/5 space-y-8">
                            <div className="glass-card p-8 border-l-4 border-accent-primary bg-accent-primary/5 hover:bg-accent-primary/10 transition-all">
                                <h4 className="text-white font-black text-lg flex items-center gap-2 mb-4">
                                    <BrainCircuit className="w-6 h-6 text-accent-primary" />
                                    AI Behavioral Synthesis
                                </h4>
                                <p className="text-slate-300 text-sm leading-relaxed mb-4 italic font-medium">
                                    "{analysisResult?.analysis?.summary || 'Synthesizing network behavioral patterns...'}"
                                </p>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-white font-black text-lg mb-4 flex items-center gap-2 px-2">
                                    <Activity className="w-6 h-6 text-accent-secondary" />
                                    Security Incident Matrix
                                </h4>
                                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                                    {(analysisResult?.analysis?.forensic_alerts?.length || 0) > 0 ? (
                                        analysisResult?.analysis?.forensic_alerts.map((alert: any) => (
                                            <div key={alert.id} className={`p-6 rounded-3xl bg-white/[0.02] border transition-all hover:scale-[1.02] ${alert.severity === 'Critical' ? 'border-red-500/20 bg-red-500/5' :
                                                alert.severity === 'High' ? 'border-orange-500/20 bg-orange-500/5' : 'border-slate-800'
                                                }`}>
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2.5 rounded-xl ${alert.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                                                            alert.severity === 'High' ? 'bg-orange-500/20 text-orange-400' : 'bg-indigo-500/20 text-indigo-400'
                                                            }`}>
                                                            {getAlertIcon(alert.type)}
                                                        </div>
                                                        <span className="text-white font-black text-xl tracking-tight">{alert.type}</span>
                                                    </div>
                                                    <span className={`status-badge ${alert.severity === 'Critical' ? 'status-critical' : 'status-secure'}`}>
                                                        {alert.severity}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-slate-400 font-bold mb-5 leading-relaxed">{alert.description}</p>

                                                <div className="bg-slate-950/50 rounded-2xl p-5 space-y-4 border border-white/5">
                                                    <div>
                                                        <span className="text-[10px] uppercase font-black text-slate-500 block mb-1 tracking-widest">Impact Analysis</span>
                                                        <p className="text-xs text-slate-400 leading-relaxed italic font-medium">
                                                            {alert.impact}
                                                        </p>
                                                    </div>
                                                    <div className="pt-4 border-t border-white/5">
                                                        <span className="text-[10px] uppercase font-black text-accent-primary block mb-1 tracking-widest">Recommended Mitigation</span>
                                                        <p className="text-sm text-white leading-relaxed font-black">
                                                            {alert.recommendation}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="glass-card text-center py-16">
                                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                                                <Shield className="w-8 h-8 text-emerald-500" />
                                            </div>
                                            <h4 className="text-emerald-400 font-black mb-1">Grid System Secure</h4>
                                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">No Anomalies Detected</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-3/5">
                            {analysisResult?.analysis && (
                                <ThreatGraph data={analysisResult.analysis} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForensicsView;

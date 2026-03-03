import React, { useState } from 'react';
import UnifiedUploader from './UnifiedUploader';
import ThreatGraph from './ThreatGraph';
import {
    BrainCircuit, Activity, Network, ShieldAlert, Cpu, Share2,
    Lock, Search, Users, RefreshCcw, AlertCircle
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
        <div className="space-y-6">
            {!analysisResult ? (
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-full max-w-2xl mx-auto">
                        <UnifiedUploader onUploadSuccess={handleUploadSuccess} />
                        <div className="mt-8 text-center p-12 rounded-3xl border border-dashed border-slate-700 bg-slate-900/20">
                            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-6">
                                <Network className="w-8 h-8 text-slate-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Ready for Deep Discovery</h3>
                            <p className="text-slate-400">
                                Upload your PCAP, CSV, or log files to generate a detailed dashboard of relationship patterns.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Analysis Dashboard</h2>
                            <p className="text-slate-400 text-sm">Target: <span className="text-accent-primary">{analysisResult.filename}</span></p>
                        </div>
                        <button
                            onClick={() => setAnalysisResult(null)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors border border-slate-700"
                        >
                            Analyze New File
                        </button>
                    </div>

                    {/* Dashboard Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="glass-card p-6 border-l-4 border-accent-primary">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-accent-primary/10 text-accent-primary">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs uppercase tracking-widest">Risk Assessment</p>
                                    <p className={`text-2xl font-black ${analysisResult?.analysis?.stats?.risk_level === 'Critical' ? 'text-red-500' :
                                        analysisResult?.analysis?.stats?.risk_level === 'Secure' ? 'text-emerald-400' : 'text-orange-400'
                                        }`}>
                                        {analysisResult?.analysis?.stats?.risk_level || 'Unknown'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                    <Cpu className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs uppercase tracking-widest">Assets Found</p>
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
                                    <p className="text-slate-400 text-xs uppercase tracking-widest">Connections</p>
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
                                    <p className="text-slate-400 text-xs uppercase tracking-widest">Total Events</p>
                                    <p className="text-2xl font-black text-white">{analysisResult?.events_count ?? 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-1/3 space-y-6">
                            <div className="glass-card p-6 border-l-4 border-accent-primary bg-accent-primary/5">
                                <h4 className="text-white font-bold flex items-center gap-2 mb-3">
                                    <BrainCircuit className="w-5 h-5 text-accent-primary" />
                                    AI Security Synthesis
                                </h4>
                                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                    {analysisResult?.analysis?.summary || 'No summary available for this analysis.'}
                                </p>
                            </div>

                            <div className="glass-card p-6">
                                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-accent-secondary" />
                                    Security Incidents
                                </h4>
                                <div className="space-y-4">
                                    {(analysisResult?.analysis?.forensic_alerts?.length || 0) > 0 ? (
                                        analysisResult?.analysis?.forensic_alerts.map((alert: any) => (
                                            <div key={alert.id} className={`p-5 rounded-2xl bg-slate-900/40 border transition-all hover:scale-[1.01] ${alert.severity === 'Critical' ? 'border-red-500/30' :
                                                alert.severity === 'High' ? 'border-orange-500/30' : 'border-slate-700/50'
                                                }`}>
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${alert.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                                                            alert.severity === 'High' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                                                            }`}>
                                                            {getAlertIcon(alert.type)}
                                                        </div>
                                                        <span className="text-white font-bold text-lg tracking-tight">{alert.type}</span>
                                                    </div>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${alert.severity === 'Critical' ? 'bg-red-500 text-white' :
                                                        alert.severity === 'High' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                                                        }`}>
                                                        {alert.severity}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-slate-300 font-medium mb-4 leading-relaxed">{alert.description}</p>

                                                <div className="bg-slate-800/20 rounded-xl p-4 space-y-3 border border-slate-700/30">
                                                    <div>
                                                        <span className="text-[10px] uppercase font-black text-slate-500 block mb-1">What is happening?</span>
                                                        <p className="text-xs text-slate-300 leading-relaxed italic">
                                                            "{alert.impact}"
                                                        </p>
                                                    </div>
                                                    <div className="pt-2 border-t border-slate-700/50">
                                                        <span className="text-[10px] uppercase font-black text-accent-primary block mb-1">Simple Fix:</span>
                                                        <p className="text-sm text-white leading-relaxed font-bold">
                                                            {alert.recommendation}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10">
                                            <div className="text-emerald-400 mb-2">✓ Everything Looks Great</div>
                                            <div className="text-[10px] text-slate-500">Your network activity is normal and safe.</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-2/3">
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

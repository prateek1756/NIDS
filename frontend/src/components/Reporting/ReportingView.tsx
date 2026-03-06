import React, { useState, useEffect } from 'react';
import { FileText, Download, Shield, RefreshCw, Clock, HardDrive, Share2 } from 'lucide-react';
import { API_V1_URL } from '../../config/api';

const ReportingView: React.FC = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_V1_URL}/reporting/list`);
            const data = await response.json();
            setReports(data);
        } catch (e) {
            console.error("Failed to fetch reports", e);
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch(`${API_V1_URL}/reporting/generate`, { method: 'POST' });
            if (response.ok) {
                await fetchReports();
            }
        } catch (e) {
            console.error("Failed to generate report", e);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadReport = (filename: string) => {
        window.open(`${API_V1_URL}/reporting/download/${filename}`, '_blank');
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Primary Action */}
            <div className="glass-card p-10 flex flex-col md:flex-row justify-between items-center gap-8 bg-gradient-to-br from-accent-primary/10 via-transparent to-accent-secondary/5 border-white/5 relative overflow-hidden">
                <div className="text-center md:text-left space-y-3 relative z-10">
                    <div className="inline-flex p-4 rounded-2xl bg-accent-primary/10 text-accent-primary mb-3 shadow-inner">
                        <FileText size={36} />
                    </div>
                    <h2 className="text-5xl font-black text-white tracking-tighter text-gradient leading-tight">Forensic Intelligence Archive</h2>
                    <p className="text-slate-400 text-sm max-w-md font-medium leading-relaxed italic">
                        Export cryptographically verified security syntheses of your network's behavioral integrity. AI-generated dossiers include full incident matrices and tactical mitigation strategies.
                    </p>
                </div>

                <button
                    onClick={generateReport}
                    disabled={isGenerating}
                    className={`btn-primary px-12 py-6 text-sm font-black tracking-[0.2em] flex items-center gap-4 shadow-[0_20px_60px_rgba(0,242,255,0.2)] rounded-2xl border border-white/10 hover:border-accent-primary/40 transition-all ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isGenerating ? <RefreshCw className="animate-spin" /> : <Shield size={20} />}
                    {isGenerating ? 'Synthesizing...' : 'Generate New Report'}
                </button>

                {/* Decorative background element */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent-primary/20 blur-[100px] pointer-events-none"></div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-white/5 bg-slate-900/40">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Last Report</p>
                            <p className="text-lg font-black text-white">{reports.length > 0 ? reports[0].date.split(' ')[0] : 'N/A'}</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-6 border-white/5 bg-slate-900/40">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                            <HardDrive size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Total Archives</p>
                            <p className="text-lg font-black text-white">{reports.length} Documents</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-6 border-white/5 bg-slate-900/40">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                            <Share2 size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Storage Status</p>
                            <p className="text-lg font-black text-white">Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-4">
                    <h3 className="text-white font-black uppercase tracking-[0.2em] text-sm">Document Repository</h3>
                    <button onClick={fetchReports} className="text-slate-500 hover:text-white transition-colors">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {loading && reports.length === 0 ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="glass-card p-6 h-20 animate-pulse bg-white/5 border-white/5"></div>
                        ))
                    ) : reports.length > 0 ? (
                        reports.map((report) => (
                            <div key={report.filename} className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-white/[0.04] transition-all group border-white/5">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 rounded-2xl bg-white/5 text-slate-400 group-hover:text-accent-primary transition-colors">
                                        <FileText size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-white font-black tracking-tight">{report.filename}</p>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            <span>{report.date}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                            <span>{report.size}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => downloadReport(report.filename)}
                                        className="p-3 rounded-xl bg-accent-primary/10 text-accent-primary hover:bg-accent-primary hover:text-black transition-all flex items-center gap-2 text-xs font-black uppercase"
                                    >
                                        <Download size={16} />
                                        Download MD
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="glass-card p-20 text-center space-y-4 bg-white/5 border-dashed border-white/10">
                            <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-600">
                                <FileText size={32} />
                            </div>
                            <p className="text-slate-500 font-bold">Your forensic archive is currently empty.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportingView;

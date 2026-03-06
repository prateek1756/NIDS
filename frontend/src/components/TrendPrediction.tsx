import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { API_V1_URL } from '../config/api';

interface Prediction {
    status: string;
    anomaly_score: number;
    prediction: string;
    confidence: number;
}

const TrendPrediction: React.FC = () => {
    const [prediction, setPrediction] = useState<Prediction | null>(null);

    useEffect(() => {
        const fetchPrediction = async () => {
            try {
                const response = await fetch(`${API_V1_URL}/threats/predict`);
                const data = await response.json();
                setPrediction(data);
            } catch (error) {
                console.error("Failed to fetch prediction:", error);
            }
        };

        fetchPrediction();
        const interval = setInterval(fetchPrediction, 10000);
        return () => clearInterval(interval);
    }, []);

    if (!prediction) return null;

    const isHighRisk = prediction.status === 'High Risk';

    return (
        <div className="glass-card fade-in-up flex flex-col h-full bg-gradient-to-br from-white/[0.02] to-transparent" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <TrendingUp size={20} className="text-accent-primary" />
                        AI Predictive Forecast
                    </h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Heuristic Trend Analysis</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-6">
                <div className="flex items-center gap-6 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5 shadow-inner">
                    <div className={`p-5 rounded-2xl shadow-lg ${isHighRisk ? 'bg-accent-danger/20 text-accent-danger border border-accent-danger/30' : 'bg-accent-success/20 text-accent-success border border-accent-success/30'}`}>
                        {isHighRisk ? <AlertTriangle size={36} /> : <ShieldCheck size={36} />}
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-1">Inference Engine Status</p>
                        <div className={`text-3xl font-black tracking-tighter ${isHighRisk ? 'text-accent-danger' : 'text-accent-success'}`}>
                            {prediction.status.toUpperCase()}
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 bg-accent-primary/[0.03] border-accent-primary/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                        <TrendingUp size={16} className="text-accent-primary" />
                    </div>
                    <p className="text-[10px] uppercase font-black text-accent-primary tracking-[0.2em] mb-3">AI Forensic Synthesis</p>
                    <p className="text-sm font-semibold text-slate-300 leading-relaxed italic">
                        "{prediction.prediction}"
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <div className="bg-slate-900/40 p-5 rounded-[1.5rem] border border-white/5 group hover:border-accent-primary/20 transition-all">
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Anomaly Coefficient</p>
                        <p className="text-2xl font-black text-white tracking-tighter">{prediction.anomaly_score}</p>
                    </div>
                    <div className="bg-slate-900/40 p-5 rounded-[1.5rem] border border-white/5 group hover:border-accent-primary/20 transition-all">
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Reliability Index</p>
                        <p className="text-2xl font-black text-white tracking-tighter">{(prediction.confidence * 100).toFixed(0)}%</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-5 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-slate-600 uppercase tracking-widest">
                <span>* Sentinel Inference Active</span>
                <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Sync: 100%
                </span>
            </div>
        </div>
    );
};

export default TrendPrediction;

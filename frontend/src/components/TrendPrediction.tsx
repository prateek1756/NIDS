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
                <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                    <div className={`p-4 rounded-2xl ${isHighRisk ? 'bg-accent-danger/20 text-accent-danger' : 'bg-accent-success/20 text-accent-success'}`}>
                        {isHighRisk ? <AlertTriangle size={32} /> : <ShieldCheck size={32} />}
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-1">Grid Intelligence</p>
                        <div className={`text-2xl font-black ${isHighRisk ? 'text-accent-danger' : 'text-accent-success'}`}>
                            {prediction.status.toUpperCase()}
                        </div>
                    </div>
                </div>

                <div className="glass-card p-5 bg-accent-primary/[0.03] border-accent-primary/10">
                    <p className="text-[10px] uppercase font-black text-accent-primary tracking-widest mb-2">Neural Observation</p>
                    <p className="text-sm font-bold text-white leading-relaxed italic">"{prediction.prediction}"</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Anomaly Factor</p>
                        <p className="text-xl font-black text-white">{prediction.anomaly_score}</p>
                    </div>
                    <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Confidence</p>
                        <p className="text-xl font-black text-white">{(prediction.confidence * 100).toFixed(0)}%</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                * Real-time inference engine processing...
            </div>
        </div>
    );
};

export default TrendPrediction;

import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

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
                const response = await fetch('http://localhost:8000/api/v1/threats/predict');
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
        <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={20} color="var(--accent-primary)" />
                AI Attack Prediction
            </h3>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        background: isHighRisk ? 'var(--danger)20' : 'var(--success)20',
                        color: isHighRisk ? 'var(--danger)' : 'var(--success)'
                    }}>
                        {isHighRisk ? <AlertTriangle size={32} /> : <ShieldCheck size={32} />}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Current Status</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: isHighRisk ? 'var(--danger)' : 'var(--success)' }}>
                            {prediction.status.toUpperCase()}
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>AI Forecast</div>
                    <div style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{prediction.prediction}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Anomaly Score</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{prediction.anomaly_score}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Confidence</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{(prediction.confidence * 100).toFixed(0)}%</div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                * Predictive analytics based on time-series anomaly detection.
            </div>
        </div>
    );
};

export default TrendPrediction;

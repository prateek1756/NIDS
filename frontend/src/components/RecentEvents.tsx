import React from 'react';

interface Alert {
    id: string;
    attack_type: string;
    timestamp: string;
    is_malicious: boolean;
    method?: string;
}

interface RecentEventsProps {
    alerts: Alert[];
}

const RecentEvents: React.FC<RecentEventsProps> = ({ alerts }) => {
    return (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Recent Security Events</h3>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {alerts.length > 0 ? (
                    alerts.map((alert) => (
                        <div
                            key={alert.id}
                            style={{
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '8px',
                                borderLeft: `4px solid ${alert.is_malicious ? 'var(--danger)' : 'var(--success)'}`
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <strong style={{ color: alert.is_malicious ? 'var(--danger)' : 'var(--text-primary)' }}>
                                    {alert.attack_type}
                                </strong>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {new Date(alert.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Detection Method: {alert.method || 'Heuristic'}
                            </p>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem', opacity: 0.6 }}>
                                ID: {alert.id}
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                        No recent alerts
                    </p>
                )}
            </div>
        </div>
    );
};

export default RecentEvents;

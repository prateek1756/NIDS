import React from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ size?: number; color?: string }>;
    trend?: string;
    color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, color = 'var(--accent-primary)' }) => {
    return (
        <div className="glass-card fade-in-up hover:scale-[1.02] transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>{title}</p>
                    <h3 style={{ fontSize: '2rem', marginTop: '0.25rem', fontWeight: 800, color: 'white' }}>{value}</h3>
                </div>
                <div style={{ padding: '0.75rem', borderRadius: '15px', background: `${color}15`, border: `1px solid ${color}30` }} className="group-hover:rotate-12 transition-transform duration-500">
                    <Icon size={24} color={color} />
                </div>
            </div>
            {trend && (
                <div style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: trend.startsWith('+') ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', background: `${trend.startsWith('+') ? 'var(--accent-success)' : 'var(--accent-danger)'}20` }}>
                        {trend}
                    </span>
                    <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>from last hour</span>
                </div>
            )}
        </div>
    );
};

export default StatsCard;

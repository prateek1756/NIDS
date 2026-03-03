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
        <div className="glass-card">
            <div className="flex justify-between items-start mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
                    <h3 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>{value}</h3>
                </div>
                <div style={{ padding: '0.5rem', borderRadius: '8px', background: `${color}20` }}>
                    <Icon size={24} color={color} />
                </div>
            </div>
            {trend && (
                <div style={{ fontSize: '0.875rem', color: trend.startsWith('+') ? 'var(--success)' : 'var(--danger)' }}>
                    {trend} <span style={{ color: 'var(--text-secondary)' }}>from last hour</span>
                </div>
            )}
        </div>
    );
};

export default StatsCard;

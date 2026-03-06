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
        <div className="glass-card fade-in-up hover:scale-[1.05] transition-all duration-500 group relative">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">{title}</p>
                    <h3 className="text-3xl font-black text-white tracking-tighter text-gradient">{value}</h3>
                </div>
                <div
                    className="p-4 rounded-2xl transition-all duration-500 group-hover:rotate-6 shadow-inner"
                    style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                >
                    <Icon size={24} color={color} />
                </div>
            </div>
            {trend && (
                <div className="flex items-center gap-3 mt-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${trend.startsWith('+') ? 'bg-accent-success/10 text-accent-success border border-accent-success/20' : 'bg-accent-danger/10 text-accent-danger border border-accent-danger/20'}`}>
                        {trend}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Temporal Variance</span>
                </div>
            )}
        </div>
    );
};

export default StatsCard;

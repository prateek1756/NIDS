import React from 'react';
import { Shield, Bell, Map, Settings as SettingsIcon, LayoutDashboard, Network } from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'forensics', icon: Network, label: 'Deep Analysis' },
        { id: 'ips', icon: Shield, label: 'IPS Blocking' },
        { id: 'alerts', icon: Bell, label: 'Alerts' },
        { id: 'threat-map', icon: Map, label: 'Threat Map' },
        { id: 'settings', icon: SettingsIcon, label: 'Settings' },
    ];

    return (
        <aside className="sidebar slide-in-left">
            <div className="flex items-center gap-3 mb-12 px-2 group cursor-pointer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
                <div className="p-2 rounded-xl bg-accent-primary/10 border border-accent-primary/20 group-hover:scale-110 transition-transform duration-500">
                    <Shield size={32} className="text-accent-primary filter drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]" />
                </div>
                <div>
                    <h2 className="neon-text font-black tracking-tighter" style={{ fontSize: '1.5rem', lineHeight: 1 }}>AI-NIDS</h2>
                    <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">Security Engine</p>
                </div>
            </div>
            <nav className="flex-1 space-y-2">
                {menuItems.map((item, index) => (
                    <div
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 group
                            ${activeTab === item.id ? 'active-item' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.85rem 1.25rem',
                            borderRadius: '14px',
                            marginBottom: '0.4rem',
                            animation: `scaleIn 0.3s ease forwards ${index * 0.05}s`,
                            opacity: 0
                        }}
                    >
                        <item.icon size={20} className={`${activeTab === item.id ? 'text-accent-primary' : 'group-hover:text-accent-primary'} transition-colors duration-300`} />
                        <span className="text-sm font-semibold tracking-tight">{item.label}</span>
                        {activeTab === item.id && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse shadow-[0_0_8px_rgba(0,242,255,0.8)]"></div>
                        )}
                    </div>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-glass-border">
                <div className="glass-card p-4 bg-accent-primary/5 border-accent-primary/10">
                    <p className="text-[10px] font-bold text-accent-primary uppercase mb-1">System Status</p>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-success animate-pulse"></span>
                        <span className="text-xs font-bold text-white">Engine Online</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

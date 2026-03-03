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
        <aside className="sidebar">
            <div className="flex items-center gap-2 mb-10 px-2" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                <Shield size={32} color="var(--accent-primary)" />
                <h2 className="neon-text" style={{ fontSize: '1.5rem' }}>AI-NIDS</h2>
            </div>
            <nav>
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${activeTab === item.id ? 'active-item' : 'hover-item'}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            marginBottom: '0.5rem',
                            color: activeTab === item.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            background: activeTab === item.id ? 'rgba(0, 242, 255, 0.1)' : 'transparent'
                        }}
                    >
                        <item.icon size={20} />
                        <span style={{ fontWeight: 500 }}>{item.label}</span>
                    </div>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;

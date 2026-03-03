import React from 'react';
import { Settings, Shield, Bell, Database, Save } from 'lucide-react';

import { API_V1_URL } from '../config/api';

const SettingsView: React.FC = () => {
    const [settings, setSettings] = React.useState<any>({
        auto_block: true,
        alert_sensitivity: 0.5,
        log_retention_days: 30,
        system_name: "AI-NIDS Sentinel",
        email_alerts: true,
        desktop_notifications: true
    });
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${API_V1_URL}/settings/`);
                if (response.ok) {
                    const data = await response.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`${API_V1_URL}/settings/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (response.ok) {
                alert("Settings saved successfully!");
            }
        } catch (error) {
            console.error("Failed to save settings:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="glass-card">Loading system configuration...</div>;

    return (
        <div className="space-y-8 fade-in-up max-w-4xl mx-auto py-8">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <Settings className="text-accent-primary animate-spin-slow" size={32} />
                        System Protocols
                    </h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Configure NIDS Defensive Parameters</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`btn-primary flex items-center gap-2 group ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Save size={18} className={isSaving ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                    <span>{isSaving ? 'Syncing Node...' : 'Commit Changes'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* General Settings */}
                <div className="glass-card p-8 border-l-4 border-accent-primary space-y-6" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary">
                            <Shield size={20} />
                        </div>
                        <h3 className="text-lg font-black text-white">Core Directive</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Identity</label>
                            <input
                                type="text"
                                value={settings.system_name}
                                onChange={(e) => setSettings({ ...settings, system_name: e.target.value })}
                                className="cyber-input w-full p-4 rounded-2xl text-sm font-bold"
                                placeholder="Enter System Name..."
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-accent-primary/30 transition-all">
                            <div className="space-y-1">
                                <p className="text-sm font-black text-white">IPS Auto-Block</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Active Firewall Enforcement</p>
                            </div>
                            <div
                                className={`cyber-switch ${settings.auto_block ? 'checked' : ''}`}
                                onClick={() => setSettings({ ...settings, auto_block: !settings.auto_block })}
                            />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="glass-card p-8 border-l-4 border-accent-warning space-y-6" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-accent-warning/10 text-accent-warning">
                            <Bell size={20} />
                        </div>
                        <h3 className="text-lg font-black text-white">Alert Matrix</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-accent-warning/30 transition-all">
                            <div className="space-y-1">
                                <p className="text-sm font-black text-white">Email Integration</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">External SMTP Reporting</p>
                            </div>
                            <div
                                className={`cyber-switch ${settings.email_alerts ? 'checked' : ''}`}
                                onClick={() => setSettings({ ...settings, email_alerts: !settings.email_alerts })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-accent-warning/30 transition-all">
                            <div className="space-y-1">
                                <p className="text-sm font-black text-white">HUD Notifications</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">System-Wide Broadcasts</p>
                            </div>
                            <div
                                className={`cyber-switch ${settings.desktop_notifications ? 'checked' : ''}`}
                                onClick={() => setSettings({ ...settings, desktop_notifications: !settings.desktop_notifications })}
                            />
                        </div>
                    </div>
                </div>

                {/* Storage */}
                <div className="glass-card p-8 border-l-4 border-accent-success space-y-6 md:col-span-2" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-accent-success/10 text-accent-success">
                            <Database size={20} />
                        </div>
                        <h3 className="text-lg font-black text-white">Data Retention & Purge Cycle</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                Define the lifecycle of historical forensic data. Longer retention requires more disk space but provides better historical context for the AI Synthesis engine.
                            </p>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Retention Period</span>
                                <select
                                    value={settings.log_retention_days}
                                    onChange={(e) => setSettings({ ...settings, log_retention_days: parseInt(e.target.value) })}
                                    className="cyber-input p-3 rounded-xl text-sm font-bold min-w-[150px]"
                                >
                                    <option value={30}>30 Solar Days</option>
                                    <option value={60}>60 Solar Days</option>
                                    <option value={90}>90 Solar Days</option>
                                    <option value={365}>1 Full Year</option>
                                </select>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-accent-success/5 border border-accent-success/10 flex flex-col justify-center">
                            <p className="text-accent-success text-xs font-black uppercase tracking-widest mb-2 text-center">Current Database Health</p>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                <div className="bg-accent-success h-full w-[45%] animate-pulse"></div>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2 text-center font-bold">4.2 GB / 10 GB Allocated</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center pt-4">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">End of Configuration Stream</p>
            </div>
        </div>
    );
};

export default SettingsView;

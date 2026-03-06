import React, { useEffect, useState, useRef, useMemo } from 'react';
import { API_V1_URL } from '../config/api';
import { Shield, Activity, Globe, MapPin, Terminal, List, BarChart } from 'lucide-react';

interface ThreatLocation {
    id: string;
    lat: number;
    lng: number;
    city: string;
    type: string;
    severity: string;
    x: string;
    y: string;
    xPercent: number;
    yPercent: number;
    color: string;
    size: string;
    timestamp?: string;
}

const ThreatMap: React.FC = () => {
    const [points, setPoints] = useState<ThreatLocation[]>([]);
    const [hoveredPoint, setHoveredPoint] = useState<ThreatLocation | null>(null);
    const [activeFeedId, setActiveFeedId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchThreats = async () => {
            try {
                const response = await fetch(`${API_V1_URL}/threats/map`);
                const data: any[] = await response.json();

                const mappedPoints = data.map(t => {
                    const x = ((t.lng + 180) / 360) * 100;
                    const y = ((90 - t.lat) / 180) * 100;

                    let color = '#10b981'; // Success (Green)
                    if (t.severity === 'Critical') color = '#ef4444'; // Danger (Red)
                    else if (t.severity === 'High') color = '#f97316'; // Orange
                    else if (t.severity === 'Medium') color = '#f59e0b'; // Amber

                    return {
                        ...t,
                        x: `${x}%`,
                        y: `${y}%`,
                        xPercent: x,
                        yPercent: y,
                        color,
                        size: t.severity === 'Critical' ? '14px' : t.severity === 'High' ? '12px' : '10px',
                        timestamp: new Date().toLocaleTimeString()
                    };
                });
                setPoints(mappedPoints);
            } catch (error) {
                console.error("Failed to fetch threat map:", error);
            }
        };

        fetchThreats();
        const interval = setInterval(fetchThreats, 5000);
        return () => clearInterval(interval);
    }, []);

    const recentThreats = useMemo(() => {
        return [...points].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 8);
    }, [points]);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-[600px] bg-slate-950 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl group"
        >
            {/* High-Tech Grid & Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)_0%,rgba(2,6,23,1)_100%)]" />
            <div className="absolute inset-0 opacity-[0.15]"
                style={{
                    backgroundImage: `linear-gradient(var(--accent-primary) 1px, transparent 1px), linear-gradient(90deg, var(--accent-primary) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* World Map Overlay */}
            <div className="absolute inset-0 pointer-events-none">
                <svg viewBox="0 0 1000 500" className="w-full h-full opacity-20 filter drop-shadow-[0_0_15px_rgba(0,242,255,0.2)]">
                    <path
                        d="M200,100 Q400,50 600,100 T800,100"
                        fill="none"
                        stroke="var(--accent-primary)"
                        strokeWidth="0.5"
                        className="animate-pulse"
                    />
                    <image
                        href="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
                        x="0" y="0" width="100%" height="100%"
                        style={{ filter: 'invert(1) sepia(1) saturate(5) hue-rotate(175deg) brightness(0.8)' }}
                    />
                </svg>
            </div>

            {/* Radar Sweep Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 bottom-0 w-[200px] bg-gradient-to-r from-transparent via-accent-primary/5 to-transparent -translate-x-[200px] animate-[radar-sweep_8s_linear_infinite]" />
            </div>

            {/* Main Interactive Map Area */}
            <div className="absolute inset-0">
                {points.map((p, i) => (
                    <div
                        key={p.id || i}
                        onMouseEnter={() => setHoveredPoint(p)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        className={`absolute cursor-pointer transition-all duration-500 hover:scale-150 z-10 ${activeFeedId === p.id ? 'scale-150 z-20' : ''}`}
                        style={{
                            left: p.x,
                            top: p.y,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        {/* Pulse Ring */}
                        <div
                            className={`absolute inset-[-12px] border rounded-full opacity-0 group-hover:opacity-40 animate-ping`}
                            style={{ borderColor: p.color, animationDuration: p.severity === 'Critical' ? '1s' : '3s' }}
                        />

                        {/* Point Core */}
                        <div
                            className="relative w-3 h-3 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] border-2 border-white/20"
                            style={{ backgroundColor: p.color, width: p.size, height: p.size }}
                        >
                            {p.severity === 'Critical' && (
                                <div className="absolute inset-[-4px] bg-red-500/20 rounded-full animate-pulse" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Intelligence Feed */}
            <div className="absolute top-8 right-8 bottom-8 w-72 z-30 hidden xl:flex flex-col gap-4 animate-in fade-in slide-in-from-right-8 duration-700">
                <div className="glass-card p-5 border-white/10 bg-slate-900/80 backdrop-blur-2xl flex flex-col h-full shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                            <List size={14} className="text-accent-primary" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Live Threat stream</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-accent-primary/10 px-2 py-0.5 rounded-full border border-accent-primary/20">
                            <div className="w-1 h-1 rounded-full bg-accent-primary animate-pulse shadow-[0_0_8px_var(--accent-primary)]" />
                            <span className="text-[8px] font-black text-accent-primary uppercase tracking-widest">In-Sync</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {recentThreats.length > 0 ? (
                            recentThreats.map((t, idx) => (
                                <div
                                    key={t.id + idx}
                                    onMouseEnter={() => setActiveFeedId(t.id)}
                                    onMouseLeave={() => setActiveFeedId(null)}
                                    className="p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer group/item relative overflow-hidden"
                                >
                                    {activeFeedId === t.id && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
                                    )}
                                    <div className="flex justify-between items-start mb-1.5">
                                        <span className="text-[9px] font-black uppercase tracking-tight text-white/90 truncate mr-2">{t.city.split(' (via')[0]}</span>
                                        <span className="text-[8px] font-mono text-slate-500 whitespace-nowrap">{t.timestamp}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                                            <span className="text-[8px] font-bold text-slate-400 truncate max-w-[100px]">{t.type}</span>
                                        </div>
                                        <span style={{ color: t.color }} className="text-[8px] font-black uppercase tracking-widest">{t.severity}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-30 gap-2">
                                <Activity size={24} className="text-slate-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Awaiting Data...</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5">
                        <div className="flex items-center justify-between text-[8px] text-slate-500 font-black uppercase tracking-widest">
                            <span>Global Intensity</span>
                            <span className="text-accent-primary">LOW</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-accent-primary w-1/3 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Tooltip Component */}
            {hoveredPoint && (
                <div
                    className="absolute z-[100] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
                    style={{
                        left: hoveredPoint.x,
                        top: hoveredPoint.y,
                        transform: `translate(-50%, ${hoveredPoint.yPercent < 40 ? '20px' : '-115%'})`,
                    }}
                >
                    <div className="glass-card p-5 border-white/10 bg-slate-900/95 backdrop-blur-3xl min-w-[280px] shadow-2xl relative">
                        {/* Decorative Corner */}
                        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 opacity-50" style={{ borderColor: hoveredPoint.color }} />

                        <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Target Vector</span>
                                <span className="text-sm font-black text-white leading-tight">
                                    {hoveredPoint.city.includes(' (via') ? hoveredPoint.city.split(' (via')[0] : hoveredPoint.city}
                                </span>
                            </div>
                            <div
                                className="px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest"
                                style={{ borderColor: hoveredPoint.color, color: hoveredPoint.color, backgroundColor: `${hoveredPoint.color}10` }}
                            >
                                {hoveredPoint.severity}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                    <p className="text-[8px] text-slate-500 font-black uppercase mb-1 tracking-widest">Traffic Class</p>
                                    <p className="text-xs font-bold text-white">{hoveredPoint.type}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                    <p className="text-[8px] text-slate-500 font-black uppercase mb-1 tracking-widest">Status</p>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent-success animate-pulse" />
                                        <p className="text-xs font-bold text-accent-success">ACTIVE</p>
                                    </div>
                                </div>
                            </div>

                            {hoveredPoint.city.includes(' (via') && (
                                <div className="p-3 rounded-xl bg-accent-primary/5 border border-accent-primary/20">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Terminal size={10} className="text-accent-primary" />
                                        <p className="text-[8px] text-accent-primary font-black uppercase tracking-widest">Origin Terminal</p>
                                    </div>
                                    <p className="text-xs font-mono font-black text-white/90">
                                        {hoveredPoint.city.split(' (via ')[1].replace(')', '')}
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                <span className="flex items-center gap-1">
                                    <MapPin size={8} /> {hoveredPoint.lat.toFixed(2)}, {hoveredPoint.lng.toFixed(2)}
                                </span>
                                <span>SINCE: {hoveredPoint.timestamp}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Controls / Legend Overlay */}
            <div className="absolute bottom-8 left-8 flex flex-col gap-4 z-30">
                {/* Top Regions Panel */}
                <div className="glass-card px-5 py-4 border-white/10 bg-slate-900/60 backdrop-blur-xl rounded-2xl flex flex-col gap-3 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <BarChart size={12} className="text-secondary" />
                        <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.3em]">Primary Threat Vectors</span>
                    </div>
                    <div className="space-y-2">
                        {[
                            { region: 'North America', count: '42%', color: 'var(--accent-primary)' },
                            { region: 'Europe', count: '28%', color: '#a855f7' },
                            { region: 'Asia Pacific', count: '15%', color: '#ec4899' },
                        ].map((r, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-tight">
                                    <span>{r.region}</span>
                                    <span>{r.count}</span>
                                </div>
                                <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: r.count, backgroundColor: r.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-end gap-6">
                    <div className="glass-card px-6 py-4 border-white/10 bg-slate-900/60 backdrop-blur-xl rounded-2xl flex items-center gap-8 shadow-2xl transition-all hover:bg-slate-900/80">
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 border-b border-white/5 pb-1">Legend</span>
                            <div className="flex items-center gap-4">
                                {[
                                    { color: '#ef4444', label: 'CRITICAL' },
                                    { color: '#f97316', label: 'HIGH' },
                                    { color: '#10b981', label: 'STABLE' },
                                ].map((l, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full shadow-lg" style={{ backgroundColor: l.color, boxShadow: `0 0 8px ${l.color}` }} />
                                        <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">{l.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex glass-card p-4 border-white/10 bg-slate-900/60 backdrop-blur-xl rounded-2xl flex-col gap-1 shadow-2xl">
                        <div className="flex items-center gap-2 mb-1">
                            <Globe size={12} className="text-accent-primary" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Neural Grid Sync</span>
                        </div>
                        <div className="text-base font-black text-white tracking-widest">
                            {points.length} <span className="text-[10px] text-slate-500 font-black uppercase">Active Nodes</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Branding / Mode Overlay */}
            <div className="absolute top-8 left-8 z-30 flex flex-col gap-1 pointer-events-none">
                <div className="flex items-center gap-3">
                    <div className="p-4 rounded-3xl bg-accent-primary text-black shadow-[0_0_40px_rgba(0,242,255,0.4)] border-4 border-white/20">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase text-gradient">Threat Matrix HUD</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-accent-success animate-pulse shadow-[0_0_8px_#10b981]" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Neural Defense Mesh v4.0</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Flair: Animated Lines */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes radar-sweep {
                    0% { transform: translateX(-200px); }
                    100% { transform: translateX(1200px); }
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--accent-primary);
                }
            `}} />
        </div>
    );
};

export default ThreatMap;

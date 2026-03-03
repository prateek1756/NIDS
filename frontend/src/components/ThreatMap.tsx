import React, { useEffect, useState, useRef } from 'react';
import { API_V1_URL } from '../config/api';

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
}

const ThreatMap: React.FC = () => {
    const [points, setPoints] = useState<ThreatLocation[]>([]);
    const [hoveredPoint, setHoveredPoint] = useState<ThreatLocation | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchThreats = async () => {
            try {
                const response = await fetch(`${API_V1_URL}/threats/map`);
                const data: any[] = await response.json();

                const mappedPoints = data.map(t => {
                    const x = ((t.lng + 180) / 360) * 100;
                    const y = ((90 - t.lat) / 180) * 100;

                    let color = 'var(--success)';
                    if (t.severity === 'Critical') color = 'var(--danger)';
                    else if (t.severity === 'High') color = '#ff4d4d';
                    else if (t.severity === 'Medium') color = 'var(--warning)';

                    return {
                        ...t,
                        x: `${x}%`,
                        y: `${y}%`,
                        xPercent: x,
                        yPercent: y,
                        color,
                        size: t.severity === 'Critical' ? '12px' : t.severity === 'High' ? '10px' : '8px'
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

    return (
        <div
            ref={containerRef}
            className="relative w-full h-[500px] bg-slate-950/20 rounded-3xl overflow-hidden glass-card border-white/5"
        >
            {/* World Map SVG Background */}
            <svg
                viewBox="0 0 1000 500"
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
                style={{ filter: 'drop-shadow(0 0 20px rgba(0, 242, 255, 0.1))' }}
            >
                <image
                    href="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
                    x="0" y="0" width="100%" height="100%"
                    style={{ filter: 'invert(1) opacity(0.3) brightness(1.5)' }}
                />
            </svg>

            {/* Grid Pattern Background */}
            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(var(--accent-primary) 0.5px, transparent 0.5px)',
                backgroundSize: '30px 30px',
                opacity: 0.1
            }}></div>

            {/* Pulsing Threat Points */}
            <div className="absolute inset-0">
                {points.map((p, i) => (
                    <div
                        key={p.id || i}
                        onMouseEnter={() => setHoveredPoint(p)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        className="absolute cursor-pointer transition-all duration-300"
                        style={{
                            left: p.x,
                            top: p.y,
                            width: p.size,
                            height: p.size,
                            transform: 'translate(-50%, -50%)',
                            zIndex: 10,
                        }}
                    >
                        {/* Point Core */}
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: p.color,
                                borderRadius: '50%',
                                boxShadow: `0 0 20px ${p.color}`,
                                scale: hoveredPoint?.id === p.id ? '1.5' : '1',
                                transition: 'transform 0.3s ease'
                            }}
                        />

                        {/* Ping Animation */}
                        <div
                            className="absolute inset-[-8px] border-2 rounded-full animate-ping opacity-30 pointer-events-none"
                            style={{ borderColor: p.color }}
                        />
                    </div>
                ))}
            </div>

            {/* Fixed Tooltip Overlay (Sibling to points, not child) */}
            {hoveredPoint && (
                <div
                    className={`absolute z-[100] pointer-events-none animate-in fade-in zoom-in duration-200 transition-all`}
                    style={{
                        left: hoveredPoint.x,
                        top: hoveredPoint.y,
                        transform: `translate(-50%, ${hoveredPoint.yPercent < 40 ? '20px' : '-100%'})`,
                        marginTop: hoveredPoint.yPercent < 40 ? '0' : '-20px'
                    }}
                >
                    <div className="glass-card p-4 border-l-4 min-w-[240px] max-w-[300px] shadow-2xl backdrop-blur-xl bg-slate-900/95" style={{ borderLeftColor: hoveredPoint.color }}>
                        <div className="flex justify-between items-start gap-4 mb-3">
                            <span className="text-white font-black uppercase text-[11px] tracking-tight leading-tight">{hoveredPoint.type} Source</span>
                            <span style={{ color: hoveredPoint.color }} className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap bg-white/5 px-2 py-0.5 rounded border border-white/5">{hoveredPoint.severity}</span>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 opacity-70">Detection Vector</p>
                                <p className="text-sm font-bold text-white leading-snug">
                                    {hoveredPoint.city.includes(' (via ') ? hoveredPoint.city.split(' (via ')[0] : hoveredPoint.city}
                                </p>
                            </div>

                            {hoveredPoint.city.includes(' (via ') && (
                                <div>
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1 opacity-70">Origin Backbone</p>
                                    <p className="text-xs font-mono font-black text-accent-primary bg-accent-primary/5 p-2 rounded-lg border border-accent-primary/10">
                                        {hoveredPoint.city.split(' (via ')[1].replace(')', '')}
                                    </p>
                                </div>
                            )}

                            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[9px] text-slate-500 font-mono italic">
                                <span>COORD: {hoveredPoint.lat.toFixed(2)}, {hoveredPoint.lng.toFixed(2)}</span>
                                <div className="flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-accent-success animate-pulse" />
                                    <span className="text-accent-success opacity-80 font-black uppercase">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Legend - Responsive Design */}
            <div className="absolute bottom-6 left-6 z-20 hidden md:flex flex-col gap-2 p-4 rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-xl shadow-2xl">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 border-b border-white/5 pb-2">Threat Intelligence Legend</p>
                <div className="flex flex-col gap-3">
                    {[
                        { label: 'Critical Breach', color: 'var(--accent-danger)' },
                        { label: 'Infiltration Vector', color: '#ff4d4d' },
                        { label: 'Anomaly Detected', color: 'var(--accent-warning)' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-2 h-2 rounded-full" style={{ background: item.color, boxShadow: `0 0 10px ${item.color}` }}></div>
                                <div className="absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-40" style={{ background: item.color }}></div>
                            </div>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Status Header - Compact */}
            <div className="absolute top-6 right-6 z-20 flex items-center gap-3 px-4 py-2 bg-slate-900/80 rounded-full border border-white/10 backdrop-blur-md shadow-xl">
                <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary"></span>
                </div>
                <span className="text-[10px] font-black text-white tracking-[0.15em] uppercase">Global Matrix Sync'd</span>
            </div>
        </div>
    );
};

export default ThreatMap;

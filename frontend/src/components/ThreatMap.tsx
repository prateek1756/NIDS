import React, { useEffect, useState } from 'react';

interface ThreatLocation {
    id: string;
    lat: number;
    lng: number;
    city: string;
    type: string;
    severity: string;
}

const ThreatMap: React.FC = () => {
    const [points, setPoints] = useState<any[]>([]);

    useEffect(() => {
        const fetchThreats = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/v1/threats/map');
                const data: ThreatLocation[] = await response.json();

                // Map lat/lng to percentages (Simplified projection)
                const mappedPoints = data.map(t => ({
                    id: t.id,
                    x: `${((t.lng + 180) / 360) * 100}%`,
                    y: `${((90 - t.lat) / 180) * 100}%`,
                    color: t.severity === 'Critical' || t.severity === 'High' ? 'var(--danger)' : 'var(--warning)',
                    size: t.severity === 'Critical' ? '12px' : '8px',
                    city: t.city
                }));
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
        <div className="relative w-full h-full bg-slate-900/20 rounded-lg overflow-hidden"
            style={{ position: 'relative', width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.2)', borderRadius: '8px', overflow: 'hidden' }}>
            {/* Grid Pattern Background */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(var(--glass-border) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                opacity: 0.3
            }}></div>

            {/* Pulsing Threat Points */}
            {points.map((p, i) => (
                <div
                    key={p.id || i}
                    style={{
                        position: 'absolute',
                        left: p.x,
                        top: p.y,
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        borderRadius: '50%',
                        boxShadow: `0 0 15px ${p.color}`,
                        zIndex: 10,
                        transition: 'all 0.5s ease-out'
                    }}
                    className="animate-pulse"
                    title={p.city}
                >
                    <div style={{
                        position: 'absolute',
                        inset: '-4px',
                        border: `1px solid ${p.color}`,
                        borderRadius: '50%',
                        opacity: 0.5
                    }} className="animate-ping"></div>
                </div>
            ))}

            {/* Connection Lines (Simulated based on points) */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                {points.length > 1 && points.map((p, i) => i < points.length - 1 && (
                    <path
                        key={i}
                        d={`M ${p.x} ${p.y} Q 50% 50% ${points[i + 1].x} ${points[i + 1].y}`}
                        stroke="rgba(0, 242, 255, 0.1)"
                        fill="none"
                        strokeWidth="1"
                    />
                ))}
            </svg>

            <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', zIndex: 20 }}>
                LIVE THREAT TRACKER (GEO-IP)
            </div>
        </div>
    );
};

export default ThreatMap;

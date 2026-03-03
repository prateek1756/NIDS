import React, { useEffect, useRef } from 'react';

// Use global vis from CDN
declare global {
    interface Window {
        vis: any;
    }
}

interface ThreatGraphProps {
    data: {
        nodes: any[];
        edges: any[];
    };
}

const ThreatGraph: React.FC<ThreatGraphProps> = ({ data }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const networkRef = useRef<any>(null);

    useEffect(() => {
        if (!containerRef.current || !window.vis) return;

        const { Network, DataSet } = window.vis;

        const nodes = new DataSet(data.nodes);
        const edges = new DataSet(data.edges);

        const options = {
            nodes: {
                shape: 'dot',
                font: { color: '#ffffff', size: 12 },
                borderWidth: 2,
                shadow: true,
            },
            edges: {
                width: 2,
                color: { inherit: 'from' },
                smooth: { type: 'continuous' },
                arrows: { to: { enabled: true, scaleFactor: 0.5 } },
            },
            physics: {
                barnesHut: {
                    gravitationalConstant: -2000,
                    centralGravity: 0.3,
                    springLength: 95,
                },
                stabilization: { iterations: 150 },
            },
            interaction: {
                hover: true,
                tooltipDelay: 200,
            },
        };

        networkRef.current = new Network(containerRef.current, { nodes, edges }, options);

        return () => {
            if (networkRef.current) {
                networkRef.current.destroy();
                networkRef.current = null;
            }
        };
    }, [data]);

    return (
        <div className="glass-card p-4 h-[600px] relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></span>
                    Network Relationship Graph
                </h3>
                <div className="text-xs text-slate-400">
                    Scroll to zoom • Drag to explore
                </div>
            </div>
            <div ref={containerRef} className="w-full h-[500px]" />
        </div>
    );
};

export default ThreatGraph;

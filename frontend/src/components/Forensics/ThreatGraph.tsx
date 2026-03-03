import React, { useEffect, useRef, useState } from 'react';
import { Search, Filter, Info, Target, Zap, Activity } from 'lucide-react';

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
    const [selectedEntity, setSelectedEntity] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGroup, setFilterGroup] = useState<string | null>(null);

    const handleSearch = () => {
        if (!searchTerm || !networkRef.current) return;
        const node = data.nodes.find(n => n.id.toLowerCase().includes(searchTerm.toLowerCase()));
        if (node) {
            networkRef.current.focus(node.id, { scale: 1.5, animation: true });
            networkRef.current.selectNodes([node.id]);
            setSelectedEntity({ type: 'node', data: node });
        }
    };

    const handleFilter = (group: string | null) => {
        setFilterGroup(group);
        if (!networkRef.current) return;

        if (!group) {
            networkRef.current.setData({
                nodes: new window.vis.DataSet(data.nodes),
                edges: new window.vis.DataSet(data.edges)
            });
        } else {
            const filteredNodes = data.nodes.filter(n => n.group === group);
            const nodeIds = new Set(filteredNodes.map(n => n.id));
            const filteredEdges = data.edges.filter(e => nodeIds.has(e.from) && nodeIds.has(e.to));
            networkRef.current.setData({
                nodes: new window.vis.DataSet(filteredNodes),
                edges: new window.vis.DataSet(filteredEdges)
            });
        }
    };

    useEffect(() => {
        if (!containerRef.current || !window.vis) return;

        const { Network, DataSet } = window.vis;

        const nodes = new DataSet(data.nodes);
        const edges = new DataSet(data.edges);

        const options = {
            nodes: {
                shape: 'dot',
                font: { color: '#ffffff', size: 12, strokeWidth: 2, strokeColor: '#000000', face: 'Plus Jakarta Sans' },
                borderWidth: 3,
                shadow: { enabled: true, color: 'rgba(0,0,0,0.4)', size: 10, x: 2, y: 2 },
            },
            groups: {
                internal: {
                    color: { background: '#00f2ff', border: '#00d0db', highlight: { background: '#00f2ff', border: '#ffffff' } },
                },
                external: {
                    color: { background: '#6366f1', border: '#4f46e5', highlight: { background: '#6366f1', border: '#ffffff' } },
                },
                suspicious: {
                    color: { background: '#ef4444', border: '#dc2626', highlight: { background: '#ef4444', border: '#ffffff' } },
                    shape: 'diamond',
                    size: 30
                },
                hub: {
                    color: { background: '#fbbf24', border: '#f59e0b', highlight: { background: '#fbbf24', border: '#ffffff' } },
                    shape: 'star',
                    size: 25
                }
            },
            edges: {
                width: 3,
                color: { inherit: 'from', opacity: 0.35 },
                smooth: {
                    type: 'curvedCW',
                    roundness: 0.2
                },
                arrows: { to: { enabled: true, scaleFactor: 0.4, type: 'arrow' } },
                hoverWidth: 0.5,
                selectionWidth: 0.5
            },
            physics: {
                barnesHut: {
                    gravitationalConstant: -4000,
                    centralGravity: 0.2,
                    springLength: 200,
                    springConstant: 0.05,
                    damping: 0.09
                },
                stabilization: {
                    enabled: true,
                    iterations: 100,
                    updateInterval: 25
                },
            },
            interaction: {
                hover: true,
                tooltipDelay: 200,
                navigationButtons: false,
                hideEdgesOnDrag: true,
                zoomView: true
            },
        };

        const network = new Network(containerRef.current, { nodes, edges }, options);
        networkRef.current = network;

        network.on("selectNode", (params: any) => {
            const nodeId = params.nodes[0];
            const nodeData = data.nodes.find(n => n.id === nodeId);
            setSelectedEntity({ type: 'node', data: nodeData });
        });

        network.on("selectEdge", (params: any) => {
            if (params.nodes.length === 0) {
                const edgeId = params.edges[0];
                const edgeData = data.edges.find((e, idx) => `edge-${idx}` === edgeId || e.id === edgeId);
                setSelectedEntity({ type: 'edge', data: edgeData });
            }
        });

        network.on("deselectNode", () => setSelectedEntity(null));
        network.on("deselectEdge", () => setSelectedEntity(null));

        return () => {
            if (networkRef.current) {
                networkRef.current.destroy();
                networkRef.current = null;
            }
        };
    }, [data]);

    return (
        <div className="glass-card p-6 h-[750px] relative overflow-hidden flex flex-col border-white/5 bg-slate-950/20">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6 z-20">
                <div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-3 mb-2 tracking-tight">
                        <Activity className="text-accent-primary animate-pulse" size={24} />
                        Relationship Matrix
                    </h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Live Topological Traffic Synthesis</p>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex bg-slate-900/60 rounded-2xl px-4 py-2 border border-white/5 focus-within:border-accent-primary/40 transition-all shadow-inner group">
                        <Search size={14} className="text-slate-500 mt-0.5 group-focus-within:text-accent-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Identify Entity..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="bg-transparent border-none text-xs text-white px-3 focus:outline-none w-40 font-bold"
                        />
                    </div>

                    <div className="flex bg-slate-900/60 rounded-2xl p-1 border border-white/5 gap-1 shadow-inner">
                        <button onClick={() => handleFilter(null)} className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all flex items-center gap-2 ${!filterGroup ? 'bg-accent-primary text-black shadow-lg shadow-accent-primary/20' : 'text-slate-500 hover:text-white'}`}>
                            <Filter size={12} /> ALL
                        </button>
                        <button onClick={() => handleFilter('suspicious')} className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all flex items-center gap-2 ${filterGroup === 'suspicious' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-500 hover:text-red-400'}`}>
                            <Target size={12} /> THREATS
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6 relative min-h-0">
                <div ref={containerRef} className="flex-1 rounded-3xl bg-slate-950/40 border border-white/5 shadow-2xl overflow-hidden" />

                {/* Legend - Modern Overlay */}
                <div className="absolute bottom-6 left-6 z-20">
                    <div className="glass-card p-4 bg-slate-950/60 border border-white/5 shadow-2xl backdrop-blur-xl rounded-2xl">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#00f2ff] shadow-[0_0_12px_#00f2ff]"></div>
                                <span className="text-[10px] font-black text-[#00f2ff] tracking-widest uppercase">Endpoint</span>
                            </div>
                            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_12px_#ef4444]"></div>
                                <span className="text-[10px] font-black text-[#ef4444] tracking-widest uppercase">Target</span>
                            </div>
                            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#fbbf24] shadow-[0_0_12px_#fbbf24]"></div>
                                <span className="text-[10px] font-black text-[#fbbf24] tracking-widest uppercase">Hub Node</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inspection Panel */}
                {selectedEntity && (
                    <div className="w-80 glass-card p-6 border-l-4 border-accent-primary animate-in slide-in-from-right-8 bg-slate-950/80 backdrop-blur-2xl z-30 shadow-2xl flex flex-col gap-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h4 className="font-black text-white text-sm uppercase tracking-widest">
                                {selectedEntity.type === 'node' ? 'Entity Dossier' : 'Link Terminal'}
                            </h4>
                            <div className="p-1.5 rounded-full bg-accent-primary/10 text-accent-primary">
                                {selectedEntity.type === 'node' ? <Target size={16} /> : <Zap size={16} />}
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            {selectedEntity.type === 'node' ? (
                                <>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Identification</p>
                                        <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 shadow-inner">
                                            <p className="text-accent-primary font-black text-sm font-mono break-all leading-tight">{selectedEntity.data.id}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Status</p>
                                            <p className="text-white font-black text-xs uppercase tracking-tighter">{selectedEntity.data.group}</p>
                                        </div>
                                        <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Gravity</p>
                                            <p className="text-white font-black text-xs">{selectedEntity.data.value} Rel.</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        <div className="relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-accent-primary before:to-transparent">
                                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Origin</p>
                                            <p className="text-white font-black text-xs font-mono">{selectedEntity.data.from}</p>
                                        </div>
                                        <div className="relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-transparent before:to-accent-primary">
                                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Endpoint</p>
                                            <p className="text-white font-black text-xs font-mono">{selectedEntity.data.to}</p>
                                        </div>
                                    </div>
                                    <div className="bg-accent-primary/5 p-4 rounded-2xl border border-accent-primary/10 mt-4">
                                        <p className="text-[10px] text-accent-primary font-black uppercase mb-1 tracking-widest">Traffic Burst</p>
                                        <p className="text-white font-black text-sm">{selectedEntity.data.label || '1.4k'} <span className="text-[10px] text-slate-500 font-bold">Packets Sync'd</span></p>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => networkRef.current?.focus(selectedEntity.data.id || selectedEntity.data.from, { scale: 1.5, animation: { duration: 1000, easingFunction: 'easeInOutQuad' } })}
                            className="w-full py-4 bg-accent-primary text-black hover:bg-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-accent-primary/20 active:scale-95"
                        >
                            Focus Directive
                        </button>
                    </div>
                )}

                <div className="absolute bottom-6 right-6 text-[10px] font-black text-slate-500 bg-slate-900/40 px-4 py-2 rounded-full border border-white/5 z-20 backdrop-blur-md uppercase tracking-widest shadow-xl">
                    <Info size={12} className="inline mr-2 text-accent-primary translate-y-[-1px]" />
                    Pinch to zoom • Click to Dossier • Drag to Navigate
                </div>
            </div>
        </div>
    );
};

export default ThreatGraph;

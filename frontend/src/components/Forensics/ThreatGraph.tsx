import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
    Search, Filter, Info, Target, Zap, Activity, Maximize2,
    RefreshCw, ShieldAlert, Globe, Crosshair, Layers, Eye,
    EyeOff, Navigation, Layout, Sliders, Monitor, ZoomIn
} from 'lucide-react';

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
    const [physicsEnabled, setPhysicsEnabled] = useState(false);
    const [isClustered, setIsClustered] = useState(false);
    const [focusMode, setFocusMode] = useState(false);
    const [layoutType, setLayoutType] = useState<'organic' | 'hierarchical'>('organic');
    const [decimationValue, setDecimationValue] = useState(0); // 0-100% hidden

    const handleSearch = () => {
        if (!searchTerm || !networkRef.current) return;
        const node = data.nodes.find(n =>
            n.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (n.label && n.label.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        if (node) {
            networkRef.current.focus(node.id, { scale: 1.5, animation: { duration: 1000, easingFunction: 'easeInOutQuad' } });
            networkRef.current.selectNodes([node.id]);
            setSelectedEntity({ type: 'node', data: node });
        }
    };

    const toggleClustering = useCallback(() => {
        if (!networkRef.current) return;

        if (!isClustered) {
            networkRef.current.clusterByGroup('internal', {
                processProperties: (opts: any, nodes: any) => ({ ...opts, label: `Local Cluster (${nodes.length})` }),
                clusterNodeProperties: { id: 'internal-cluster', shape: 'hexagon', color: '#0ea5e9', font: { color: '#fff' } }
            });
            networkRef.current.clusterByGroup('external', {
                processProperties: (opts: any, nodes: any) => ({ ...opts, label: `Global Cluster (${nodes.length})` }),
                clusterNodeProperties: { id: 'external-cluster', shape: 'hexagon', color: '#6366f1', font: { color: '#fff' } }
            });
        } else {
            networkRef.current.openCluster('internal-cluster');
            networkRef.current.openCluster('external-cluster');
        }
        setIsClustered(!isClustered);
    }, [isClustered]);

    const resetView = () => {
        if (networkRef.current) {
            networkRef.current.fit({ animation: { duration: 1000, easingFunction: 'easeInOutQuad' } });
        }
    };

    const [isGraphReady, setIsGraphReady] = useState(false);

    const updateGraphData = useCallback(() => {
        if (!networkRef.current || !window.vis) return;

        try {
            let filteredNodes = data?.nodes || [];
            let filteredEdges = data?.edges || [];

            if (filteredNodes.length === 0) return;

            // Apply Decimation (Hide low-relativity nodes)
            if (decimationValue > 0) {
                const nodeValues = filteredNodes.map(n => n.value || 0);
                const maxValue = nodeValues.length > 0 ? Math.max(...nodeValues) : 1;
                const threshold = (decimationValue / 100) * maxValue;
                filteredNodes = filteredNodes.filter(n => (n.value || 0) >= threshold || n.group === 'suspicious');
            }

            // Apply Focus Mode
            if (focusMode) {
                const threatIds = new Set(filteredNodes.filter(n => n.group === 'suspicious').map(n => n.id));
                const relatedIds = new Set(threatIds);
                filteredEdges.forEach(e => {
                    if (threatIds.has(e.from)) relatedIds.add(e.to);
                    if (threatIds.has(e.to)) relatedIds.add(e.from);
                });
                filteredNodes = filteredNodes.filter(n => relatedIds.has(n.id));
            }

            // Apply Group Filter
            if (filterGroup) {
                filteredNodes = filteredNodes.filter(n => n.group === filterGroup);
            }

            const activeNodeIds = new Set(filteredNodes.map(n => n.id));
            const finalEdges = filteredEdges.filter(e => activeNodeIds.has(e.from) && activeNodeIds.has(e.to));

            const visNodes = new window.vis.DataSet(filteredNodes.map(n => ({
                ...n,
                label: (n.group === 'suspicious' || (n.value || 0) > 10) ? (n.id || '').slice(0, 10) + '...' : '',
                title: n.title || n.id
            })));

            const visEdges = new window.vis.DataSet(finalEdges.map(e => {
                const weight = parseInt(e.label || '0');
                return {
                    ...e,
                    color: weight > 1000 ? { color: '#ef4444', opacity: 0.8 } : { inherit: 'from', opacity: 0.2 },
                    width: weight > 1000 ? 5 : 2,
                    shadow: weight > 1000 ? { enabled: true, color: '#ef4444', size: 10 } : { enabled: false }
                };
            }));

            networkRef.current.setData({ nodes: visNodes, edges: visEdges });
        } catch (err) {
            console.error("Graph update failed:", err);
        }
    }, [data, focusMode, filterGroup, decimationValue]);

    useEffect(() => {
        if (!containerRef.current || !window.vis) return;

        try {
            const { Network, DataSet } = window.vis;
            const nodes = new DataSet([]);
            const edges = new DataSet([]);

            const options = {
                nodes: {
                    shape: 'dot',
                    font: { color: '#94a3b8', size: 10, face: 'JetBrains Mono, monospace' },
                    borderWidth: 2,
                },
                groups: {
                    internal: { color: { background: '#0ea5e9', border: '#0ea5e9' }, size: 18 },
                    external: { color: { background: '#6366f1', border: '#6366f1' }, size: 18 },
                    suspicious: { color: { background: '#ef4444', border: '#ef4444' }, shape: 'diamond', size: 28 },
                    hub: { color: { background: '#f59e0b', border: '#f59e0b' }, shape: 'star', size: 24 }
                },
                edges: {
                    smooth: { type: 'curvedCW', roundness: 0.4 },
                    arrows: { to: { enabled: true, scaleFactor: 0.4 } }
                },
                physics: {
                    enabled: physicsEnabled && layoutType === 'organic',
                    barnesHut: { gravitationalConstant: -5000, centralGravity: 0.5, springLength: 100 },
                    stabilization: { enabled: true, iterations: 1000 }
                },
                interaction: { hover: true, tooltipDelay: 200 }
            };

            const network = new Network(containerRef.current, { nodes, edges }, options);
            networkRef.current = network;
            setIsGraphReady(true);

            network.on("selectNode", (params: any) => {
                const nodeId = params.nodes[0];
                if (network.isCluster(nodeId)) {
                    network.openCluster(nodeId);
                    return;
                }
                const nodeData = data?.nodes?.find(n => n.id === nodeId);
                if (nodeData) setSelectedEntity({ type: 'node', data: nodeData });
            });

            return () => {
                if (networkRef.current) {
                    networkRef.current.destroy();
                    networkRef.current = null;
                }
            };
        } catch (err) {
            console.error("Network initialization failed:", err);
        }
    }, [layoutType, physicsEnabled]);

    useEffect(() => {
        if (isGraphReady) {
            updateGraphData();
        }
    }, [isGraphReady, updateGraphData]);

    return (
        <div className="glass-card p-6 h-[80vh] min-h-[700px] relative overflow-hidden flex flex-col border-white/5 bg-slate-950/40 shadow-2xl rounded-[3rem] group/main fade-in">
            {/* Top Command HUD */}
            <div className="flex justify-between items-center mb-6 z-30">
                <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-[1.2rem] bg-slate-900 flex items-center justify-center border border-white/10 text-accent-primary shadow-[0_0_30px_rgba(0,242,255,0.1)]">
                        <Monitor size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none mb-1 text-gradient">Topology Logic HUD</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Advanced Neural Inspection Grid</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Layout Toggles */}
                    <div className="bg-slate-950/80 p-1.5 rounded-xl border border-white/10 flex gap-1 shadow-2xl backdrop-blur-xl">
                        <button
                            onClick={() => setLayoutType('organic')}
                            className={`p-2.5 rounded-lg transition-all ${layoutType === 'organic' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            title="Organic Network"
                        >
                            <Globe size={18} />
                        </button>
                        <button
                            onClick={() => setLayoutType('hierarchical')}
                            className={`p-2.5 rounded-lg transition-all ${layoutType === 'hierarchical' ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            title="Hierarchical Flow"
                        >
                            <Layout size={18} />
                        </button>
                    </div>

                    <div className="h-8 w-px bg-white/10 mx-2" />

                    <div className="flex bg-slate-950/80 rounded-xl px-4 py-2.5 border border-white/10 group/search min-w-[200px]">
                        <Search size={16} className="text-slate-500 mt-0.5 group-focus-within/search:text-accent-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Locate Identity..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="bg-transparent border-none text-xs text-white px-3 focus:outline-none w-full font-bold"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6 relative min-h-0">
                {/* Visual Viewport */}
                <div className="flex-1 relative rounded-[2.5rem] bg-slate-950/60 border border-white/5 shadow-inner overflow-hidden flex flex-col group/viewport">
                    <div ref={containerRef} className="flex-1" />

                    {/* Navigation Mini-map Overlay */}
                    <div className="absolute bottom-8 left-8 h-40 w-40 bg-slate-900/90 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-2xl pointer-events-none p-4 overflow-hidden group/minimap">
                        <div className="w-full h-full relative border border-white/5 rounded-xl flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent" />
                            <Navigation size={12} className="text-accent-primary animate-pulse" />
                            <p className="absolute bottom-2 left-0 right-0 text-center text-[7px] font-black text-slate-500 uppercase tracking-widest">Navigation HUD</p>

                            {/* Simulated Nodes in Mini-map */}
                            <div className="w-1 h-1 bg-red-500 rounded-full absolute top-1/4 left-1/3 blur-[1px]" />
                            <div className="w-1 h-1 bg-sky-500 rounded-full absolute bottom-1/3 right-1/4" />
                            <div className="w-2 h-2 border border-accent-primary/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    {/* Central Tactical HUD */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-4 bg-slate-950/95 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-t-white/20">
                        <button onClick={resetView} className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Zoom to Fit">
                            <Maximize2 size={20} />
                        </button>

                        <div className="w-px h-8 bg-white/10" />

                        <div className="flex items-center gap-5">
                            <Sliders size={16} className="text-slate-500" />
                            <div className="flex flex-col gap-2 w-48">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Node Decimation</span>
                                    <span className="text-[9px] font-black text-accent-primary">{decimationValue}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="90"
                                    value={decimationValue}
                                    onChange={(e) => setDecimationValue(parseInt(e.target.value))}
                                    className="w-full accent-accent-primary h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="w-px h-8 bg-white/10" />

                        <div className="flex bg-slate-900 rounded-xl p-1 gap-1 border border-white/5">
                            <button
                                onClick={() => setFocusMode(!focusMode)}
                                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${focusMode ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'text-slate-500 hover:text-white'}`}
                            >
                                {focusMode ? 'Critical Focus' : 'Full Spectrum'}
                            </button>

                            <button
                                onClick={toggleClustering}
                                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isClustered ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30 shadow-[0_0_20px_rgba(0,242,255,0.2)]' : 'text-slate-500 hover:text-white'}`}
                            >
                                {isClustered ? 'Unify' : 'Cluster'}
                            </button>
                        </div>
                    </div>

                    {/* Traffic Heatmap Indicator */}
                    <div className="absolute top-8 right-8 p-6 bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex flex-col gap-4 shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-1.5 bg-red-500 shadow-[0_0_15px_#ef4444] rounded-full animate-pulse" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Saturation: High</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-1.5 bg-slate-700/50 rounded-full" />
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Normal Sync</span>
                        </div>
                    </div>
                </div>

                {/* Analytical Inspect Panel */}
                {selectedEntity && (
                    <div className="w-[450px] flex flex-col animate-in slide-in-from-right-20 fade-in duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] z-40">
                        <div className="glass-card flex-1 p-10 border-l-[6px] border-accent-primary bg-slate-950/95 backdrop-blur-3xl shadow-[-20px_0_50px_rgba(0,0,0,0.5)] rounded-[3rem] flex flex-col gap-10 relative overflow-hidden">
                            {/* Background Data Stream Effect */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden text-[8px] font-mono leading-none flex flex-wrap gap-2 text-white p-4">
                                {Array(100).fill(0).map((_, i) => <span key={i}>0x{Math.random().toString(16).slice(2, 6)}</span>)}
                            </div>

                            <div className="flex items-center justify-between border-b border-white/10 pb-8 relative z-10">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-accent-primary uppercase tracking-[0.5em] block">Entity Fingerprint</span>
                                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter truncate max-w-[280px]">
                                        {selectedEntity.type === 'node' ? 'Neural Endpoint' : 'Vector signal'}
                                    </h4>
                                </div>
                                <button onClick={() => setSelectedEntity(null)} className="p-3 rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all shadow-inner">
                                    <EyeOff size={24} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-10 overflow-y-auto custom-scrollbar pr-4 relative z-10">
                                <div className="space-y-6">
                                    <div className="bg-slate-900/80 p-6 rounded-3xl border border-white/10 shadow-inner group/id">
                                        <p className="text-[10px] text-slate-500 font-black uppercase mb-3 tracking-widest flex items-center gap-2">
                                            <ShieldAlert size={12} className="text-accent-primary" /> Global Identifier
                                        </p>
                                        <p className="text-secondary font-black text-base font-mono break-all leading-tight group-hover/id:text-white transition-colors">
                                            {selectedEntity.data.id || `${selectedEntity.data.from} » ${selectedEntity.data.to}`}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 flex flex-col gap-2">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Risk Index</p>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${selectedEntity.data.group === 'suspicious' ? 'bg-red-500 shadow-[0_0_15px_#ef4444] animate-ping-slow' : 'bg-emerald-500 shadow-[0_0_15px_#10b981]'}`} />
                                                <span className={`text-lg font-black uppercase tracking-tighter ${selectedEntity.data.group === 'suspicious' ? 'text-red-400' : 'text-emerald-400'}`}>
                                                    {selectedEntity.data.group || 'Verified'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 flex flex-col gap-2">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Node Weight</p>
                                            <p className="text-white font-black text-2xl tracking-tighter">
                                                {selectedEntity.data.value || 1} <span className="text-[10px] text-slate-600 font-bold uppercase ml-1">Relativity</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 rounded-[2rem] bg-accent-primary/5 border border-accent-primary/20 space-y-5 relative group/ai">
                                    <div className="absolute top-4 right-4 text-accent-primary opacity-20 group-hover/ai:opacity-100 transition-opacity">
                                        <Zap size={24} />
                                    </div>
                                    <div className="flex items-center gap-2 text-accent-primary">
                                        <Crosshair size={18} />
                                        <span className="text-xs font-black uppercase tracking-[0.3em]">AI Forensic Synthesis</span>
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed font-semibold italic">
                                        {selectedEntity.data.group === 'suspicious'
                                            ? "Critical topological deviation detected. This endpoint exhibits recursive connection patterns highly correlated with known lateral movement behaviors. Urgent quarantine is advised."
                                            : "Traffic pattern remains within established baseline parameters. Asset demonstrated periodic synchronization with trusted internal nodes."}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => networkRef.current?.focus(selectedEntity.data.id || selectedEntity.data.from, { scale: 1.5, animation: { duration: 2000, easingFunction: 'easeInOutExpo' } })}
                                className="w-full py-6 bg-accent-primary text-black font-black uppercase tracking-[0.4em] rounded-[1.5rem] shadow-[0_15px_50px_rgba(0,242,255,0.3)] active:scale-95 transition-all text-xs hover:bg-white"
                            >
                                Initiate Target focus
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 242, 255, 0.2); border-radius: 20px; }
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 16px; width: 16px;
                    border-radius: 50%; background: #0ea5e9;
                    cursor: pointer; box-shadow: 0 0 15px rgba(14, 165, 233, 0.8);
                }
                @keyframes animate-ping-slow {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(2); opacity: 0; }
                }
                .animate-ping-slow { animation: animate-ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
            `}} />
        </div>
    );
};

export default ThreatGraph;

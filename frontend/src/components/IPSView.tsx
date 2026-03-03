import React, { useEffect, useState } from 'react';
import { ShieldX, Unlock, Server, ShieldCheck } from 'lucide-react';
import { API_V1_URL } from '../config/api';

interface BlockedIP {
    ip_address: string;
    reason: string;
    category: string;
    blocked_at: string;
}

const IPSView: React.FC = () => {
    const [blockedList, setBlockedList] = useState<BlockedIP[]>([]);

    const fetchBlocked = async () => {
        try {
            const response = await fetch(`${API_V1_URL}/ips/blocked`);
            const data = await response.json();
            setBlockedList(data);
        } catch (error) {
            console.error("Failed to fetch blocked IPs:", error);
        }
    };

    const unblockIp = async (ip: string) => {
        try {
            await fetch(`${API_V1_URL}/ips/unblock/${ip}`, { method: 'POST' });
            fetchBlocked();
        } catch (error) {
            console.error("Failed to unblock IP:", error);
        }
    };

    useEffect(() => {
        fetchBlocked();
        const interval = setInterval(fetchBlocked, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col gap-8 fade-in-up">
            <div className="stats-grid">
                <div className="glass-card bg-accent-danger/5 border-accent-danger/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-accent-danger/10 text-accent-danger">
                            <ShieldX size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active Restrictions</p>
                            <p className="text-2xl font-black text-white">{blockedList.length}</p>
                        </div>
                    </div>
                </div>
                <div className="glass-card bg-accent-success/5 border-accent-success/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-accent-success/10 text-accent-success">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Defensive Perimeter</p>
                            <p className="text-2xl font-black text-accent-success">HARDENED</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card flex flex-col h-full" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                            <Server className="text-accent-primary" size={20} />
                            Active Blocklist Matrix (IPS)
                        </h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">OS-Level Network Restrictions</p>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                <th className="pb-2 px-4">Blocked Origin</th>
                                <th className="pb-2 px-4">Attack Vector</th>
                                <th className="pb-2 px-4">Intelligence Logic</th>
                                <th className="pb-2 px-4">Timestamp</th>
                                <th className="pb-2 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blockedList.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <ShieldCheck size={32} className="text-accent-success/50" />
                                            <p className="text-slate-500 font-bold text-sm tracking-tight">Perimeter clear. No active blocks.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                blockedList.map((item, index) => (
                                    <tr
                                        key={index}
                                        className="group hover:bg-white/[0.03] transition-all duration-300"
                                        style={{
                                            animation: `scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards ${index * 0.05 + 0.3}s`,
                                            opacity: 0,
                                            animationFillMode: 'forwards'
                                        }}
                                    >
                                        <td className="py-4 px-4 bg-white/[0.02] first:rounded-l-2xl border-y border-l border-white/5 font-mono text-sm text-red-500 font-black group-hover:border-accent-danger/30">
                                            {item.ip_address}
                                        </td>
                                        <td className="py-4 px-4 bg-white/[0.02] border-y border-white/5">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-white/5 text-slate-300 border border-white/10">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 bg-white/[0.02] border-y border-white/5 text-xs text-slate-400">
                                            {item.reason}
                                        </td>
                                        <td className="py-4 px-4 bg-white/[0.02] border-y border-white/5 text-xs font-bold text-slate-500 font-mono text-right">
                                            {new Date(item.blocked_at).toLocaleTimeString()}
                                        </td>
                                        <td className="py-4 px-4 bg-white/[0.02] last:rounded-r-2xl border-y border-r border-white/5 group-hover:border-accent-success/30 text-right">
                                            <button
                                                onClick={() => unblockIp(item.ip_address)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-accent-success/5 hover:bg-accent-success/10 text-accent-success rounded-xl text-xs font-black transition-all border border-accent-success/20"
                                            >
                                                <Unlock size={14} /> Restore
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default IPSView;

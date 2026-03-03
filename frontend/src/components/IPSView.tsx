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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="stats-grid">
                <div className="glass-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--danger)20' }}>
                            <ShieldX color="var(--danger)" />
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Active Blocks</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{blockedList.length}</div>
                        </div>
                    </div>
                </div>
                <div className="glass-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--success)20' }}>
                            <ShieldCheck color="var(--success)" />
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>System Status</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>PROTECTED</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Server size={20} color="var(--accent-primary)" />
                    Blocked Intrusion Sources (IPS)
                </h3>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                                <th style={{ padding: '1rem' }}>IP Address</th>
                                <th style={{ padding: '1rem' }}>Category</th>
                                <th style={{ padding: '1rem' }}>Detection Reason</th>
                                <th style={{ padding: '1rem' }}>Blocked At</th>
                                <th style={{ padding: '1rem' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blockedList.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No active restrictions. The network is clear.
                                    </td>
                                </tr>
                            ) : (
                                blockedList.map((item, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--danger)' }}>{item.ip_address}</td>
                                        <td style={{ padding: '1rem' }}><span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            background: 'rgba(255,255,255,0.05)'
                                        }}>{item.category}</span></td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{item.reason}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                            {new Date(item.blocked_at).toLocaleTimeString()}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                onClick={() => unblockIp(item.ip_address)}
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px solid var(--success)',
                                                    color: 'var(--success)',
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem',
                                                    fontSize: '0.875rem'
                                                }}>
                                                <Unlock size={14} /> Unblock
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

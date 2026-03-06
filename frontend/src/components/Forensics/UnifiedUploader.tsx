import React, { useState } from 'react';
import { Upload, Activity, AlertTriangle } from 'lucide-react';
import { API_V1_URL } from '../../config/api';

interface UnifiedUploaderProps {
    onUploadSuccess: (data: any) => void;
}

const UnifiedUploader: React.FC<UnifiedUploaderProps> = ({ onUploadSuccess }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_V1_URL}/ingestion/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || 'Analysis failed. Check file format.');
            }

            const data = await response.json();
            onUploadSuccess(data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="glass-card p-10 bg-slate-900/40 border-white/5 shadow-2xl rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="border-2 border-dashed border-slate-800 rounded-[2rem] p-12 hover:border-accent-primary/50 transition-all duration-500 text-center relative group/box bg-slate-950/40">
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-slate-900/80 flex items-center justify-center text-accent-primary shadow-2xl border border-white/10 group-hover/box:scale-110 group-hover/box:rotate-3 transition-all duration-500">
                        {isUploading ? <Activity className="w-10 h-10 animate-spin" /> : <Upload className="w-10 h-10" />}
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase text-gradient">
                            {isUploading ? 'Parsing intelligence Package...' : 'Inject Secure Data Cluster'}
                        </h4>
                        <p className="text-slate-500 max-w-sm mx-auto text-xs font-bold uppercase tracking-widest leading-relaxed">
                            Interrogate <span className="text-accent-primary">PCAP</span>, <span className="text-accent-secondary">CSV</span>, or <span className="text-emerald-500">System Logs</span> through our advanced forensic heuristic engine.
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-100">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    {error}
                </div>
            )}
        </div>
    );
};

export default UnifiedUploader;

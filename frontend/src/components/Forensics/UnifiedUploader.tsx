import React, { useState } from 'react';
import { Upload, Activity, AlertTriangle } from 'lucide-react';

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
            const response = await fetch('http://localhost:8000/api/v1/ingestion/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            onUploadSuccess(data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="glass-card p-6">
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 hover:border-slate-500 transition-all text-center relative group">
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-accent-primary shadow-lg shadow-accent-primary/20 group-hover:scale-110 transition-transform">
                        {isUploading ? <Activity className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-white mb-2">
                            {isUploading ? 'Analyzing Bundle...' : 'Select Analysis Package'}
                        </h4>
                        <p className="text-slate-400 max-w-xs mx-auto">
                            Click to browse or drag <span className="text-accent-primary">PCAP</span>, <span className="text-accent-secondary">CSV</span>, or <span className="text-emerald-400">Log</span> files.
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

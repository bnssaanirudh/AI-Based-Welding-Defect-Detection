import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
    Upload, 
    ShieldCheck, 
    Target, 
    ArrowRight, 
    Zap,
    Loader2,
    Activity
} from 'lucide-react';
import { API_BASE } from '../config';
import classNames from 'classnames';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';

export default function WeldingAnalysis() {
    const { token, fetchWithAuth } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overlay' | 'heat' | 'fused'>('overlay');
    
    // Advice state
    const [advice, setAdvice] = useState<string>("");
    const [gettingAdvice, setGettingAdvice] = useState(false);

    // Thermal state
    const [showThermal, setShowThermal] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setResult(null);
            setAdvice("");
        }
    };

    const runAnalysis = async () => {
        if (!file || !token) return;
        setAnalyzing(true);
        setResult(null);
        setAdvice("");

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetchWithAuth(`${API_BASE}/v1/analyze/image?threshold=0.4&explain=true`, {
                method: 'POST',
                body: formData
            });
            if (!res.ok) throw new Error('Analysis failed');
            const data = await res.json();
            setResult(data);
            
            // Auto-fetch advice
            fetchAdvice(data.summary);
        } catch (err) {
            console.error(err);
        } finally {
            setAnalyzing(false);
        }
    };

    const fetchAdvice = async (summary: any) => {
        setGettingAdvice(true);
        try {
            const res = await fetchWithAuth(`${API_BASE}/v1/advice`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    top_label: summary.top_label,
                    top_confidence: summary.top_confidence,
                    severity: summary.severity
                })
            });
            const data = await res.json();
            setAdvice(data.advice || data.message || "No specific advice available.");
        } catch (err) {
            console.error(err);
        } finally {
            setGettingAdvice(false);
        }
    };

    return (
        <DashboardLayout title="Deep Analysis">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20 px-4 md:px-0">
                
                {/* Control Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-6 border-blue-500/20 bg-slate-900/40">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <Zap className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">AI Pipeline</h3>
                                <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em] mt-0.5">Patent-Grade v4.0</p>
                            </div>
                        </div>

                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer text-center group bg-[#020617]
                                ${file ? 'border-blue-500/40 bg-blue-500/5' : 'border-slate-800 hover:border-blue-500/30'}`}
                        >
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            
                            {preview ? (
                                <div className="relative group">
                                    <img 
                                        src={preview} 
                                        alt="Input" 
                                        className={classNames(
                                            "w-full h-44 object-cover rounded-xl shadow-2xl transition-all duration-500",
                                            showThermal && "brightness-[1.2] contrast-[1.5] hue-rotate-[180deg] saturate-[2]"
                                        )}
                                    />
                                    {showThermal && (
                                        <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay rounded-xl pointer-events-none" />
                                    )}
                                </div>
                            ) : (
                                <div className="py-6">
                                    <div className="w-14 h-14 rounded-full bg-slate-800 mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-7 h-7 text-slate-500" />
                                    </div>
                                    <p className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Upload Specimen</p>
                                    <p className="text-slate-500 text-[10px] font-bold">RESEARCH GRADE (RAW/JPG/PNG)</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button 
                                onClick={() => setShowThermal(!showThermal)}
                                className={classNames(
                                    "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                                    showThermal ? "bg-orange-500/20 border-orange-500/50 text-orange-400" : "bg-slate-800 border-slate-700 text-slate-400"
                                )}
                            >
                                Thermal Fusion
                            </button>
                            <button className="flex-1 py-2 rounded-lg text-[10px] bg-slate-800 border-slate-700 text-slate-400 font-black uppercase tracking-widest">
                                ISO Scan
                            </button>
                        </div>

                        <button
                            onClick={runAnalysis}
                            disabled={!file || analyzing}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white mt-6 py-4 rounded-xl font-black uppercase tracking-[0.15em] text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Run Deep Analysis <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </div>

                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            {/* Integrity Score */}
                            <div className="glass-card p-6 border-blue-500/20 bg-slate-900/40">
                                <div className="flex items-center gap-2 mb-4">
                                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                                    <h3 className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Integrity Pulse</h3>
                                </div>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-6xl font-black text-white italic tracking-tighter">{result.integrity_score}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${result.integrity_score}%` }} />
                                </div>
                            </div>

                            {/* Verification SHA-256 */}
                            <div className="glass-card p-4 border-slate-800 bg-[#020617] font-mono">
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center justify-between">
                                    Auth Fingerprint <Target className="w-3 h-3" />
                                </p>
                                <p className="text-[10px] text-blue-400/60 break-all leading-tight">
                                    {result.patent_metadata.verification_hash}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Primary Results Display */}
                    <div className="glass-card p-1 min-h-[500px] flex flex-col bg-[#020617] border-slate-800">
                        <div className="flex p-2 gap-2 border-b border-slate-800 overflow-x-auto scrollbar-hide">
                            {['overlay', 'heat', 'fused'].map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={classNames(
                                        "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                        activeTab === tab ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "text-slate-500 hover:text-white"
                                    )}
                                >
                                    {tab === 'overlay' ? 'Optical Scan' : tab === 'heat' ? 'Neural Activation' : 'Fusion Depth'}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 relative flex items-center justify-center p-4">
                            {!result ? (
                                <div className="text-center opacity-30 group">
                                    <Activity className="w-20 h-20 text-slate-700 mx-auto mb-4 animate-pulse group-hover:scale-110 transition-transform" />
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">System Ready for Input</p>
                                </div>
                            ) : (
                                <div className="w-full h-full relative">
                                    <img 
                                        src={`data:image/jpeg;base64,${
                                            activeTab === 'overlay' ? result.images.overlay_jpeg_base64 :
                                            activeTab === 'heat' ? result.explainability.prob_map_png_base64 :
                                            result.explainability.fused_map_png_base64
                                        }`} 
                                        className="w-full h-full object-contain rounded-xl shadow-[0_0_50px_rgba(37,99,235,0.15)]"
                                        alt="Result" 
                                    />
                                    <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-black text-blue-400 tracking-[0.2em] uppercase">
                                        Confirmed: {result.summary.top_label} ({(result.summary.top_confidence*100).toFixed(1)}%)
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Patent-Grade Visualizers */}
                    {result && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Digital Twin Synchronizer */}
                            <div className="glass-card p-6 border-slate-800 bg-[#020617] h-64 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Digital Twin (DTS)</h3>
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                                </div>
                                <div className="flex-1 flex items-center justify-center border-l border-b border-slate-800 relative overflow-hidden bg-slate-900/20 rounded-bl-xl">
                                    <svg viewBox="0 0 200 100" className="w-full h-full p-4">
                                        <path 
                                            d="M 20 80 Q 50 10 100 80 T 180 80" 
                                            fill="none" 
                                            stroke="url(#grad)" 
                                            strokeWidth="2" 
                                            className="animate-[dash_3s_linear_infinite]"
                                            strokeDasharray="5,5"
                                        />
                                        <defs>
                                            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#2563eb" />
                                                <stop offset="100%" stopColor="#60a5fa" />
                                            </linearGradient>
                                        </defs>
                                        {result.patent_metadata.dts_coordinates.map((c: any, i: number) => (
                                            <circle key={i} cx={40 + i*12} cy={50 + c.y} r={1.5 + c.tension} fill={c.tension > 0.8 ? '#ef4444' : '#3b82f6'} opacity={0.8} />
                                        ))}
                                    </svg>
                                    <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-500">X-Y-Z CLOUD MAPPING</div>
                                </div>
                            </div>

                            {/* Acoustic Signature Analysis */}
                            <div className="glass-card p-6 border-slate-800 bg-[#020617] h-64 flex flex-col">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Acoustic Signature</h3>
                                <div className="flex-1 flex items-end gap-1.5 pb-2">
                                    {result.patent_metadata.acoustic_signature.map((val: number, i: number) => (
                                        <div 
                                            key={i} 
                                            className="bg-blue-600/60 flex-1 rounded-t-sm hover:bg-blue-400 transition-all cursor-crosshair min-h-[4px]"
                                            style={{ height: `${val * 4}%` }}
                                            title={`Freq ${i*100}Hz: ${val}dB`}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-between text-[8px] font-black text-slate-600 tracking-tighter uppercase mt-2">
                                    <span>20Hz</span>
                                    <span>Frequency Distribution</span>
                                    <span>22kHz</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Repair Protocol */}
                    <div className="glass-card p-8 border-l-4 border-l-blue-600 bg-slate-900/40">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-600/20">
                                    <Zap className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Protocol Generator</h3>
                                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em]">Compliance Assessment Ready</p>
                                </div>
                            </div>
                            {gettingAdvice && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                        </div>

                        {advice && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="p-6 bg-[#020617] rounded-2xl border border-slate-800 text-slate-300 text-sm font-medium leading-relaxed border-l-2 border-l-blue-400">
                                    {advice}
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <button className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-105 transition-all">
                                        Download NIST-Cert
                                    </button>
                                    <button className="px-5 py-2.5 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-700 hover:text-white transition-all">
                                        Sync to Digital Twin
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}

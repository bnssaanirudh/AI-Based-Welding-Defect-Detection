import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
    Upload, 
    ShieldCheck, 
    Target, 
    ArrowRight, 
    Zap,
    Loader2,
    Activity,
    Camera,
    Play,
    Pause
} from 'lucide-react';
import Webcam from 'react-webcam';
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
    const [advice, setAdvice] = useState<{summary: string, actions: string[]} | null>(null);
    const [gettingAdvice, setGettingAdvice] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Live mode state
    const [isLive, setIsLive] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const webcamRef = useRef<Webcam>(null);
    const streamIntervalRef = useRef<any>(null);

    // Video file state
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVideo, setIsVideo] = useState(false);

    // Thermal state
    const [showThermal, setShowThermal] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setIsVideo(selected.type.startsWith('video/'));
            setResult(null);
            setAdvice(null);
            if (isStreaming) stopStreaming();
        }
    };

    const stopStreaming = () => {
        if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
            streamIntervalRef.current = null;
        }
        setIsStreaming(false);
    };

    const startStreaming = () => {
        setIsStreaming(true);
        streamIntervalRef.current = setInterval(() => {
            captureFrame();
        }, 1500); // Analysis every 1.5s
    };

    const captureFrame = async () => {
        let imageSrc: string | null = null;
        
        if (isLive && webcamRef.current) {
            imageSrc = webcamRef.current.getScreenshot();
        } else if (isVideo && videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(videoRef.current, 0, 0);
            imageSrc = canvas.toDataURL('image/jpeg');
        }

        if (imageSrc) {
            const blob = await (await fetch(imageSrc)).blob();
            const frameFile = new File([blob], "frame.jpg", { type: "image/jpeg" });
            runAnalysis(frameFile);
        }
    };

    const runAnalysis = async (overrideFile?: File) => {
        const targetFile = overrideFile || file;
        if (!targetFile || !token) return;
        
        if (!overrideFile) setAnalyzing(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', targetFile);

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
            setError("Analysis failed. Backend might be offline.");
        } finally {
            if (!overrideFile) setAnalyzing(false);
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
            setAdvice({
                summary: data.summary || "Actionable insights for the detected anomaly.",
                actions: data.actions || []
            });
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
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <Zap className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white tracking-tight">AI Pipeline</h3>
                                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em] mt-0.5">Patent-Grade v4.0</p>
                                </div>
                            </div>
                            <div className="flex bg-[#020617] p-1 rounded-lg border border-slate-800">
                                <button 
                                    onClick={() => { setIsLive(false); stopStreaming(); }}
                                    className={classNames("p-2 rounded-md transition-all", !isLive ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300")}
                                    title="Upload Mode"
                                >
                                    <Upload className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setIsLive(true)}
                                    className={classNames("p-2 rounded-md transition-all", isLive ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300")}
                                    title="Live Mode"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {!isLive ? (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer text-center group bg-[#020617]
                                    ${file ? 'border-blue-500/40 bg-blue-500/5' : 'border-slate-800 hover:border-blue-500/30'}`}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                    accept="image/*,video/*" 
                                />
                                
                                {preview ? (
                                    <div className="relative group">
                                        {isVideo ? (
                                            <video 
                                                ref={videoRef}
                                                src={preview} 
                                                className="w-full h-44 object-cover rounded-xl shadow-2xl"
                                                loop
                                                muted
                                            />
                                        ) : (
                                            <img 
                                                src={preview} 
                                                alt="Input" 
                                                className={classNames(
                                                    "w-full h-44 object-cover rounded-xl shadow-2xl transition-all duration-500",
                                                    showThermal && "brightness-[1.2] contrast-[1.5] hue-rotate-[180deg] saturate-[2]"
                                                )}
                                            />
                                        )}
                                        {showThermal && !isVideo && (
                                            <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay rounded-xl pointer-events-none" />
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-6">
                                        <div className="w-14 h-14 rounded-full bg-slate-800 mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Upload className="w-7 h-7 text-slate-500" />
                                        </div>
                                        <p className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Upload Specimen</p>
                                        <p className="text-slate-500 text-[10px] font-bold">RESEARCH GRADE (IMG/VID)</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-blue-500/30 h-44">
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    className="w-full h-full object-cover"
                                    videoConstraints={{ facingMode: "environment" }}
                                />
                                <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 rounded text-[8px] font-black text-white animate-pulse uppercase tracking-widest">
                                    LIVE FEED
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px] font-bold text-center">
                                {error}
                            </div>
                        )}

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
                            onClick={() => {
                                if (isLive || isVideo) {
                                    if (isStreaming) {
                                        stopStreaming();
                                        if (isVideo && videoRef.current) videoRef.current.pause();
                                    } else {
                                        startStreaming();
                                        if (isVideo && videoRef.current) videoRef.current.play();
                                    }
                                } else {
                                    runAnalysis();
                                }
                            }}
                            disabled={(!file && !isLive) || analyzing}
                            className={classNames(
                                "w-full mt-6 py-4 rounded-xl font-black uppercase tracking-[0.15em] text-xs shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50",
                                isStreaming ? "bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-600/20" : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
                            )}
                        >
                            {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                isLive || isVideo ? (
                                    <>
                                        {isStreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                        {isStreaming ? "Stop Streaming" : "Start Live Analysis"}
                                    </>
                                ) : (
                                    <>Run Deep Analysis <ArrowRight className="w-4 h-4" /></>
                                )
                            )}
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
                                    <p className="mb-4 text-white font-bold tracking-tight italic">"{advice.summary}"</p>
                                    <ul className="space-y-3">
                                        {advice.actions.map((act, idx) => (
                                            <li key={idx} className="flex gap-3">
                                                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-[10px] font-black shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <span className="text-[11px] font-medium leading-normal">{act}</span>
                                            </li>
                                        ))}
                                    </ul>
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

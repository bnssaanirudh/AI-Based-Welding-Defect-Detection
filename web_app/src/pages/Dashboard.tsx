import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, CheckCircle, TrendingUp, Loader2, Zap } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

export default function Dashboard() {
    const { user, token, fetchWithAuth } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token || !fetchWithAuth) return;
            try {
                // Fetch stats
                const statsRes = await fetchWithAuth(`${API_BASE}/v1/stats`);
                const statsData = await statsRes.json();

                // Fetch recent history
                const historyRes = await fetchWithAuth(`${API_BASE}/v1/history?limit=5`);
                const historyData = await historyRes.json();

                setStats([
                    { name: 'Total Welds Analyzed', value: statsData.total_welds.toLocaleString(), icon: Activity },
                    { name: 'Defect Rate', value: statsData.defect_rate, icon: AlertTriangle },
                    { name: 'Avg. Integrity Score', value: `${statsData.avg_integrity}%`, icon: CheckCircle },
                    { name: 'Avg. Confidence', value: statsData.avg_confidence, icon: TrendingUp },
                ]);

                setRecentActivity(historyData.map((item: any) => ({
                    id: item.id,
                    type: item.status === 'Needs Review' ? 'Defect Detected' : 'Analysis Complete',
                    detail: `Top feature: ${item.top_label} (Score: ${item.integrity_score})`,
                    time: new Date(item.date).toLocaleString(),
                    status: item.status === 'Needs Review' ? 'critical' : 'success'
                })));
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token]);

    return (
        <DashboardLayout title="Overview">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Intro */}
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {user?.full_name || 'Engineer'} 👋</h2>
                        <p className="text-white/60">Research-grade precision for your manufacturing pipeline.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        <div className="col-span-4 flex justify-center py-12">
                            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                        </div>
                    ) : stats?.map((stat: any, idx: number) => (
                        <motion.div
                            key={stat.name}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <stat.icon className="w-5 h-5 text-blue-400" />
                                </div>
                            </div>
                            <h3 className="text-3xl font-black text-white mb-1">{stat.value}</h3>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{stat.name}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Model Intelligence: Dataset & Capabilities (Full Width) */}
                <div className="glass-card p-8 border-slate-800 bg-[#020617] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-3xl rounded-full translate-x-32 -translate-y-32" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2 font-mono tracking-widest">AI Core V2.1</h3>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Model Intelligence</h2>
                            <p className="text-xs text-slate-500 mt-1 font-medium italic">Deep-learning foundation and identifiable defect signatures</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="text-right">
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Architecture</p>
                                <p className="text-sm font-bold text-white uppercase tracking-tighter">ResNet-50 / DeepLab</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Primary Dataset</p>
                                <p className="text-sm font-bold text-white uppercase tracking-tighter">Severstal Steel</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                        {[
                            { label: 'Rolled-in Scale', desc: 'Mill scale pressed into plate surface', severity: 'High' },
                            { label: 'Surface Patch', desc: 'Irregular localized texture anomalies', severity: 'Med' },
                            { label: 'Scratch', desc: 'Linear abrasions from processing/handling', severity: 'Low' },
                            { label: 'Inclusion', desc: 'Non-metallic particles trapped in metal', severity: 'Critical' },
                        ].map((cap, i) => (
                            <motion.div 
                                key={cap.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all group cursor-default"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${cap.severity === 'Critical' ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-500'}`}>
                                        {cap.severity}
                                    </span>
                                </div>
                                <p className="text-[11px] font-black text-white uppercase tracking-tight mb-2 group-hover:text-blue-400 transition-colors">
                                    {cap.label}
                                </p>
                                <p className="text-[10px] text-slate-500 leading-snug font-medium">
                                    {cap.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 rounded-xl bg-blue-600/5 border border-blue-500/10 flex items-center gap-4">
                        <Activity className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                            Trained on the <span className="text-white font-bold">Severstal Steel Defect Dataset</span>, ensuring robust identification across varied industrial conditions. Accuracy: <span className="text-blue-400 font-black">0.96+</span> for specialized segmentation.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="glass-card p-6 border-slate-800 bg-[#020617] h-[400px] flex flex-col">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Recent Activity</h3>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hide">
                                {loading ? (
                                    <div className="flex justify-center py-6">
                                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                    </div>
                                ) : recentActivity.length === 0 ? (
                                    <div className="text-center text-slate-600 py-6 text-xs font-bold uppercase tracking-widest italic">No analysis reports found.</div>
                                ) : recentActivity.map((activity, idx) => (
                                    <div key={activity.id} className="relative pl-6">
                                        {idx !== recentActivity.length - 1 && (
                                            <div className="absolute left-1.5 top-5 w-px h-full bg-slate-800" />
                                        )}
                                        <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-4 border-[#020617] ${activity.status === 'critical' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} />
                                        <p className="text-xs font-bold text-white uppercase tracking-tight">{activity.type}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 font-medium">{activity.detail}</p>
                                        <p className="text-[9px] text-slate-600 mt-1 font-black uppercase tracking-widest">{activity.time}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="glass-card p-6 border-slate-800 bg-[#020617] group hover:border-blue-500/30 transition-all">
                            <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4">Operational Status</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-white/60">System Health</span>
                                    <span className="text-xs font-bold text-green-500 uppercase">Optimal</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-3 h-3 text-blue-500" />
                                        <span className="text-xs text-white/60">Inference Speed</span>
                                    </div>
                                    <span className="text-xs font-bold text-blue-500 uppercase">18ms / Frame</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-white/60">Audit Verification</span>
                                    <span className="text-xs font-bold text-blue-500 uppercase">SHA-256 Enabled</span>
                                </div>
                            </div>
                        </div>

                        {/* Direct Action */}
                        <div className="glass-card p-6 border-slate-800 bg-blue-600/5 group hover:bg-blue-600/10 transition-colors">
                            <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4 italic">Next Step</h3>
                            <p className="text-xs text-slate-500 mb-6 leading-relaxed">Prepare the scanning system for high-resolution industrial analysis.</p>
                            <button 
                                onClick={() => navigate('/analysis')}
                                className="w-full inline-flex items-center justify-center p-3 rounded-lg bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                            >
                                Start Inspection Pipeline
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}

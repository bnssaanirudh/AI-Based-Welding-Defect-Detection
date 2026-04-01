import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Star, AlertCircle, CheckCircle2, Mail, ExternalLink } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import classNames from 'classnames';
import { API_BASE } from '../config';

export default function Feedback() {
    const { fetchWithAuth } = useAuth();
    const [rating, setRating] = useState(0);
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError("Please provide a star rating.");
            return;
        }
        setSubmitting(true);
        setError(null);

        try {
            const res = await fetchWithAuth(`${API_BASE}/v1/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, message })
            });

            if (!res.ok) throw new Error('Failed to submit feedback');
            
            setSuccess(true);
            setMessage('');
            setRating(0);
        } catch (err: any) {
            setError(err.message || "An error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout title="System Feedback">
            <div className="max-w-4xl mx-auto py-12 px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-4">
                        Industrial Feedback Loop
                    </h2>
                    <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
                        Your insights drive the evolution of our Patent-Grade AI. Contributions are logged for compliance and system optimization.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form Section */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-8 bg-[#020617] border-slate-800"
                    >
                        {success ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                                    <CheckCircle2 className="w-8 h-8 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Transmission Complete</h3>
                                <p className="text-slate-500 text-sm mb-8">Feedback has been securely logged to the industrial database.</p>
                                <button 
                                    onClick={() => setSuccess(false)}
                                    className="px-6 py-2 rounded-lg bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest"
                                >
                                    Submit Another
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
                                        System Satisfaction
                                    </label>
                                    <div className="flex gap-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className={classNames(
                                                    "w-12 h-12 rounded-xl border transition-all flex items-center justify-center group",
                                                    rating >= star 
                                                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20" 
                                                        : "bg-slate-900 border-slate-800 text-slate-600 hover:border-blue-500/50"
                                                )}
                                            >
                                                <Star className={classNames("w-5 h-5", rating >= star ? "fill-current" : "group-hover:text-blue-400")} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
                                        Technical Observations / Requests
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Describe your industrial requirements or report anomalies..."
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-300 text-sm h-40 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                                    />
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                                        <AlertCircle className="w-4 h-4" /> {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                                >
                                    {submitting ? "Transmitting..." : <>Deploy Feedback <Send className="w-4 h-4" /></>}
                                </button>
                            </form>
                        )}
                    </motion.div>

                    {/* Info Section */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="glass-card p-6 bg-blue-600/5 border-blue-500/20">
                            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Direct Channel
                            </h4>
                            <p className="text-slate-400 text-xs leading-relaxed mb-6">
                                Need immediate assistance or high-level technical consultation? Contact our engineering team directly via encrypted mail.
                            </p>
                            <a 
                                href="mailto:engineering@weldingai.corp"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-[10px] font-black uppercase tracking-widest hover:border-blue-500 transition-all"
                            >
                                Open Mail Client <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>

                        <div className="glass-card p-6 border-slate-800 bg-[#020617]">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Data Transparency</h4>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <p className="text-[11px] text-slate-500 leading-tight">All feedback is logged to an immutable CSV for compliance auditing.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <p className="text-[11px] text-slate-500 leading-tight">Direct integration with Google Workspace for automated report generation.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <p className="text-[11px] text-slate-500 leading-tight">Your IP and session data are stored securely to prevent industrial spam.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Target, ArrowRight, User, Mail, Lock, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const formData = new FormData();
                formData.append('username', email);
                formData.append('password', password);

                const res = await fetch(`${API_BASE}/v1/auth/login`, {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) throw new Error('Invalid credentials');
                const data = await res.json();
                login(data.access_token, data.full_name);
                navigate('/dashboard');
            } else {
                const res = await fetch(`${API_BASE}/v1/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, full_name: fullName }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.detail || 'Signup failed');
                }
                
                setIsLogin(true);
                setError('Account created! Please log in.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-950 flex">
            {/* Left side - Visuals */}
            <div className="hidden lg:flex flex-1 relative bg-dark-900 border-r border-white/5 items-center justify-center p-12 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary-900/40 via-dark-900 to-dark-950" />

                <div className="relative z-10 max-w-lg">
                    <Link to="/" className="flex items-center gap-2 mb-16 hover:opacity-80 transition-opacity">
                        <Target className="text-primary-400 w-8 h-8" />
                        <span className="text-2xl font-bold tracking-tight text-white">Welding<span className="text-primary-400">AI</span></span>
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
                            Elevate your <span className="text-primary-400">quality control</span> infrastructure
                        </h1>
                        <p className="text-white/60 text-lg leading-relaxed mb-8">
                            Join leading industries ensuring defect-free manufacturing through our specialized deep learning models.
                        </p>

                        <div className="flex items-center gap-4 text-white/80">
                            <div className="w-12 h-12 rounded-full bg-secondary-500/20 flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-secondary-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">Enterprise Grade Security</p>
                                <p className="text-sm text-white/50">Your analysis data is kept entirely confidential.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24">
                {/* Mobile Logo */}
                <div className="lg:hidden flex items-center justify-center gap-2 mb-12">
                    <Target className="text-primary-400 w-8 h-8" />
                    <span className="text-2xl font-bold tracking-tight text-white">Welding<span className="text-primary-400">AI</span></span>
                </div>

                <div className="w-full max-w-sm mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">{isLogin ? 'Welcome back' : 'Create an account'}</h2>
                        <p className="text-white/60">
                            {isLogin ? 'Enter your details to access your dashboard' : 'Start ensuring defect-free production'}
                        </p>
                    </div>

                    {error && (
                        <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${error.includes('created') ? 'bg-secondary-500/10 text-secondary-400' : 'bg-red-500/10 text-red-400'}`}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <label className="block text-sm font-medium text-white/80 mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                        <input
                                            type="text"
                                            required={!isLogin}
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full btn-primary flex justify-center items-center gap-2 mt-6 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-white/60">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
                            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                        >
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Activity, Target, Users, ArrowRight, CheckCircle, Factory, Database, Award } from 'lucide-react';
import { API_BASE } from '../config';

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
            {/* Structured Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20" />
            <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none blur-3xl" />

            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-[#020617]/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Target className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white italic">Weld<span className="text-blue-500">Lens</span> <span className="text-[10px] uppercase tracking-[0.2em] font-medium bg-blue-500/10 px-2 py-0.5 rounded text-blue-400 align-middle ml-1">Enterprise</span></span>
                    </div>
                    
                    <div className="hidden lg:flex gap-10 text-sm font-semibold tracking-wide uppercase text-slate-400">
                        <a href="#platform" className="hover:text-blue-400 transition-colors">Platform</a>
                        <a href="#solutions" className="hover:text-blue-400 transition-colors">Solutions</a>
                        <a href="#compliance" className="hover:text-blue-400 transition-colors">Compliance</a>
                    </div>

                    <div className="flex items-center gap-5">
                        <Link to="/auth" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors hidden sm:block">Client Login</Link>
                        <Link to="/auth" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-600/20">
                            Request Demo
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-24 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerChildren}
                        className="lg:w-1/2 text-left z-10"
                    >
                        <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-[1.05] tracking-tight">
                            AI-Assisted<br />
                            <span className="text-blue-500 font-black">Welding Analysis.</span>
                        </motion.h1>
                        <motion.p variants={fadeIn} className="text-lg md:text-xl text-slate-400 mb-10 max-w-xl leading-relaxed font-medium">
                            An assistive tool designed for operators and engineers. Utilize computer vision to help identify potential defects and streamline your quality documentation process.
                        </motion.p>
                        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-5">
                            <Link to="/auth" className="bg-white text-[#020617] hover:bg-slate-200 px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 shadow-xl">
                                Launch Platform <ArrowRight className="w-5 h-5" />
                            </Link>
                            <a href={`${API_BASE}/v1/research/whitepaper`} target="_blank" rel="noopener noreferrer" className="border border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/5 px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 group">
                                <Award className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                                Technical Whitepaper
                            </a>
                        </motion.div>
                        
                        <motion.div variants={fadeIn} className="mt-12 flex items-center gap-8 grayscale opacity-50">
                            <div className="flex items-center gap-2 text-sm font-bold"><ShieldCheck className="w-5 h-5" /> AWS D1.1</div>
                        </motion.div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="lg:w-1/2 relative"
                    >
                        <div className="absolute -inset-4 bg-blue-500/10 blur-3xl rounded-full" />
                        <div className="relative bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/40">
                            <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-700" />
                                <div className="w-3 h-3 rounded-full bg-slate-700" />
                                <div className="w-3 h-3 rounded-full bg-slate-700" />
                            </div>
                            <div className="p-1 aspect-[16/10] bg-[#020617] flex items-center justify-center relative overflow-hidden">
                                <Activity className="w-20 h-20 text-blue-500/20 absolute animate-pulse" />
                                <div className="z-10 text-center">
                                    <div className="w-64 h-40 border border-blue-500/30 rounded flex items-center justify-center relative bg-blue-500/5">
                                        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-blue-500" />
                                        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-blue-500" />
                                        <span className="text-[10px] text-blue-400 font-mono">SCANNING UNIT 09241...</span>
                                    </div>
                                    <div className="mt-4 flex gap-2 justify-center">
                                        <div className="h-1 w-16 bg-blue-500 rounded-full" />
                                        <div className="h-1 w-8 bg-slate-700 rounded-full" />
                                        <div className="h-1 w-8 bg-slate-700 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>


            {/* Structured Features Section */}
            <section id="platform" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <span className="text-blue-500 font-bold text-xs uppercase tracking-widest mb-4 inline-block">Unparalleled Capabilities</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">The Future of Industrial Quality.</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { 
                                icon: Database, 
                                title: "Digital Twin Integration", 
                                desc: "Sync every inspection with a 3D digital duplicate for life-cycle management and predictive maintenance." 
                            },
                            { 
                                icon: Activity, 
                                title: "Explainable Core (XAI)", 
                                desc: "Our patented Guided Grad-CAM v4.0 provides detailed visual evidence for every diagnostic decision made by the model." 
                            },
                            { 
                                icon: Factory, 
                                title: "Enterprise Scalability", 
                                desc: "Deploy across distributed plant locations with real-time zone mapping and centralized security auditing." 
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="relative p-[1px] rounded-2xl bg-gradient-to-b from-slate-700/50 to-transparent hover:from-blue-500/50 transition-all duration-500">
                                <div className="bg-[#020617] rounded-2xl p-8 h-full border border-slate-800 hover:border-blue-500/20 transition-all group relative overflow-hidden">
                                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-500/5 blur-2xl group-hover:bg-blue-500/10 transition-all" />
                                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all text-blue-400 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4 leading-snug">{feature.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed font-medium">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Compliance Section */}
            <section id="compliance" className="py-32 bg-blue-600">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 leading-tight">Zero-Compromise Security.</h2>
                    <p className="text-xl text-blue-100 font-medium mb-12 max-w-2xl mx-auto opacity-90">
                        Every report is cryptographically signed and archived with SHA-256 verification, ensuring audit-ready data for any regulatory framework.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        {["End-to-End Encryption", "Role-Based Access", "Automatic Verification", "SSO Integration"].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white/10 px-5 py-2.5 rounded-full text-white text-sm font-bold backdrop-blur-sm border border-white/20">
                                <CheckCircle className="w-4 h-4" /> {item}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Enterprise Team Section */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-white mb-20 tracking-tight">Engineering Leadership</h2>
                    <div className="grid md:grid-cols-3 gap-16">
                        {[
                            { name: "A Veda Varshini", role: "Chief Systems Architect" },
                            { name: "B Agasthya Anirudh", role: "Lead Machine Learning Engineer" },
                            { name: "E Lavan Kumar", role: "Head of Infrastructure" }
                        ].map((dev, i) => (
                            <div key={i} className="group">
                                <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto mb-6 border-4 border-slate-900 shadow-xl group-hover:border-blue-500 transition-all flex items-center justify-center">
                                    <Users className="w-8 h-8 text-slate-600" />
                                </div>
                                <h4 className="text-xl font-bold text-white mb-1">{dev.name}</h4>
                                <p className="text-blue-500 text-xs font-black uppercase tracking-widest">{dev.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 bg-[#020617] border-t border-slate-800">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-extrabold text-white mb-8">Ready to modernize your QA pipeline?</h2>
                    <Link to="/auth" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-xl text-xl font-black transition-all shadow-2xl shadow-blue-600/30">
                        Get Started Today <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 border-t border-slate-900 py-16 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="text-blue-500 w-6 h-6" />
                            <span className="text-xl font-bold text-white italic">Weld<span className="text-blue-500">Lens</span></span>
                        </div>
                        <p className="text-slate-500 text-sm max-w-xs leading-relaxed font-medium">
                            Setting the gold standard for AI-driven welding analysis and infrastructure compliance.
                        </p>
                    </div>
                    <div className="flex gap-12 text-sm text-slate-400 font-bold uppercase tracking-widest">
                        <a href="#" className="hover:text-blue-400">Privacy</a>
                        <a href="#" className="hover:text-blue-400">Security</a>
                        <a href="#" className="hover:text-blue-400">Contact</a>
                    </div>
                    <div className="text-slate-600 text-[11px] font-bold uppercase tracking-[0.2em]">
                        © 2026 WeldLens Global
                    </div>
                </div>
            </footer>
        </div>
    );
}

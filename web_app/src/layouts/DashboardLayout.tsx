import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Target, LayoutDashboard, Search, FileText, MessageSquare, LogOut, Menu } from 'lucide-react';
import classNames from 'classnames';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
    children: React.ReactNode;
    title: string;
}

export default function DashboardLayout({ children, title }: LayoutProps) {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Welding Analysis', href: '/analysis', icon: Search },
        { name: 'Reports Archive', href: '/reports', icon: FileText },
        { name: 'AI Assistant', href: '/assistant', icon: MessageSquare },
        { name: 'Community Feedback', href: '/feedback', icon: MessageSquare },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const SidebarContent = () => (
        <>
            <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
                <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Target className="text-blue-500 w-6 h-6" />
                    <span className="text-xl font-bold tracking-tight text-white italic">Weld<span className="text-blue-500">Lens</span></span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsSidebarOpen(false)}
                            className={classNames(
                                isActive
                                    ? 'bg-blue-500/10 text-blue-400 font-medium border border-blue-500/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white',
                                'group flex items-center px-3 py-2.5 text-sm rounded-xl transition-all duration-200'
                            )}
                        >
                            <item.icon
                                className={classNames(
                                    isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-white/80',
                                    'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-white/10 bg-dark-950/50">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-900/40">
                        {user?.full_name?.substring(0, 2).toUpperCase() || 'US'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user?.full_name || 'Authenticated User'}</p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-black">Industrial Analyst</p>
                    </div>
                </div>
                <button 
                    onClick={logout}
                    className="flex items-center px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all w-full group"
                >
                    <LogOut className="mr-3 h-5 w-5 text-slate-500 group-hover:text-red-400" />
                    Sign Out
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-[#020617] overflow-hidden text-slate-300">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 flex-shrink-0 border-r border-slate-800 bg-[#020617] flex-col relative z-20">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <div 
                className={classNames(
                    "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity lg:hidden",
                    isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={toggleSidebar}
            />

            {/* Mobile Sidebar Content */}
            <aside 
                className={classNames(
                    "fixed inset-y-0 left-0 w-72 bg-[#020617] border-r border-slate-800 z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative min-w-0 overflow-hidden">
                {/* Background Grid Accent */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-[0.03] pointer-events-none" />

                {/* Top Header */}
                <header className="h-16 flex-shrink-0 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 z-30">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={toggleSidebar}
                            className="p-1.5 rounded-lg bg-slate-800/50 text-slate-400 lg:hidden hover:text-white"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
                    </div>
                </header>

                {/* Scrollable Main Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 scrollbar-hide">
                    {children}
                </main>
            </div>
        </div>
    );
}

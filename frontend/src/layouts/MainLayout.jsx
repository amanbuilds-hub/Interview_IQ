import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, LogOut, PanelLeft, PlusCircle, UserCircle } from 'lucide-react';

export default function MainLayout({ children }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navItems = [
        { title: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
        { title: 'My Resumes', icon: <FileText className="w-5 h-5" />, path: '/upload' },
        { title: 'Interviews', icon: <PlusCircle className="w-5 h-5" />, path: '/setup' },
        { title: 'Profile', icon: <UserCircle className="w-5 h-5" />, path: '/profile' },
    ];

    return (
        <div className="min-h-screen flex bg-background">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 bg-black/20 backdrop-blur-xl hidden md:flex flex-col">
                <div className="p-8">
                    <h1 className="text-2xl font-bold gradient-text">InterviewIQ</h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === item.path
                                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20'
                                    : 'text-white/50 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.title}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5 space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-white/40 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Log out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-20 border-b border-white/5 flex items-center px-8 md:hidden">
                    <h1 className="text-xl font-bold gradient-text">InterviewIQ</h1>
                </header>
                <div className="p-10 max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

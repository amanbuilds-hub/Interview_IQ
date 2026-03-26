import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, LogOut, Calendar, Award, X, Save, Lock } from 'lucide-react';

export default function Profile() {
    const { user, logout, updateProfile } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: user?.name, password: '' });
    const [isUpdating, setIsUpdating] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        const success = await updateProfile(formData);
        if (success) setIsModalOpen(false);
        setIsUpdating(false);
    };

    return (
        <MainLayout>
            <header className="mb-12">
                <h2 className="text-4xl font-bold mb-3">User Profile</h2>
                <p className="text-white/40">Manage your account information and preferences.</p>
            </header>

            <div className="max-w-3xl glass p-12 rounded-[3.5rem] relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                    <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-6xl font-black shadow-2xl shadow-indigo-500/20 ring-8 ring-white/5">
                        {user?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-4xl font-bold mb-2">{user?.name}</h3>
                        <p className="text-indigo-400 font-medium mb-6 uppercase tracking-widest text-sm flex items-center justify-center md:justify-start gap-2">
                            <Shield className="w-4 h-4" /> Professional Tier {user?.role === 'admin' ? '(Admin)' : ''}
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-sm text-white/60">
                                <Mail className="w-4 h-4" /> {user?.email}
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-sm text-white/60">
                                <Calendar className="w-4 h-4" /> Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 relative z-10">
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-indigo-500/20 transition-all group">
                        <h4 className="font-bold mb-4 flex items-center gap-3">
                            <Award className="w-5 h-5 text-indigo-400" /> Account Settings
                        </h4>
                        <p className="text-sm text-white/40 leading-relaxed mb-6">Change your name, update your password, or manage your account data.</p>
                        <button onClick={() => setIsModalOpen(true)} className="text-indigo-400 text-sm font-bold group-hover:underline">Manage Settings →</button>
                    </div>
                    <div className="p-8 rounded-3xl bg-red-400/5 border border-red-400/5 hover:border-red-400/20 transition-all group">
                        <h4 className="font-bold mb-4 flex items-center gap-3 text-red-400">
                            <LogOut className="w-5 h-5" /> Safety & Logout
                        </h4>
                        <p className="text-sm text-white/40 leading-relaxed mb-6">Once you logout, you will need to re-authenticate to access your interview recordings and reports.</p>
                        <button onClick={logout} className="text-red-400 text-sm font-bold group-hover:underline">Confirm Logout →</button>
                    </div>
                </div>

                {/* Backdrop Decorative Circle */}
                <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-indigo-600/10 blur-[100px] z-0 rounded-full" />
            </div>

            {/* Settings Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-black/40">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass p-10 rounded-[3rem] w-full max-w-lg relative"
                        >
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-white/40 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>

                            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                <Award className="w-6 h-6 text-indigo-400" /> Account Settings
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2 px-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input-field pl-12"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/60 mb-2 px-1">New Password (Optional)</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="input-field pl-12"
                                            placeholder="Min 8 characters"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 btn-secondary text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="flex-2 btn-primary flex items-center justify-center gap-2 text-sm"
                                    >
                                        {isUpdating ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </MainLayout>
    );
}

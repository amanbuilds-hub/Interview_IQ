import { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../layouts/MainLayout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Award, Clock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/interview/my-interviews`);
                setInterviews(res.data.data);
            } catch (err) {
                toast.error('Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchInterviews();
    }, []);

    const stats = [
        { title: 'Total Interviews', value: interviews.length, icon: <CheckCircle2 className="w-5 h-5 text-indigo-400" /> },
        {
            title: 'Average Score',
            value: interviews.length > 0
                ? Math.round(interviews.reduce((acc, curr) => acc + (curr.report?.overallScore || 0), 0) / interviews.length) + '%'
                : '0%',
            icon: <Award className="w-5 h-5 text-purple-400" />
        },
        {
            title: 'Completed',
            value: interviews.filter(i => i.status === 'Completed').length,
            icon: <Clock className="w-5 h-5 text-pink-400" />
        },
    ];

    return (
        <MainLayout>
            <header className="mb-12">
                <h2 className="text-4xl font-bold mb-3">Hi there! 👋</h2>
                <p className="text-white/40">Ready to level up your interview game?</p>
            </header>

            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass p-6 rounded-2xl flex items-center justify-between"
                    >
                        <div>
                            <p className="text-white/40 text-sm mb-1">{stat.title}</p>
                            <h3 className="text-2xl font-bold">{stat.value}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5">{stat.icon}</div>
                    </motion.div>
                ))}
            </section>

            {/* Recent Activity */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Recent Interviews</h3>
                    <Link to="/setup" className="text-indigo-400 text-sm hover:underline">New Interview</Link>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 glass rounded-2xl animate-pulse" />)}
                    </div>
                ) : interviews.length === 0 ? (
                    <div className="glass p-12 rounded-3xl text-center">
                        <p className="text-white/40 mb-6 font-light">You haven't taken any interviews yet.</p>
                        <Link to="/setup" className="btn-primary">Start your first interview</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {interviews.map((interview, i) => (
                            <motion.div
                                key={interview._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass p-6 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${interview.report?.overallScore >= 70 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                                        }`}>
                                        {interview.report?.overallScore || '--'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">{interview.role}</h4>
                                        <div className="flex items-center gap-4 text-xs text-white/40 mt-1">
                                            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(interview.createdAt).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-md">{interview.difficulty}</span>
                                        </div>
                                    </div>
                                </div>
                                <Link to={`/report/${interview._id}`} className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
                                    View Report <ArrowRight className="w-4 h-4" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </MainLayout>
    );
}

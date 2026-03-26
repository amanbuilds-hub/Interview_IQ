import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, Sparkles, Target, BarChart3, ArrowRight } from 'lucide-react';

export default function Landing() {
    return (
        <div className="min-h-screen">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold gradient-text">InterviewIQ</h1>
                <div className="flex gap-4">
                    <Link to="/login" className="btn-secondary">Log in</Link>
                    <Link to="/register" className="btn-primary">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="px-8 pt-20 pb-16 text-center max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6 inline-block">
                        Beta is now live →
                    </span>
                    <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
                        Master your next <br />
                        <span className="gradient-text">Interview with AI</span>
                    </h1>
                    <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
                        Experience real-world mock interviews powered by advanced LLMs.
                        Upload your resume, get personalized questions, and receive detailed feedback.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="btn-primary flex items-center gap-2 group">
                            Start Mock Interview <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button className="btn-secondary">View Demo</button>
                    </div>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="px-8 py-24 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard
                        icon={<Brain className="w-6 h-6 text-indigo-400" />}
                        title="AI Questioning"
                        description="Personalized questions based on your unique resume and target role."
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={<Target className="w-6 h-6 text-purple-400" />}
                        title="Real-time Evaluation"
                        description="Get graded instantly on your technical accuracy and communication style."
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={<Sparkles className="w-6 h-6 text-pink-400" />}
                        title="Study Roadmap"
                        description="Receive a tailored 30-day learning plan to fix your weak areas."
                        delay={0.3}
                    />
                    <FeatureCard
                        icon={<BarChart3 className="w-6 h-6 text-cyan-400" />}
                        title="Progress Analytics"
                        description="Track your growth over multiple attempts and monitor improvement."
                        delay={0.4}
                    />
                </div>
            </section>

            {/* Social Proof / Trust (Optional) */}
            <footer className="text-center py-12 border-t border-white/5 opacity-50 text-sm">
                &copy; 2026 InterviewIQ. Built for modern job seekers.
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="glass p-8 rounded-2xl hover:bg-white/10 transition-colors cursor-default"
        >
            <div className="mb-4 inline-block p-3 rounded-lg bg-white/5">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-white/50 leading-relaxed font-light">{description}</p>
        </motion.div>
    );
}

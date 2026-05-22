import { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, FileText, Target, Settings2, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InterviewSetup() {
    const [resumes, setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState('');
    const [role, setRole] = useState('');
    const [difficulty, setDifficulty] = useState('Intermediate');
    const [questionCount, setQuestionCount] = useState(5);
    const [focusAreas, setFocusAreas] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const res = await axios.get(`${API_URL}/resume/my-resumes`);
                setResumes(res.data.data);
                if (res.data.data.length > 0) setSelectedResume(res.data.data[0]._id);
            } catch (err) {
                toast.error('Failed to load resumes');
            }
        };
        fetchResumes();
    }, []);

    const handleStart = async (e) => {
        e.preventDefault();
        if (!selectedResume || !role) {
            return toast.error('Please select a resume and target role');
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/interview/generate`, {
                resumeId: selectedResume,
                role,
                difficulty,
                questionCount,
                focusAreas: focusAreas.split(',').map(s => s.trim()).filter(Boolean)
            });
            toast.success('Interview questions generated!');
            navigate(`/interview/${res.data.data._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to start interview');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <header className="mb-12">
                <h2 className="text-4xl font-bold mb-3">Configure Interview</h2>
                <p className="text-white/40">Customize your session to get the most relevant experience.</p>
            </header>

            <div className="max-w-2xl mx-auto glass p-10 rounded-3xl">
                <form onSubmit={handleStart} className="space-y-8">
                    {/* Resume Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-white/60 ml-1 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-400" /> Select Resume
                        </label>
                        <select
                            className="input-field appearance-none bg-black/20"
                            value={selectedResume}
                            onChange={(e) => setSelectedResume(e.target.value)}
                            required
                        >
                            <option value="" disabled className="bg-zinc-900">Choose a resume...</option>
                            {resumes.map(r => (
                                <option key={r._id} value={r._id} className="bg-zinc-900">{r.fileName}</option>
                            ))}
                        </select>
                    </div>

                    {/* Target Role */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-white/60 ml-1 flex items-center gap-2">
                            <Target className="w-4 h-4 text-purple-400" /> Target Role
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. Senior Frontend Engineer"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Difficulty */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-white/60 ml-1 flex items-center gap-2">
                                <Settings2 className="w-4 h-4 text-pink-400" /> Difficulty
                            </label>
                            <select
                                className="input-field appearance-none bg-black/20"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <option value="Beginner" className="bg-zinc-900">Beginner</option>
                                <option value="Intermediate" className="bg-zinc-900">Intermediate</option>
                                <option value="Advanced" className="bg-zinc-900">Advanced</option>
                            </select>
                        </div>

                        {/* Focus Areas */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-white/60 ml-1 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-cyan-400" /> Focus Areas
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="React, AWS, Node.js"
                                value={focusAreas}
                                onChange={(e) => setFocusAreas(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Question Count */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-white/60 ml-1 flex items-center gap-2">
                            <Settings2 className="w-4 h-4 text-indigo-400" /> Number of Questions
                        </label>
                        <select
                            className="input-field appearance-none bg-black/20"
                            value={questionCount}
                            onChange={(e) => setQuestionCount(Number(e.target.value))}
                        >
                            {[...Array(15)].map((_, i) => (
                                <option key={i + 1} value={i + 1} className="bg-zinc-900">
                                    {i + 1} {i + 1 === 1 ? 'Question' : 'Questions'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 mt-4"
                    >
                        {loading ? (
                            <><Loader2 className="w-6 h-6 animate-spin" /> Preparing Questions...</>
                        ) : (
                            <><Play className="fill-current w-5 h-5" /> Start Mock Interview</>
                        )}
                    </button>
                </form>
            </div>
        </MainLayout>
    );
}

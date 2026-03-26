import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { Mic, MicOff, Send, Code, Type, Clock, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InterviewScreen() {
    const { id: interviewId } = useParams();
    const navigate = useNavigate();
    const [interview, setInterview] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [answerText, setAnswerText] = useState('');
    const [codeSnippet, setCodeSnippet] = useState('');
    const [isCodingMode, setIsCodingMode] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120); // 2 mins per question
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

    // 🎙️ Voice Recognition Setup
    const recognitionRef = useRef(null);

    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const res = await axios.get(`${API_URL}/interview/my-interviews`);
                const target = res.data.data.find(i => i._id === interviewId);
                setInterview(target);
                if (target) {
                    // Usually we'd fetch the specific current question from an API
                    // but for simplicity, we derive it from interview state if available
                    // but since we need the actual text, let's fetch it from another endpoint or assume populated.
                    // Let's assume we fetch the full interview with populated questions for now.
                }
            } catch (err) {
                toast.error('Failed to load interview');
            } finally {
                setLoading(false);
            }
        };
        fetchInterview();
    }, [interviewId]);

    // Handle Voice Implementation
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        setAnswerText(prev => prev + ' ' + event.results[i][0].transcript);
                    }
                }
            };

            recognitionRef.current = recognition;
        }
    }, []);

    // Timer Implementation
    useEffect(() => {
        if (timeLeft <= 0) {
            handleNext();
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const toggleVoice = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            toast.success('Voice recording stopped');
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
            toast.success('Listening...');
        }
    };

    const handleNext = async () => {
        if (!answerText && !codeSnippet && timeLeft > 0) {
            return toast.error('Please provide an answer or wait for time to run out');
        }

        setSubmitting(true);
        try {
            const res = await axios.post(`${API_URL}/interview/submit-answer`, {
                interviewId,
                questionId: interview.questions[interview.currentQuestionIndex]._id,
                answerText,
                codeSnippet: isCodingMode ? codeSnippet : ''
            });

            if (res.data.isLast) {
                toast.success('Interview complete! Generating report...');
                await axios.post(`${API_URL}/interview/finalize/${interviewId}`);
                navigate(`/report/${interviewId}`);
            } else {
                // Prepare for next question
                setInterview(prev => ({ ...prev, currentQuestionIndex: res.data.nextQuestionIndex }));
                setAnswerText('');
                setCodeSnippet('');
                setTimeLeft(120);
                toast.success('Answer submitted!');
            }
        } catch (err) {
            toast.error('Failed to submit answer');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>;

    const currentQ = interview?.questions[interview.currentQuestionIndex];

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Top Header */}
            <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between glass sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-bold gradient-text">InterviewIQ</h1>
                    <div className="h-6 w-px bg-white/10 hidden md:block" />
                    <div className="hidden md:flex items-center gap-3">
                        <span className="text-sm font-medium text-white/40">Progress:</span>
                        <div className="w-48 h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((interview?.currentQuestionIndex || 0) / (interview?.totalQuestions || 1)) * 100}%` }}
                                className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                            />
                        </div>
                        <span className="text-xs font-bold">{interview?.currentQuestionIndex + 1} / {interview?.totalQuestions}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono text-sm">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col lg:flex-row gap-8 p-8 max-w-[1600px] mx-auto w-full">
                {/* Left Side: Question */}
                <div className="flex-1 space-y-8">
                    <motion.div
                        key={interview?.currentQuestionIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass p-10 rounded-[2.5rem]"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 uppercase tracking-widest">
                                {currentQ?.category || 'Question'}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold border border-orange-500/20 uppercase tracking-widest">
                                {currentQ?.difficulty}
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold leading-snug mb-8">
                            {currentQ?.questionText || 'Loading your question...'}
                        </h2>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 italic text-white/40 text-sm leading-relaxed">
                            Tip: {currentQ?.suggestedAnswer || 'Aim for clarity and provide concrete examples from your past projects.'}
                        </div>
                    </motion.div>

                    {/* Mode Toggles */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsCodingMode(false)}
                            className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all ${!isCodingMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                        >
                            <Type className="w-5 h-5" /> Written Answer
                        </button>
                        <button
                            onClick={() => setIsCodingMode(true)}
                            className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all ${isCodingMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                        >
                            <Code className="w-5 h-5" /> Coding Task
                        </button>
                    </div>
                </div>

                {/* Right Side: Answer Input */}
                <div className="flex-1 flex flex-col gap-6 h-[calc(100vh-160px)]">
                    <AnimatePresence mode="wait">
                        {!isCodingMode ? (
                            <motion.div
                                key="text"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex-1 glass rounded-[2.5rem] p-8 flex flex-col relative"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <Type className="w-4 h-4 text-indigo-400" /> Your Response
                                    </h3>
                                    <button
                                        onClick={toggleVoice}
                                        className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 animate-pulse text-white shadow-lg shadow-red-500/50' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                                    >
                                        {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                                    </button>
                                </div>
                                <textarea
                                    className="flex-1 bg-transparent border-none outline-none resize-none text-lg text-white/80 placeholder-white/10 font-light"
                                    placeholder="Type your answer here or use voice to dictate..."
                                    value={answerText}
                                    onChange={(e) => setAnswerText(e.target.value)}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="code"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex-1 glass rounded-[2.5rem] overflow-hidden flex flex-col border border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.1)]"
                            >
                                <div className="px-6 py-4 bg-white/5 flex items-center justify-between border-b border-white/5">
                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                        <Code className="w-4 h-4 text-indigo-400" /> Editor
                                    </h3>
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400/20" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400/20" />
                                        <div className="w-3 h-3 rounded-full bg-green-400/20" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <Editor
                                        height="100%"
                                        defaultLanguage="javascript"
                                        theme="vs-dark"
                                        value={codeSnippet}
                                        onChange={(val) => setCodeSnippet(val)}
                                        options={{
                                            fontSize: 16,
                                            minimap: { enabled: false },
                                            padding: { top: 20 },
                                            smoothScrolling: true,
                                            cursorBlinking: 'smooth',
                                            fontFamily: 'JetBrains Mono, Fira Code, monospace',
                                        }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={handleNext}
                        disabled={submitting}
                        className="btn-primary py-5 text-xl rounded-[2rem] flex items-center justify-center gap-4 group"
                    >
                        {submitting ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                Confirm & Next Question
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </main>

            {/* Decorative Blur Elements */}
            <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[150px] -z-10 rounded-full" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[150px] -z-10 rounded-full" />
        </div>
    );
}

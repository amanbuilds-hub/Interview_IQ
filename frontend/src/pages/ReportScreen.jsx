import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, TrendingUp, BookOpen, Target, Loader2, Award, ArrowRight, Share2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export default function ReportScreen() {
    const { id: interviewId } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await axios.get(`${API_URL}/interview/my-interviews`);
                const target = res.data.data.find(i => i._id === interviewId);
                setReport(target?.report || null);
            } catch (err) {
                toast.error('Failed to load report');
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [interviewId]);

    const handleShare = async () => {
        const shareUrl = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'My InterviewIQ Performance Report',
                    text: `Check out my interview performance evaluation on InterviewIQ! Overall Score: ${report?.overallScore || 0}% (Grade: ${report?.grade || 'N/A'})`,
                    url: shareUrl,
                });
                toast.success('Shared successfully!');
            } else {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Link copied to clipboard!');
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                toast.error('Failed to share link');
            }
        }
    };

    const handleDownloadPDF = () => {
        const element = document.getElementById('report-content');
        if (!element) return;
        generatePDF(element);
    };

    const generatePDF = (element) => {
        const clonedElement = element.cloneNode(true);
        
        // Hide it off-screen but keep it in the DOM tree so html2canvas can measure styles
        clonedElement.style.position = 'absolute';
        clonedElement.style.left = '-9999px';
        clonedElement.style.top = '0';
        clonedElement.style.width = '1024px'; // Fixed width to ensure standard layout sizing
        clonedElement.style.padding = '32px';
        clonedElement.style.background = '#09090b';
        clonedElement.style.color = '#ffffff';
        document.body.appendChild(clonedElement);
        
        // Add header to clone
        const pdfHeader = document.createElement('div');
        pdfHeader.style.borderBottom = '1px solid rgba(255, 255, 255, 0.15)';
        pdfHeader.style.paddingBottom = '20px';
        pdfHeader.style.marginBottom = '30px';
        pdfHeader.innerHTML = `
            <h1 style="font-size: 28px; font-weight: bold; color: #ffffff; margin-bottom: 5px;">Interview IQ Diagnostic Report</h1>
            <p style="color: rgba(255, 255, 255, 0.4); font-size: 14px; margin: 0;">Generated on ${new Date().toLocaleDateString()} | Comprehensive diagnostic of your performance</p>
        `;
        clonedElement.insertBefore(pdfHeader, clonedElement.firstChild);

        // Standardize container backgrounds for PDF print representation
        const cards = clonedElement.querySelectorAll('.glass');
        cards.forEach(card => {
            card.style.background = 'rgba(255, 255, 255, 0.03)';
            card.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            card.style.borderRadius = '1.5rem';
            card.style.marginBottom = '20px';
        });

        const pdfPromise = (async () => {
            try {

                // Render elements to canvas using the color-space-aware html2canvas-pro
                const canvas = await html2canvas(clonedElement, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#09090b',
                    logging: false
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                const pdf = new jsPDF('p', 'in', 'letter');
                
                // standard page dimensions in inches
                const pageWidth = 8.5;
                const pageHeight = 11.0;
                const margin = 0.4;
                
                const printableWidth = pageWidth - (margin * 2); // 7.7 inches
                const printableHeight = pageHeight - (margin * 2); // 10.2 inches
                
                const imgWidth = printableWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                if (imgHeight <= printableHeight) {
                    pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
                } else {
                    // Multi-page PDF generation slicing
                    let heightLeft = imgHeight;
                    let position = 0;
                    let page = 1;
                    
                    pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
                    heightLeft -= printableHeight;
                    
                    while (heightLeft > 0) {
                        position = -(printableHeight * page) + margin;
                        pdf.addPage();
                        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
                        heightLeft -= printableHeight;
                        page++;
                    }
                }
                
                pdf.save(`InterviewIQ_Report_${interviewId}.pdf`);
            } catch (err) {
                console.error("PDF Generation failed:", err);
                throw err;
            } finally {
                if (clonedElement.parentNode) {
                    document.body.removeChild(clonedElement);
                }
            }
        })();

        toast.promise(
            pdfPromise,
            {
                loading: 'Generating PDF...',
                success: 'PDF downloaded successfully!',
                error: (err) => `Failed: ${err?.message || err}`
            }
        );
    };

    if (loading) return <MainLayout><div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div></MainLayout>;

    if (!report) return (
        <MainLayout>
            <div className="glass p-12 text-center rounded-[3rem]">
                <h2 className="text-3xl font-bold mb-4">Report is still being generated...</h2>
                <p className="text-white/40 mb-8">This usually takes about 30 seconds as our AI analyzes your performance.</p>
                <button onClick={() => window.location.reload()} className="btn-primary">Check Again</button>
            </div>
        </MainLayout>
    );

    return (
        <MainLayout>
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-bold mb-3">Interview IQ Report</h2>
                    <p className="text-white/40 leading-relaxed font-light">Comprehensive diagnostic of your performance and improvement roadmap.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleShare} className="btn-secondary flex items-center gap-2"><Share2 className="w-4 h-4" /> Share</button>
                    <button onClick={handleDownloadPDF} className="btn-primary flex items-center gap-2 px-8"><Download className="w-4 h-4" /> Download PDF</button>
                </div>
            </header>

            <div id="report-content">
                {/* Main Grid: Score + Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-1 glass rounded-[3rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden"
                    >
                        <div className="relative w-48 h-48 mb-8">
                            <svg width="192" height="192" className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96" cy="96" r="80"
                                    stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none"
                                />
                                <motion.circle
                                    cx="96" cy="96" r="80"
                                    stroke="url(#gradient)" strokeWidth="12" fill="none"
                                    strokeDasharray={2 * Math.PI * 80}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - (report.overallScore || 0) / 100) }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#a855f7" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-bold">{report.overallScore ?? 0}</span>
                                <span className="text-white/40 font-medium font-inter">Grade {report.grade || 'N/A'}</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Excellent Performance!</h3>
                        <p className="text-sm text-green-400 font-bold uppercase tracking-widest">{report.hiringRecommendation || 'Recommend'}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2 glass rounded-[3rem] p-10"
                    >
                        <div className="flex items-center gap-2 mb-6 text-indigo-400 font-bold uppercase tracking-wider text-sm">
                            <Target className="w-4 h-4" /> Performance Summary
                        </div>
                        <p className="text-xl leading-relaxed text-white/80 font-light italic mb-8 border-l-4 border-indigo-600 pl-8">
                            "{report.summary || 'No performance summary available for this report.'}"
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="font-bold flex items-center gap-2 text-green-400"><CheckCircle2 className="w-5 h-5" /> Top Strengths</h4>
                                <ul className="space-y-3">
                                    {report.strengths && report.strengths.length > 0 ? (
                                        report.strengths.map(s => <li key={s} className="text-sm bg-green-500/5 px-4 py-2 rounded-xl text-white/60">✦ {s}</li>)
                                    ) : (
                                        <li className="text-sm text-white/40 italic">No strengths listed.</li>
                                    )}
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-bold flex items-center gap-2 text-red-400"><XCircle className="w-5 h-5" /> Focus Areas</h4>
                                <ul className="space-y-3">
                                    {report.weaknesses && report.weaknesses.length > 0 ? (
                                        report.weaknesses.map(w => <li key={w} className="text-sm bg-red-500/5 px-4 py-2 rounded-xl text-white/60">✦ {w}</li>)
                                    ) : (
                                        <li className="text-sm text-white/40 italic">No focus areas listed.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* 30-Day Roadmap Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12 glass rounded-[3rem] p-12 bg-gradient-to-br from-indigo-900/10 to-transparent border-indigo-500/10"
                >
                    <div className="flex items-center gap-3 mb-10">
                        <TrendingUp className="w-7 h-7 text-indigo-400" />
                        <h3 className="text-3xl font-bold">Your 30-Day Mastery Plan</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {report.roadmap30Days && report.roadmap30Days.length > 0 ? (
                            report.roadmap30Days.map((step, i) => (
                                <div key={i} className="relative z-10 group">
                                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-lg mb-6 shadow-xl shadow-indigo-600/30 group-hover:scale-110 transition-transform">
                                        {i + 1}
                                    </div>
                                    <p className="text-lg font-medium mb-4 leading-tight group-hover:text-indigo-300 transition-colors">Step {i + 1}</p>
                                    <p className="text-white/40 leading-relaxed font-light">{step}</p>
                                    {i < 2 && <div className="hidden md:block absolute top-6 left-12 w-full h-[2px] bg-gradient-to-r from-indigo-600/50 to-transparent -z-10" />}
                                </div>
                            ))
                        ) : (
                            <p className="text-white/40 italic col-span-3 text-center">No roadmap available.</p>
                        )}
                    </div>
                </motion.section>

                {/* Question Breakdown */}
                <section className="mb-20">
                    <h3 className="text-2xl font-bold mb-8 pl-4">Question Breakdown</h3>
                    <div className="space-y-6">
                        {report.questionWiseFeedback && report.questionWiseFeedback.length > 0 ? (
                            report.questionWiseFeedback.map((q, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.01 }}
                                    className="glass p-8 rounded-[2.5rem] border hover:border-indigo-500/20 transition-all"
                                >
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1">
                                            <h4 className="text-xl font-bold mb-4">{q.questionText}</h4>
                                            <div className="flex gap-4 items-center mb-6">
                                                <span className="bg-white/5 py-1 px-3 rounded-lg text-xs font-bold uppercase tracking-wider">{q.category}</span>
                                                <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                                                <span className={(q.answerScore || 0) >= 70 ? 'text-green-400 font-bold' : 'text-yellow-400 font-bold'}>{q.answerScore || 0}% Fit</span>
                                            </div>
                                            <div className="p-6 bg-white/5 rounded-2xl flex gap-4">
                                                <BookOpen className="w-6 h-6 text-indigo-400 shrink-0" />
                                                <div>
                                                    <p className="font-bold text-sm mb-2">Mentor Feedback</p>
                                                    <p className="text-white/50 leading-relaxed font-light italic">{q.feedback || 'No feedback provided.'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:w-72 p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                                            <p className="font-bold text-sm mb-4 flex items-center gap-2 text-indigo-400"><Award className="w-4 h-4" /> Next Level Advice</p>
                                            <p className="text-sm text-white/50 leading-relaxed font-light">{q.suggestedImprovement || 'No improvement suggested.'}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-white/40 italic text-center">No question-wise feedback available.</p>
                        )}
                    </div>
                </section>
            </div>

            {/* Final Action */}
            <footer className="text-center pb-20">
                <Link to="/setup" className="btn-primary flex items-center gap-3 mx-auto max-w-fit px-12 py-5 text-xl">
                    Ready to Try Again? <ArrowRight className="w-6 h-6" />
                </Link>
            </footer>
        </MainLayout>
    );
}

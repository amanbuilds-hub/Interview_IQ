import { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../layouts/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, FileText, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResumeUpload() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

    const fetchResumes = async () => {
        try {
            const res = await axios.get(`${API_URL}/resume/my-resumes`);
            setResumes(res.data.data);
        } catch (err) {
            toast.error('Failed to load resumes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResumes();
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
        } else {
            toast.error('Please select a PDF file');
            setFile(null);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            await axios.post(`${API_URL}/resume/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Resume uploaded and parsed successfully!');
            setFile(null);
            fetchResumes();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <MainLayout>
            <header className="mb-12">
                <h2 className="text-4xl font-bold mb-3">Your Resumes</h2>
                <p className="text-white/40">Upload your latest resume to personalize your interviews.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Upload Section */}
                <section>
                    <div className="glass p-10 rounded-3xl border-dashed border-2 border-white/5 hover:border-indigo-500/50 transition-colors">
                        <h3 className="text-xl font-bold mb-6">Upload New Resume</h3>
                        <form onSubmit={handleUpload} className="space-y-6 text-center">
                            <label className="flex flex-col items-center justify-center cursor-pointer group">
                                <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
                                    <FileUp className="w-8 h-8 text-indigo-400" />
                                </div>
                                <p className="text-lg font-medium mb-1">{file ? file.name : 'Select PDF File'}</p>
                                <p className="text-sm text-white/40">Drop your file here or click to browse</p>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                />
                            </label>

                            {file && (
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing with AI...</>
                                    ) : (
                                        'Upload & Parse'
                                    )}
                                </button>
                            )}
                        </form>
                    </div>
                </section>

                {/* List Section */}
                <section>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        History <span className="text-sm font-normal text-white/40">({resumes.length})</span>
                    </h3>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="h-20 glass rounded-2xl animate-pulse" />
                        ) : resumes.length === 0 ? (
                            <div className="text-center py-12 glass rounded-2xl">
                                <FileText className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                <p className="text-white/40">No resumes uploaded yet</p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {resumes.map((resume, i) => (
                                    <motion.div
                                        key={resume._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="glass p-5 rounded-2xl flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-white/5">
                                                <FileText className="w-6 h-6 text-indigo-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold truncate max-w-[200px]">{resume.fileName}</h4>
                                                <div className="flex items-center gap-4 text-xs text-white/40 mt-1">
                                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-500" /> Parsed</span>
                                                    <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="p-3 rounded-xl bg-white/0 hover:bg-black/20 text-white/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}

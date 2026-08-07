import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ResumeUploader from '../components/ResumeUploader';
import { Clock, CheckCircle2, ChevronRight, FileText } from 'lucide-react';

const Dashboard = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploader, setShowUploader] = useState(false);
    const navigate = useNavigate();

    const fetchApplications = async () => {
        try {
            const res = await axios.get('/api/resume/applications');
            setApplications(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleUploadSuccess = () => {
        setShowUploader(false);
        fetchApplications();
    };

    if (loading) return <div className="text-center mt-20 text-textMuted">Loading dashboard...</div>;

    return (
        <div className="w-full max-w-6xl mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                    <p className="text-textMuted">Track and analyze your job applications.</p>
                </div>
                <button
                    onClick={() => setShowUploader(!showUploader)}
                    className="px-6 py-2 bg-primary hover:bg-primaryHover text-white font-medium rounded-lg transition-colors shadow-lg"
                >
                    {showUploader ? 'Cancel Analysis' : '+ New Analysis'}
                </button>
            </div>

            {showUploader && (
                <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
                    <ResumeUploader onUploadSuccess={handleUploadSuccess} />
                </div>
            )}

            <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-slate-700 pb-2">
                    <FileText className="text-accent" /> Recent Applications
                </h2>

                {applications.length === 0 ? (
                    <div className="bg-surface p-12 rounded-xl border border-slate-700 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <FileText className="text-slate-400 w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-medium mb-2 text-textMain">No Applications Yet</h3>
                        <p className="text-textMuted max-w-md">Click the button above to upload your resume and get AI-powered insights for your first job application.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {applications.map(app => (
                            <div
                                key={app._id}
                                className="bg-surface rounded-xl p-6 border border-slate-700 hover:border-primary/50 transition-colors cursor-pointer group flex flex-col"
                                onClick={() => navigate('/results', { state: { application: app } })}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-textMain group-hover:text-primary transition-colors">{app.role}</h3>
                                        <p className="text-textMuted text-sm font-medium">{app.company}</p>
                                    </div>
                                    <div className={`px-2 py-1 text-xs font-bold rounded flex items-center gap-1 ${app.atsScore >= 80 ? 'bg-success/20 text-success' : app.atsScore >= 50 ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger'}`}>
                                        {app.atsScore} ATS
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-700/50 flex justify-between items-center text-sm text-textMuted">
                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(app.dateApplied).toLocaleDateString()}</span>
                                    <span className="flex items-center text-primary group-hover:translate-x-1 transition-transform">View Details <ChevronRight className="w-4 h-4 ml-1" /></span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

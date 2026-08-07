import { useState } from 'react';
import axios from 'axios';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResumeUploader = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({ company: '', role: '', jobDescription: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please upload a resume PDF first.');
            return;
        }

        setLoading(true);
        setError('');

        const uploadData = new FormData();
        uploadData.append('resume', file);
        uploadData.append('company', formData.company);
        uploadData.append('role', formData.role);
        uploadData.append('jobDescription', formData.jobDescription);

        try {
            const res = await axios.post('/api/resume/analyze', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Pass the new application data to the parent or navigate to results
            if (onUploadSuccess) onUploadSuccess();
            navigate('/results', { state: { application: res.data } });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || 'An error occurred during analysis. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface p-6 md:p-8 rounded-xl shadow-lg border border-slate-700 w-full max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
                <UploadCloud />
                New Application Analysis
            </h2>

            {error && <div className="bg-danger/20 text-danger border border-danger/50 p-3 rounded mb-6">{error}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-textMuted mb-2 text-sm font-medium">Company Name</label>
                        <input
                            type="text" name="company" value={formData.company} onChange={handleInputChange} required
                            className="w-full bg-background border border-slate-600 rounded px-4 py-2 focus:border-primary focus:outline-none transition-colors"
                            placeholder="e.g. Google"
                        />
                    </div>
                    <div>
                        <label className="block text-textMuted mb-2 text-sm font-medium">Target Role</label>
                        <input
                            type="text" name="role" value={formData.role} onChange={handleInputChange} required
                            className="w-full bg-background border border-slate-600 rounded px-4 py-2 focus:border-primary focus:outline-none transition-colors"
                            placeholder="e.g. Frontend Engineer"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-textMuted mb-2 text-sm font-medium">Job Description</label>
                    <textarea
                        name="jobDescription" value={formData.jobDescription} onChange={handleInputChange} required rows="5"
                        className="w-full bg-background border border-slate-600 rounded px-4 py-2 focus:border-primary focus:outline-none transition-colors resize-y"
                        placeholder="Paste the full job description here..."
                    ></textarea>
                </div>

                <div>
                    <label className="block text-textMuted mb-2 text-sm font-medium">Upload Resume (PDF)</label>
                    <div className="relative border-2 border-dashed border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center hover:border-primary hover:bg-slate-800/50 transition-all cursor-pointer">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            required
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                        <p className="text-sm font-medium text-textMain">
                            {file ? file.name : "Drag and drop or click to upload PDF"}
                        </p>
                        <p className="text-xs text-textMuted mt-1">PDF max 5MB</p>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3 rounded transition-colors shadow-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                    {loading ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing with AI...</>
                    ) : (
                        'Analyze Resume'
                    )}
                </button>
            </form>
        </div>
    );
};

export default ResumeUploader;

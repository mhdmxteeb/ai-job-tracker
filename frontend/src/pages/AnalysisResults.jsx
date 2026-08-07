import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, AlertCircle, TrendingUp, Target, MessageSquare } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const AnalysisResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const application = location.state?.application;

    if (!application) {
        return <Navigate to="/dashboard" />;
    }

    // ATS Score Chart Data
    const atsData = [
        { name: 'Score', value: application.atsScore || 0 },
        { name: 'Remaining', value: 100 - (application.atsScore || 0) }
    ];
    const atsColor = application.atsScore >= 80 ? '#10b981' : application.atsScore >= 50 ? '#f59e0b' : '#ef4444';

    const CustomLabel = ({ viewBox }) => {
        const { cx, cy } = viewBox;
        return (
            <text x={cx} y={cy} fill={atsColor} className="text-3xl font-bold" dominantBaseline="central" textAnchor="middle">
                {application.atsScore}%
            </text>
        );
    };

    return (
        <div className="w-full max-w-6xl mx-auto py-8 px-4">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-textMuted hover:text-primary transition-colors mb-6"
            >
                <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-slate-700 pb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Analysis Results for <span className="text-primary">{application.role}</span></h1>
                    <p className="text-textMuted text-lg">at {application.company}</p>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold border ${application.finalVerdict === 'Strong' ? 'bg-success/10 text-success border-success/30' :
                    application.finalVerdict === 'Moderate' ? 'bg-warning/10 text-warning border-warning/30' :
                        'bg-danger/10 text-danger border-danger/30'
                    }`}>
                    Verdict: {application.finalVerdict || 'Unknown'}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* ATS Score Overview */}
                <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg col-span-1 lg:col-span-1 flex flex-col items-center justify-center">
                    <h2 className="text-xl font-bold mb-4 w-full text-left">ATS Compatibility</h2>
                    <div className="w-full h-48 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={atsData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell key="cell-0" fill={atsColor} />
                                    <Cell key="cell-1" fill="#334155" />
                                </Pie>
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold" style={{ color: atsColor }}>{application.atsScore}%</span>
                        </div>
                    </div>
                    <p className="text-textMuted text-sm text-center mt-4">
                        Keyword Match: <strong className="text-textMain">{application.keywordMatchPercentage}%</strong>
                    </p>
                </div>

                {/* Missing Keywords & Skills */}
                <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg col-span-1 lg:col-span-2">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Target className="text-warning" /> Keyword & Skill Gaps</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-md font-semibold text-textMuted mb-3">Missing Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                                {application.missingKeywords && application.missingKeywords.length > 0 ? application.missingKeywords.map((kw, i) => (
                                    <span key={i} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm border border-slate-700">{kw}</span>
                                )) : <span className="text-sm text-textMuted">None detected.</span>}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-md font-semibold text-textMuted mb-3">Technical Skill Gaps</h3>
                            <div className="flex flex-wrap gap-2">
                                {application.technicalSkillGap && application.technicalSkillGap.length > 0 ? application.technicalSkillGap.map((skill, i) => (
                                    <span key={i} className="px-3 py-1 bg-danger/10 text-danger/90 rounded-full text-sm border border-danger/20">{skill}</span>
                                )) : <span className="text-sm text-textMuted">None detected.</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 mb-8">
                {/* Actionable Feedback */}
                <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><TrendingUp className="text-primary" /> Actionable Improvements</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-purple-400">Resume Formatting</h3>
                            <ul className="space-y-3">
                                {application.resumeImprovements?.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                        <AlertCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                                        <span className="text-textMain/90">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-blue-400">Bullet Enhancements</h3>
                            <ul className="space-y-3">
                                {application.bulletImprovements?.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                        <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                        <span className="text-textMain/90">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Interview Prep */}
                <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageSquare className="text-success" /> Interview Preparation Questions</h2>
                    <div className="space-y-4">
                        {application.interviewQuestions?.map((q, i) => (
                            <div key={i} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                                <p className="font-medium text-textMain mb-2"><span className="text-success mr-2">Q{i + 1}.</span>{typeof q === 'string' ? q : q.question || JSON.stringify(q)}</p>
                                {typeof q === 'object' && q.answer && (
                                    <p className="text-sm text-textMuted mt-2 pl-6 border-l-2 border-slate-600 italic">Target Answer Concept: {q.answer}</p>
                                )}
                            </div>
                        ))}
                        {(!application.interviewQuestions || application.interviewQuestions.length === 0) && (
                            <p className="text-textMuted">No specific interview questions matched for this configuration.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisResults;

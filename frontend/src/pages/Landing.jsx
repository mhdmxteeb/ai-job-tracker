import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-6">
                AI-Powered Job Application Tracker
            </h1>
            <p className="text-xl text-textMuted mb-10 max-w-2xl">
                Supercharge your job search. Upload your resume, match it against job descriptions using advanced AI, and get actionable insights to land your dream job faster.
            </p>

            <div className="flex gap-4">
                <Link to="/register" className="px-8 py-3 rounded-lg bg-primary hover:bg-primaryHover text-white font-semibold transition-colors shadow-lg shadow-primary/25">
                    Get Started
                </Link>
                <Link to="/login" className="px-8 py-3 rounded-lg bg-surface hover:bg-slate-700 text-textMain font-semibold transition-colors border border-slate-600">
                    Login
                </Link>
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl">
                <Link to="/register" className="p-6 rounded-xl bg-surface border border-slate-700 hover:border-primary hover:-translate-y-1 transition-all group block shadow-lg hover:shadow-primary/20 cursor-pointer">
                    <h3 className="text-xl font-bold mb-3 text-primary group-hover:text-primaryHover transition-colors">ATS Parsing</h3>
                    <p className="text-textMuted group-hover:text-textMain transition-colors">See exactly what an Applicant Tracking System sees when it reads your resume.</p>
                </Link>
                <Link to="/register" className="p-6 rounded-xl bg-surface border border-slate-700 hover:border-accent hover:-translate-y-1 transition-all group block shadow-lg hover:shadow-accent/20 cursor-pointer">
                    <h3 className="text-xl font-bold mb-3 text-accent transition-colors">Skill Gap Analysis</h3>
                    <p className="text-textMuted group-hover:text-textMain transition-colors">Instantly compare your skills against the job description and find missing keywords.</p>
                </Link>
                <Link to="/register" className="p-6 rounded-xl bg-surface border border-slate-700 hover:border-success hover:-translate-y-1 transition-all group block shadow-lg hover:shadow-success/20 cursor-pointer">
                    <h3 className="text-xl font-bold mb-3 text-success transition-colors">Interview Prep</h3>
                    <p className="text-textMuted group-hover:text-textMain transition-colors">Get AI-generated technical and behavioral questions tailored to the specific role.</p>
                </Link>
            </div>
        </div>
    );
};

export default Landing;

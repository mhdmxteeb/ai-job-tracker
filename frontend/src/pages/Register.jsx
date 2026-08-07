import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }
        try {
            await register(formData.name, formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Error registering user');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto mt-20">
            <div className="bg-surface p-8 rounded-xl shadow-xl border border-slate-700">
                <h2 className="text-3xl font-bold mb-6 text-center text-primary">Create Account</h2>

                {error && <div className="bg-danger/20 text-danger border border-danger/50 p-3 rounded mb-4 text-center">{error}</div>}

                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-textMuted mb-2 text-sm">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={onChange}
                            required
                            className="w-full bg-background border border-slate-600 rounded px-4 py-2 text-textMain focus:outline-none focus:border-primary transition-colors"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-textMuted mb-2 text-sm">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={onChange}
                            required
                            className="w-full bg-background border border-slate-600 rounded px-4 py-2 text-textMain focus:outline-none focus:border-primary transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-textMuted mb-2 text-sm">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={onChange}
                            required
                            className="w-full bg-background border border-slate-600 rounded px-4 py-2 text-textMain focus:outline-none focus:border-primary transition-colors"
                            placeholder="••••••••"
                            minLength="6"
                        />
                    </div>
                    <button type="submit" className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3 mt-4 rounded transition-colors shadow-lg">
                        Register
                    </button>
                </form>

                <p className="mt-6 text-center text-textMuted text-sm">
                    Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;

import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid Credentials');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto mt-20">
            <div className="bg-surface p-8 rounded-xl shadow-xl border border-slate-700">
                <h2 className="text-3xl font-bold mb-6 text-center text-primary">Login</h2>

                {error && <div className="bg-danger/20 text-danger border border-danger/50 p-3 rounded mb-4 text-center">{error}</div>}

                <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
                        />
                    </div>
                    <button type="submit" className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3 mt-4 rounded transition-colors shadow-lg">
                        Login
                    </button>
                </form>

                <p className="mt-6 text-center text-textMuted text-sm">
                    Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;

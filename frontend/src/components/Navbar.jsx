import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Briefcase } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="flex items-center justify-between px-8 py-4 bg-surface border-b border-slate-700 sticky top-0 z-50">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 text-xl font-bold text-textMain hover:text-primary transition-colors">
                <Briefcase className="text-primary" />
                <span>JobTracker AI</span>
            </Link>

            <div className="flex gap-4 items-center">
                {user ? (
                    <>
                        <span className="text-textMuted hidden md:block">Welcome, {user.name}</span>
                        <Link to="/dashboard" className="text-textMain hover:text-primary transition-colors font-medium">Dashboard</Link>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-md bg-danger/10 text-danger hover:bg-danger/20 transition-colors font-medium"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-textMain hover:text-primary transition-colors font-medium">Login</Link>
                        <Link to="/register" className="px-4 py-2 rounded-md bg-primary hover:bg-primaryHover text-white transition-colors font-medium">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

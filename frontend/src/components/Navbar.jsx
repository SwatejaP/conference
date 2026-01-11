import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Calendar, Shield, LogOut } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
    const navigate = useNavigate();

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            // Updated to Gateway (Relative Path)
            await axios.post('/api/auth/logout', {}, { withCredentials: true });
            localStorage.removeItem('user');
            navigate('/login');
        } catch (err) {
            console.error('Logout failed', err);
            // Force navigate even on error if backend is down
            navigate('/login');
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-brand">
                    <LayoutDashboard size={24} />
                    ConfRoom
                </Link>

                <div className="nav-links">
                    <Link to="/dashboard" className="nav-link">
                        Dashboard
                    </Link>
                    <Link to="/my-bookings" className="nav-link">
                        <Calendar size={18} /> My Bookings
                    </Link>

                    {/* Check if user is admin */}
                    {JSON.parse(localStorage.getItem('user') || '{}').role === 'ADMIN' && (
                        <Link to="/admin" className="nav-link">
                            <Shield size={18} /> Admin
                        </Link>
                    )}

                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

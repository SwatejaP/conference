import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LogIn } from 'lucide-react';
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Updated to point to Gateway (Relative Path)
            const res = await axios.post('/api/auth/login',
                { email, password },
                { withCredentials: true }
            );

            if (res.data.success || res.status === 200) {
                localStorage.setItem('user', JSON.stringify(res.data.user));
                if (res.data.user?.role === 'ADMIN') navigate('/admin');
                else navigate('/dashboard');
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Login failed. Ensure Gateway is running on port 80.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">
                        <LogIn size={24} />
                    </div>
                    <h2>Welcome Back</h2>
                    <p>Login to access your dashboard</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            className="input-field"
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="input-field"
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className="btn-primary" style={{ width: '100%' }}>
                        Login
                    </button>
                </form>

                <div className="signup-link">
                    Don't have an account?
                    <Link to="/register">Register</Link>
                </div>
            </div>
        </div>
    );
}

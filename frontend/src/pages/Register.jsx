import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus } from 'lucide-react';
import './Register.css';

export default function Register() {
    const [formData, setFormData] = useState({ email: '', password: '', role: 'EMPLOYEE' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Updated to Gateway (Relative Path)
            await axios.post('/api/auth/signup', formData);
            alert('Registration Successful! Please login.');
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.error || 'Registration failed. Ensure Gateway is running.');
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <div className="register-icon">
                        <UserPlus size={28} />
                    </div>
                    <h2>Create Account</h2>
                    <p>Join to book your space</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            className="input-field"
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="input-field"
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Role</label>
                        <select
                            className="input-field"
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            value={formData.role}
                        >
                            <option value="EMPLOYEE">Employee</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <button className="btn-primary" style={{ width: '100%' }}>
                        Sign Up
                    </button>
                </form>

                <div className="signin-link">
                    Already have an account?
                    <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
}

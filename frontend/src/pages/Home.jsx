import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
    return (
        <div className="container">
            {/* Hero Section */}
            <div className="heroSection">
                <div className="enterprisePill">
                    New: Enterprise Scheduling
                </div>
                <h1 className="heroTitle">
                    Simplifying Workspace <span className="highlight">Management</span>
                </h1>
                <p className="heroSubtitle">
                    The professional solution for modern teams. Book rooms, manage schedules, and optimize your office resources with ease.
                </p>
                <div className="heroActions">
                    <Link to="/login" className="btn-primary">
                        Get Started
                    </Link>
                    <Link to="/register" className="btn-secondary">
                        Create Account
                    </Link>
                </div>
            </div>

            {/* Features Grid */}
            <div className="featuresGrid">
                {[
                    { title: 'Instant Booking', desc: 'Secure meeting spaces in seconds with our real-time availability engine.' },
                    { title: 'Conflict Resolution', desc: 'Automated scheduling prevents double-bookings and resource clashes.' },
                    { title: 'Team Management', desc: 'Admin controls to manage roles, permissions, and access levels.' }
                ].map((feature, i) => (
                    <div key={i} className="featureCard">
                        <h3>{feature.title}</h3>
                        <p>{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

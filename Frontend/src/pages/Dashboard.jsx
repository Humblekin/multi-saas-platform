import React from 'react';
import { useNavigate } from 'react-router-dom';
import SystemCard from '../components/SystemCard';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleSystemSelect = (system) => {
        // Check if user has active subscription for this system
        if (user.subscription && user.subscription.isActive && user.subscription.planType === system) {
            navigate(`/${system.toLowerCase()}`);
        } else {
            // Redirect to payment with selected system
            navigate('/payment', { state: { system } });
        }
    };

    const systems = [
        { name: 'Pharmacy', icon: '💊', description: 'Manage drugs, sales, and stock.' },
        { name: 'Inventory', icon: '📦', description: 'General inventory control.' },
        { name: 'School', icon: '🏫', description: 'Academics, attendance, grading.' },
        { name: 'Office', icon: '🏢', description: 'General institutional management.' },
    ];


    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    }
    return (
        <div className="dashboard-container">
            <div className="logout-button" style={{ position: 'absolute', top: 20, right: 20, }}>
                <button onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '16px', cursor: 'pointer', outline: 'none' }}>logout</button>
            </div>
            <header className="dashboard-header">
                <h1>Welcome, {user ? user.name : 'User'}</h1>
                <p>Select a management system to get started.</p>
                {user && user.role === 'admin' && (
                    <button
                        onClick={() => navigate('/admin')}
                        className="btn-admin-panel"
                        style={{
                            marginTop: '16px',
                            padding: '10px 20px',
                            background: 'linear-gradient(to right, #8b5cf6, #d946ef)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        🛡️ Go to Admin Panel
                    </button>
                )}
            </header>

            <div className="systems-grid">
                {systems.map((sys) => (
                    <SystemCard
                        key={sys.name}
                        system={sys}
                        onClick={() => handleSystemSelect(sys.name)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Dashboard;

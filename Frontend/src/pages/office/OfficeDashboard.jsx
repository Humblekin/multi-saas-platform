import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Staff from './Staff';
import Departments from './Departments';
import Attendance from './Attendance';
import api from '../../api';
import './OfficeDashboard.css';

const OfficeDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="office-dashboard">
            {/* Mobile Menu Button */}
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
                <span className="hamburger-icon">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </button>

            {/* Overlay for mobile */}
            {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

            <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-header">
                    <h2>🏢 Office</h2>
                    <p className="user-name">{user?.name}</p>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/office" className="nav-link" onClick={closeSidebar}>Dashboard</Link>
                    <Link to="/office/staff" className="nav-link" onClick={closeSidebar}>Staff</Link>
                    <Link to="/office/attendance" className="nav-link" onClick={closeSidebar}>Attendance</Link>
                    <Link to="/office/departments" className="nav-link" onClick={closeSidebar}>Departments</Link>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </aside>

            <main className="main-content">
                <Routes>
                    <Route path="/" element={<OfficeHome />} />
                    <Route path="/staff" element={<Staff />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/departments" element={<Departments />} />
                </Routes>
            </main>
        </div>
    );
};

const OfficeHome = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        presentCount: 0,
        absentCount: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/office/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch stats');
        }
    };

    return (
        <div className="dashboard-home">
            <h1>Office Dashboard</h1>
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Staff</h3>
                    <p className="stat-value">{stats.totalEmployees}</p>
                </div>
                <div className="stat-card">
                    <h3>Present Today</h3>
                    <p className="stat-value">{stats.presentCount}</p>
                </div>
                <div className="stat-card">
                    <h3>Absent Today</h3>
                    <p className="stat-value">{stats.absentCount}</p>
                </div>
            </div>
        </div>
    );
};

export default OfficeDashboard;

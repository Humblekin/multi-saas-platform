import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import './AdminDashboard.css';
import UserManagement from './UserManagement';

import SubscriptionsManagement from './SubscriptionsManagement';
import SystemSettings from './SystemSettings';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        // Check if user is admin
        if (!user || user.role !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

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
        <div className="admin-dashboard">
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
                    <h2>🛡️ Admin Panel</h2>
                    <p className="user-name">{user?.name}</p>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/admin" className="nav-link" onClick={closeSidebar}>Dashboard</Link>
                    <Link to="/admin/users" className="nav-link" onClick={closeSidebar}>User Management</Link>
                    <Link to="/admin/subscriptions" className="nav-link" onClick={closeSidebar}>Subscriptions</Link>
                    <Link to="/admin/settings" className="nav-link" onClick={closeSidebar}>System Settings</Link>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </aside>

            <main className="main-content">
                <Routes>
                    <Route path="/" element={<AdminHome />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/subscriptions" element={<SubscriptionsManagement />} />
                    <Route path="/settings" element={<SystemSettings />} />
                </Routes>
            </main>
        </div>
    );
};

const AdminHome = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch admin stats');
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (!stats) return <div className="error-state">Failed to load statistics</div>;

    return (
        <div className="dashboard-home">
            <h1>Admin Overview</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>Total Users</h3>
                        <p className="stat-value">{stats.users.total}</p>
                        <small>{stats.users.recentRegistrations} new in last 30 days</small>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <h3>Active Subscriptions</h3>
                        <p className="stat-value">{stats.subscriptions.active}</p>
                        <small>{stats.subscriptions.expiring} expiring soon</small>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <h3>Monthly Revenue</h3>
                        <p className="stat-value">GHS {stats.revenue.monthly.toLocaleString()}</p>
                        <small>Est. Yearly: GHS {stats.revenue.yearly.toLocaleString()}</small>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💊</div>
                    <div className="stat-info">
                        <h3>Total Drugs</h3>
                        <p className="stat-value">{stats.systemData.totalDrugs}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-sections">
                <div className="section-card">
                    <h3>Subscription Breakdown</h3>
                    <div className="breakdown-list">
                        <div className="breakdown-item">
                            <span>Pharmacy</span>
                            <span className="count">{stats.subscriptions.pharmacy}</span>
                        </div>
                        <div className="breakdown-item">
                            <span>Inventory</span>
                            <span className="count">{stats.subscriptions.inventory}</span>
                        </div>
                        <div className="breakdown-item">
                            <span>School</span>
                            <span className="count">{stats.subscriptions.school}</span>
                        </div>
                        <div className="breakdown-item">
                            <span>Office</span>
                            <span className="count">{stats.subscriptions.office}</span>
                        </div>
                    </div>
                </div>

                <div className="section-card">
                    <h3>System Health</h3>
                    <div className="health-metrics">
                        <div className="metric">
                            <span>Database Status</span>
                            <span className="status-ok">Operational</span>
                        </div>
                        <div className="metric">
                            <span>API Latency</span>
                            <span className="status-ok">45ms</span>
                        </div>
                        <div className="metric">
                            <span>Total Sales</span>
                            <span>{stats.systemData.totalSales}</span>
                        </div>
                        <div className="metric">
                            <span>Total Products</span>
                            <span>{stats.systemData.totalProducts}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

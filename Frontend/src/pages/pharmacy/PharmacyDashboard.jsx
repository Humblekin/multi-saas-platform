import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import ManageDrugs from './ManageDrugs';
import Sales from './Sales';
import DrugCategories from './DrugCategories';
import Prescriptions from './Prescriptions';
import api from '../../api';
import './PharmacyDashboard.css';

const PharmacyDashboard = () => {
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
        <div className="pharmacy-dashboard">
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
                    <h2>💊 Pharmacy</h2>
                    <p className="user-name">{user?.name}</p>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/pharmacy" className="nav-link" onClick={closeSidebar}>Dashboard</Link>
                    <Link to="/pharmacy/drugs" className="nav-link" onClick={closeSidebar}>Manage Drugs</Link>
                    <Link to="/pharmacy/categories" className="nav-link" onClick={closeSidebar}>Drug Categories</Link>
                    <Link to="/pharmacy/prescriptions" className="nav-link" onClick={closeSidebar}>Prescriptions</Link>
                    <Link to="/pharmacy/sales" className="nav-link" onClick={closeSidebar}>Sales</Link>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </aside>

            <main className="main-content">
                <Routes>
                    <Route path="/" element={<PharmacyHome />} />
                    <Route path="/drugs" element={<ManageDrugs />} />
                    <Route path="/categories" element={<DrugCategories />} />
                    <Route path="/prescriptions" element={<Prescriptions />} />
                    <Route path="/sales" element={<Sales />} />
                </Routes>
            </main>
        </div>
    );
};

const PharmacyHome = () => {
    const [stats, setStats] = React.useState({
        totalDrugs: 0,
        totalCategories: 0,
        totalSales: 0,
        totalSalesCount: 0,
        lowStock: 0,
        outOfStock: 0,
        expired: 0,
        expiringSoon: 0,
        totalValue: 0,
        totalCost: 0,
        potentialProfit: 0
    });
    const [alerts, setAlerts] = React.useState({
        lowStock: [],
        outOfStock: [],
        expiring: [],
        expired: []
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, alertsRes] = await Promise.all([
                api.get('/pharmacy/sales/stats/summary'),
                api.get('/pharmacy/alerts')
            ]);
            setStats(statsRes.data);
            setAlerts(alertsRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch data');
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="dashboard-home">
            <h1>Pharmacy Dashboard</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">💊</div>
                    <div className="stat-info">
                        <h3>Total Drugs</h3>
                        <p className="stat-value">{stats.totalDrugs}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <h3>Total Sales</h3>
                        <p className="stat-value">GHS {stats.totalSales.toFixed(2)}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <h3>Potential Profit</h3>
                        <p className="stat-value profit">GHS {stats.potentialProfit.toFixed(2)}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📁</div>
                    <div className="stat-info">
                        <h3>Categories</h3>
                        <p className="stat-value">{stats.totalCategories}</p>
                    </div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-info">
                        <h3>Low Stock</h3>
                        <p className="stat-value">{stats.lowStock}</p>
                    </div>
                </div>
                <div className="stat-card danger">
                    <div className="stat-icon">🚫</div>
                    <div className="stat-info">
                        <h3>Out of Stock</h3>
                        <p className="stat-value">{stats.outOfStock}</p>
                    </div>
                </div>
                <div className="stat-card danger">
                    <div className="stat-icon">❌</div>
                    <div className="stat-info">
                        <h3>Expired</h3>
                        <p className="stat-value">{stats.expired}</p>
                    </div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon">📅</div>
                    <div className="stat-info">
                        <h3>Expiring Soon</h3>
                        <p className="stat-value">{stats.expiringSoon}</p>
                    </div>
                </div>
            </div>

            {/* Alerts Section */}
            <div className="alerts-section">
                <div className="alert-column">
                    <h3>⚠️ Low Stock Alerts</h3>
                    {alerts.lowStock.length === 0 ? (
                        <p className="no-alerts">No low stock alerts</p>
                    ) : (
                        <ul className="alert-list">
                            {alerts.lowStock.map(drug => (
                                <li key={drug.id} className="alert-item low-stock-alert">
                                    <div className="alert-product">
                                        <strong>{drug.name}</strong>
                                        {drug.genericName && <span className="alert-generic">{drug.genericName}</span>}
                                    </div>
                                    <div className="alert-details">
                                        <span className="alert-quantity">{drug.quantity} {drug.unit}</span>
                                        <span className="alert-min">Min: {drug.minStockLevel}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="alert-column">
                    <h3>📅 Expiring Soon (30 Days)</h3>
                    {alerts.expiring.length === 0 ? (
                        <p className="no-alerts">No expiry alerts</p>
                    ) : (
                        <ul className="alert-list">
                            {alerts.expiring.map(drug => (
                                <li key={drug.id} className="alert-item expiring-alert">
                                    <div className="alert-product">
                                        <strong>{drug.name}</strong>
                                        {drug.batchNumber && <span className="alert-batch">Batch: {drug.batchNumber}</span>}
                                    </div>
                                    <div className="alert-details">
                                        <span className="alert-expiry">{new Date(drug.expiryDate).toLocaleDateString()}</span>
                                        <span className="alert-quantity">{drug.quantity} {drug.unit}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="alert-column">
                    <h3>❌ Expired Drugs</h3>
                    {alerts.expired.length === 0 ? (
                        <p className="no-alerts">No expired drugs</p>
                    ) : (
                        <ul className="alert-list">
                            {alerts.expired.map(drug => (
                                <li key={drug.id} className="alert-item expired-alert">
                                    <div className="alert-product">
                                        <strong>{drug.name}</strong>
                                        {drug.batchNumber && <span className="alert-batch">Batch: {drug.batchNumber}</span>}
                                    </div>
                                    <div className="alert-details">
                                        <span className="alert-expiry">Expired: {new Date(drug.expiryDate).toLocaleDateString()}</span>
                                        <span className="alert-quantity">{drug.quantity} {drug.unit}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PharmacyDashboard;

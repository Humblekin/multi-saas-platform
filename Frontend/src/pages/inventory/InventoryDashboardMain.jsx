import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Products from './Products';
import Suppliers from './Suppliers';
import Categories from './Categories';
import StockMovements from './StockMovements';
import api from '../../api';
import './InventoryDashboard.css';

const InventoryDashboard = () => {
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
        <div className="inventory-dashboard">
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
                    <h2>📦 Inventory</h2>
                    <p className="user-name">{user?.name}</p>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/inventory" className="nav-link" onClick={closeSidebar}>Dashboard</Link>
                    <Link to="/inventory/products" className="nav-link" onClick={closeSidebar}>Products</Link>
                    <Link to="/inventory/categories" className="nav-link" onClick={closeSidebar}>Categories</Link>
                    <Link to="/inventory/stock-movements" className="nav-link" onClick={closeSidebar}>Stock Movements</Link>
                    <Link to="/inventory/suppliers" className="nav-link" onClick={closeSidebar}>Suppliers</Link>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </aside>

            <main className="main-content">
                <Routes>
                    <Route path="/" element={<InventoryHome />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/stock-movements" element={<StockMovements />} />
                    <Route path="/suppliers" element={<Suppliers />} />
                </Routes>
            </main>
        </div>
    );
};

const InventoryHome = () => {
    const [stats, setStats] = React.useState({
        totalProducts: 0,
        totalSuppliers: 0,
        totalCategories: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalValue: 0,
        totalCost: 0,
        potentialProfit: 0
    });
    const [alerts, setAlerts] = React.useState({
        lowStock: [],
        outOfStock: []
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, alertsRes] = await Promise.all([
                api.get('/inventory/stats'),
                api.get('/inventory/alerts')
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
            <h1>Inventory Dashboard</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                        <h3>Total Products</h3>
                        <p className="stat-value">{stats.totalProducts}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <h3>Total Value</h3>
                        <p className="stat-value">GHS {stats.totalValue.toFixed(2)}</p>
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
                    <div className="stat-icon">🏢</div>
                    <div className="stat-info">
                        <h3>Suppliers</h3>
                        <p className="stat-value">{stats.totalSuppliers}</p>
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
                        <p className="stat-value">{stats.lowStockCount}</p>
                    </div>
                </div>
                <div className="stat-card danger">
                    <div className="stat-icon">🚫</div>
                    <div className="stat-info">
                        <h3>Out of Stock</h3>
                        <p className="stat-value">{stats.outOfStockCount}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💵</div>
                    <div className="stat-info">
                        <h3>Total Cost</h3>
                        <p className="stat-value">GHS {stats.totalCost.toFixed(2)}</p>
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
                            {alerts.lowStock.map(product => (
                                <li key={product.id} className="alert-item low-stock-alert">
                                    <div className="alert-product">
                                        <strong>{product.name}</strong>
                                        <span className="alert-sku">{product.sku}</span>
                                    </div>
                                    <div className="alert-details">
                                        <span className="alert-quantity">{product.quantity} {product.unit}</span>
                                        <span className="alert-min">Min: {product.minStockLevel}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="alert-column">
                    <h3>🚫 Out of Stock</h3>
                    {alerts.outOfStock.length === 0 ? (
                        <p className="no-alerts">No out of stock items</p>
                    ) : (
                        <ul className="alert-list">
                            {alerts.outOfStock.map(product => (
                                <li key={product.id} className="alert-item out-of-stock-alert">
                                    <div className="alert-product">
                                        <strong>{product.name}</strong>
                                        <span className="alert-sku">{product.sku}</span>
                                    </div>
                                    <div className="alert-details">
                                        <span className="alert-category">{product.category}</span>
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

export default InventoryDashboard;

import React, { useState, useEffect } from 'react';
import api from '../../api';
import '../../styles/SharedEntity.css';

const SubscriptionsManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        expired: 0,
        revenue: 0
    });

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const res = await api.get('/admin/users');
            // Filter only users with some subscription history or active status if needed
            // For now, we'll take all users and filter client-side
            const allUsers = res.data;
            setUsers(allUsers);

            // Calculate stats
            const active = allUsers.filter(u => u.subscription?.isActive).length;
            const revenue = active * 350; // Assuming 350 GHS per sub

            setStats({
                total: allUsers.length,
                active,
                expired: allUsers.length - active,
                revenue
            });

            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch subscriptions');
            setLoading(false);
        }
    };

    const handleExtend = async (userId, currentEndDate) => {
        if (!window.confirm('Extend this subscription by 1 year?')) return;

        try {
            const endDate = new Date(currentEndDate || Date.now());
            endDate.setFullYear(endDate.getFullYear() + 1);

            await api.put(`/admin/users/${userId}/subscription`, {
                isActive: true,
                endDate: endDate
            });

            fetchSubscriptions();
            alert('Subscription extended successfully');
        } catch (err) {
            console.error('Failed to extend subscription');
            alert('Failed to extend subscription');
        }
    };

    const handleDeactivate = async (userId) => {
        if (!window.confirm('Are you sure you want to deactivate this subscription?')) return;

        try {
            await api.put(`/admin/users/${userId}/subscription`, {
                isActive: false
            });

            fetchSubscriptions();
        } catch (err) {
            console.error('Failed to deactivate subscription');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'all') return matchesSearch;
        if (filter === 'active') return matchesSearch && user.subscription?.isActive;
        if (filter === 'expired') return matchesSearch && !user.subscription?.isActive;
        if (filter === 'pharmacy') return matchesSearch && user.subscription?.planType === 'Pharmacy';
        if (filter === 'inventory') return matchesSearch && user.subscription?.planType === 'Inventory';
        if (filter === 'school') return matchesSearch && user.subscription?.planType === 'School';
        if (filter === 'office') return matchesSearch && user.subscription?.planType === 'Office';

        return matchesSearch;
    });

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="entity-page">
            <div className="page-header">
                <h1>💳 Subscription Management</h1>
            </div>

            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Active Subscriptions</h3>
                        <p className="stat-value" style={{ color: '#10b981' }}>{stats.active}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Total Revenue (Est.)</h3>
                        <p className="stat-value">GHS {stats.revenue.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="search-filter-bar">
                <input
                    type="text"
                    placeholder="🔍 Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Subscriptions</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired/Inactive</option>
                    <option value="pharmacy">Pharmacy Plan</option>
                    <option value="inventory">Inventory Plan</option>
                    <option value="school">School Plan</option>
                    <option value="office">Office Plan</option>
                </select>
            </div>

            <div className="entity-table">
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Plan</th>
                            <th>Status</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Reference</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <strong>{user.name}</strong>
                                    <div className="sub-text">{user.email}</div>
                                </td>
                                <td>
                                    {user.subscription?.planType ? (
                                        <span className="plan-badge">{user.subscription.planType}</span>
                                    ) : (
                                        <span className="text-muted">-</span>
                                    )}
                                </td>
                                <td>
                                    <span className={`status-badge ${user.subscription?.isActive ? 'active' : 'inactive'}`}>
                                        {user.subscription?.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    {user.subscription?.startDate
                                        ? new Date(user.subscription.startDate).toLocaleDateString()
                                        : '-'}
                                </td>
                                <td>
                                    {user.subscription?.endDate
                                        ? new Date(user.subscription.endDate).toLocaleDateString()
                                        : '-'}
                                </td>
                                <td>
                                    <code className="ref-code">
                                        {user.subscription?.paymentReference || '-'}
                                    </code>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        {user.subscription?.isActive ? (
                                            <button
                                                onClick={() => handleDeactivate(user.id)}
                                                className="btn-delete"
                                                title="Deactivate Subscription"
                                            >
                                                Deactivate
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleExtend(user.id, user.subscription?.endDate)}
                                                className="btn-edit"
                                                title="Activate/Extend"
                                            >
                                                Activate
                                            </button>
                                        )}
                                        {user.subscription?.isActive && (
                                            <button
                                                onClick={() => handleExtend(user.id, user.subscription?.endDate)}
                                                className="btn-edit"
                                                title="Extend by 1 Year"
                                            >
                                                +1 Year
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubscriptionsManagement;

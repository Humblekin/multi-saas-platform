import React, { useState, useEffect } from 'react';
import api from '../../api';
import '../../styles/SharedEntity.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'user',
        planType: '',
        isActive: false,
        endDate: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch users');
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            planType: user.subscription?.planType || '',
            isActive: user.subscription?.isActive || false,
            endDate: user.subscription?.endDate ? new Date(user.subscription.endDate).toISOString().split('T')[0] : ''
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // Update user details
            await api.put(`/admin/users/${editingUser.id}`, {
                name: formData.name,
                email: formData.email,
                role: formData.role
            });

            // Update subscription details
            await api.put(`/admin/users/${editingUser.id}/subscription`, {
                isActive: formData.isActive,
                planType: formData.planType || null,
                endDate: formData.endDate || null
            });

            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            console.error('Failed to update user');
            alert('Failed to update user');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            console.error('Failed to delete user');
            alert(err.response?.data?.msg || 'Failed to delete user');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'all') return matchesSearch;
        if (filter === 'active') return matchesSearch && user.subscription?.isActive;
        if (filter === 'inactive') return matchesSearch && !user.subscription?.isActive;
        if (filter === 'admin') return matchesSearch && user.role === 'admin';

        return matchesSearch;
    });

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="entity-page">
            <div className="page-header">
                <h1>👥 User Management</h1>
            </div>

            {editingUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Edit User: {editingUser.name}</h2>
                        <form onSubmit={handleUpdate} className="entity-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Subscription Status</label>
                                    <select
                                        value={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Plan Type</label>
                                    <select
                                        value={formData.planType}
                                        onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                                    >
                                        <option value="">None</option>
                                        <option value="Pharmacy">Pharmacy</option>
                                        <option value="Inventory">Inventory</option>
                                        <option value="School">School</option>
                                        <option value="Office">Office</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Subscription End Date</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setEditingUser(null)} className="btn-cancel">Cancel</button>
                                <button type="submit" className="btn-submit">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                    <option value="all">All Users</option>
                    <option value="active">Active Subscribers</option>
                    <option value="inactive">Inactive</option>
                    <option value="admin">Admins</option>
                </select>
            </div>

            <div className="entity-table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Plan</th>
                            <th>Status</th>
                            <th>Expires</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td><strong>{user.name}</strong></td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`role-badge ${user.role}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>{user.subscription?.planType || '-'}</td>
                                <td>
                                    <span className={`status-badge ${user.subscription?.isActive ? 'active' : 'inactive'}`}>
                                        {user.subscription?.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    {user.subscription?.endDate
                                        ? new Date(user.subscription.endDate).toLocaleDateString()
                                        : '-'}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button onClick={() => handleEdit(user)} className="btn-edit">Edit</button>
                                        <button onClick={() => handleDelete(user.id)} className="btn-delete">Delete</button>
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

export default UserManagement;

import React, { useState, useEffect } from 'react';
import api from '../../api';
import './Staff.css';

const Staff = () => {
    const [staff, setStaff] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        department: '',
        phone: '',
        email: '',
        salary: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStaff();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            const filtered = staff.filter(member =>
                member.name.toLowerCase().includes(lowerQuery) ||
                member.role.toLowerCase().includes(lowerQuery) ||
                member.department.toLowerCase().includes(lowerQuery)
            );
            setFilteredStaff(filtered);
        } else {
            setFilteredStaff(staff);
        }
    }, [searchQuery, staff]);

    const fetchStaff = async () => {
        try {
            const res = await api.get('/office/employees');
            setStaff(res.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch staff');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editMode) {
                const res = await api.put(`/office/employees/${editingId}`, formData);
                setStaff(staff.map(s => s.id === editingId ? res.data : s));
                setEditMode(false);
                setEditingId(null);
            } else {
                const res = await api.post('/office/employees', formData);
                setStaff([res.data, ...staff]);
            }
            setFormData({ name: '', role: '', department: '', phone: '', email: '', salary: '' });
            setShowForm(false);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to save staff member');
        }
    };

    const handleEdit = (member) => {
        setFormData({
            name: member.name,
            role: member.role,
            department: member.department,
            phone: member.phone,
            email: member.email,
            salary: member.salary
        });
        setEditMode(true);
        setEditingId(member.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this staff member?')) return;
        try {
            await api.delete(`/office/employees/${id}`);
            setStaff(staff.filter(member => member.id !== id));
        } catch (err) {
            setError('Failed to delete staff member');
        }
    };

    const toggleForm = () => {
        setShowForm(!showForm);
        if (showForm) {
            setEditMode(false);
            setEditingId(null);
            setFormData({ name: '', role: '', department: '', phone: '', email: '', salary: '' });
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="entity-page">
            <div className="page-header">
                <h1>Staff Members</h1>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Search staff..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button onClick={toggleForm} className="btn-add">
                        {showForm ? 'Cancel' : '+ Add Staff'}
                    </button>
                </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className="entity-form">
                    <h3 className="form-title">{editMode ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="form-input"
                        />
                        <input
                            type="text"
                            placeholder="Role / Position"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Department"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            required
                            className="form-input"
                        />
                        <input
                            type="tel"
                            placeholder="Phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="form-input"
                        />
                        <input
                            type="number"
                            placeholder="Salary (GHS)"
                            value={formData.salary}
                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                            required
                            className="form-input"
                        />
                    </div>
                    <button type="submit" className="btn-submit">
                        {editMode ? 'Update Staff' : 'Add Staff'}
                    </button>
                </form>
            )}

            <div className="entity-table">
                {filteredStaff.length === 0 ? (
                    <p className="empty-state">No staff members added yet.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStaff.map((member) => (
                                <tr key={member.id}>
                                    <td>{member.name}</td>
                                    <td>{member.role}</td>
                                    <td>{member.department}</td>
                                    <td>{member.phone}</td>
                                    <td>{member.email}</td>
                                    <td>
                                        <button
                                            onClick={() => handleEdit(member)}
                                            className="btn-edit"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(member.id)}
                                            className="btn-delete"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Staff;

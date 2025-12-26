import React, { useState, useEffect } from 'react';
import api from '../../api';
import './Teachers.css';

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        employeeId: '',
        subject: '',
        phone: '',
        email: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Load teachers on mount
    useEffect(() => {
        fetchTeachers();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            const filtered = teachers.filter(teacher =>
                teacher.name.toLowerCase().includes(lowerQuery) ||
                teacher.employeeId.toLowerCase().includes(lowerQuery) ||
                teacher.subject.toLowerCase().includes(lowerQuery)
            );
            setFilteredTeachers(filtered);
        } else {
            setFilteredTeachers(teachers);
        }
    }, [searchQuery, teachers]);

    const fetchTeachers = async () => {
        try {
            const res = await api.get('/school/teachers');
            setTeachers(res.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to fetch teachers');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editMode) {
                const res = await api.put(`/school/teachers/${editingId}`, formData);
                setTeachers(teachers.map(t => t.id === editingId ? res.data : t));
                setEditMode(false);
                setEditingId(null);
            } else {
                const res = await api.post('/school/teachers', formData);
                setTeachers([res.data, ...teachers]);
            }
            setFormData({ name: '', employeeId: '', subject: '', phone: '', email: '' });
            setShowForm(false);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to save teacher');
        }
    };

    const handleEdit = (teacher) => {
        setFormData({
            name: teacher.name,
            employeeId: teacher.employeeId,
            subject: teacher.subject,
            phone: teacher.phone,
            email: teacher.email
        });
        setEditMode(true);
        setEditingId(teacher.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this teacher?')) return;
        try {
            await api.delete(`/school/teachers/${id}`);
            setTeachers(teachers.filter((teacher) => teacher.id !== id));
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to delete teacher');
        }
    };

    const toggleForm = () => {
        setShowForm(!showForm);
        if (showForm) {
            setEditMode(false);
            setFormData({ name: '', employeeId: '', subject: '', phone: '', email: '' });
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="entity-page">
            <div className="page-header">
                <h1>Teachers</h1>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Search teachers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button onClick={toggleForm} className="btn-add">
                        {showForm ? 'Cancel' : '+ Add Teacher'}
                    </button>
                </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className="entity-form">
                    <h3 className="form-title">{editMode ? 'Edit Teacher' : 'Add New Teacher'}</h3>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Teacher Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="form-input"
                        />
                        <input
                            type="text"
                            placeholder="Employee ID"
                            value={formData.employeeId}
                            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Subject"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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
                    </div>
                    <button type="submit" className="btn-submit">
                        {editMode ? 'Update Teacher' : 'Add Teacher'}
                    </button>
                </form>
            )}

            <div className="entity-table">
                {filteredTeachers.length === 0 ? (
                    <p className="empty-state">No teachers found.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Employee ID</th>
                                <th>Subject</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeachers.map((teacher) => (
                                <tr key={teacher.id}>
                                    <td>{teacher.name}</td>
                                    <td>{teacher.employeeId}</td>
                                    <td>{teacher.subject}</td>
                                    <td>{teacher.phone}</td>
                                    <td>{teacher.email}</td>
                                    <td>
                                        <button
                                            onClick={() => handleEdit(teacher)}
                                            className="btn-edit"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(teacher.id)}
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

export default Teachers;

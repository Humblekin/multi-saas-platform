import React, { useState, useEffect } from 'react';
import api from '../../api';
import '../school/Students.css';

const Subjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            const filtered = subjects.filter(subject =>
                subject.name.toLowerCase().includes(lowerQuery) ||
                (subject.code && subject.code.toLowerCase().includes(lowerQuery))
            );
            setFilteredSubjects(filtered);
        } else {
            setFilteredSubjects(subjects);
        }
    }, [searchQuery, subjects]);

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/school/subjects');
            setSubjects(res.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to fetch subjects');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editMode) {
                const res = await api.put(`/school/subjects/${editingId}`, formData);
                setSubjects(subjects.map(s => s.id === editingId ? res.data : s));
                setEditMode(false);
                setEditingId(null);
            } else {
                const res = await api.post('/school/subjects', formData);
                setSubjects([res.data, ...subjects]);
            }
            setFormData({ name: '', code: '', description: '' });
            setShowForm(false);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to save subject');
        }
    };

    const handleEdit = (subject) => {
        setFormData({
            name: subject.name,
            code: subject.code || '',
            description: subject.description || ''
        });
        setEditMode(true);
        setEditingId(subject.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this subject? This may affect existing grades.')) return;
        try {
            await api.delete(`/school/subjects/${id}`);
            setSubjects(subjects.filter((subject) => subject.id !== id));
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to delete subject');
        }
    };

    const toggleForm = () => {
        setShowForm(!showForm);
        if (showForm) {
            setEditMode(false);
            setFormData({ name: '', code: '', description: '' });
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="entity-page">
            <div className="page-header">
                <h1>Subjects</h1>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Search subjects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button onClick={toggleForm} className="btn-add">
                        {showForm ? 'Cancel' : '+ Add Subject'}
                    </button>
                </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className="entity-form">
                    <h3 className="form-title">{editMode ? 'Edit Subject' : 'Add New Subject'}</h3>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Subject Name (e.g., Mathematics)"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="form-input"
                        />
                        <input
                            type="text"
                            placeholder="Subject Code (e.g., MATH101) - Optional"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className="form-input"
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Description - Optional"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="form-input"
                            style={{ gridColumn: '1 / -1' }}
                        />
                    </div>
                    <button type="submit" className="btn-submit">
                        {editMode ? 'Update Subject' : 'Add Subject'}
                    </button>
                </form>
            )}

            <div className="entity-table">
                {filteredSubjects.length === 0 ? (
                    <p className="empty-state">
                        {subjects.length === 0
                            ? 'No subjects added yet. Add subjects that your school offers.'
                            : 'No subjects found.'}
                    </p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Subject Name</th>
                                <th>Code</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubjects.map((subject) => (
                                <tr key={subject.id}>
                                    <td>{subject.name}</td>
                                    <td>{subject.code || '-'}</td>
                                    <td>{subject.description || '-'}</td>
                                    <td>
                                        <button
                                            onClick={() => handleEdit(subject)}
                                            className="btn-edit"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(subject.id)}
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

export default Subjects;

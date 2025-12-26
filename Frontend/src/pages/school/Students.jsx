import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import './Students.css';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        studentId: '',
        class: '',
        age: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            const filtered = students.filter(student =>
                student.name.toLowerCase().includes(lowerQuery) ||
                student.studentId.toLowerCase().includes(lowerQuery) ||
                student.class.toLowerCase().includes(lowerQuery)
            );
            setFilteredStudents(filtered);
        } else {
            setFilteredStudents(students);
        }
    }, [searchQuery, students]);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/school/students');
            setStudents(res.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to fetch students');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editMode) {
                const res = await api.put(`/school/students/${editingId}`, formData);
                setStudents(students.map(s => s.id === editingId ? res.data : s));
                setEditMode(false);
                setEditingId(null);
            } else {
                const res = await api.post('/school/students', formData);
                setStudents([res.data, ...students]);
            }
            setFormData({ name: '', studentId: '', class: '', age: '' });
            setShowForm(false);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to save student');
        }
    };

    const handleEdit = (student) => {
        setFormData({
            name: student.name,
            studentId: student.studentId,
            class: student.class,
            age: student.age
        });
        setEditMode(true);
        setEditingId(student.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;
        try {
            await api.delete(`/school/students/${id}`);
            setStudents(students.filter((student) => student.id !== id));
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to delete student');
        }
    };

    const viewReportCard = (student) => {
        navigate(`/school/report-card/${student.id}`);
    };

    const toggleForm = () => {
        setShowForm(!showForm);
        if (showForm) {
            setEditMode(false);
            setFormData({ name: '', studentId: '', class: '', age: '' });
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="entity-page">
            <div className="page-header">
                <h1>Students</h1>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button onClick={toggleForm} className="btn-add">
                        {showForm ? 'Cancel' : '+ Add Student'}
                    </button>
                </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className="entity-form">
                    <h3 className="form-title">{editMode ? 'Edit Student' : 'Add New Student'}</h3>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Student Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="form-input"
                        />
                        <input
                            type="text"
                            placeholder="Student ID"
                            value={formData.studentId}
                            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Class"
                            value={formData.class}
                            onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                            required
                            className="form-input"
                        />
                        <input
                            type="number"
                            placeholder="Age"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            required
                            className="form-input"
                        />
                    </div>
                    <button type="submit" className="btn-submit">
                        {editMode ? 'Update Student' : 'Add Student'}
                    </button>
                </form>
            )}

            <div className="entity-table">
                {filteredStudents.length === 0 ? (
                    <p className="empty-state">No students found.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Student ID</th>
                                <th>Class</th>
                                <th>Age</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student) => (
                                <tr key={student.id}>
                                    <td>{student.name}</td>
                                    <td>{student.studentId}</td>
                                    <td>{student.class}</td>
                                    <td>{student.age}</td>
                                    <td>
                                        <button
                                            onClick={() => handleEdit(student)}
                                            className="btn-edit"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => viewReportCard(student)}
                                            className="btn-view"
                                        >
                                            📄 Report
                                        </button>
                                        <button
                                            onClick={() => handleDelete(student.id)}
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

export default Students;

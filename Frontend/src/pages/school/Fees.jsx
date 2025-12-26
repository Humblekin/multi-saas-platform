import React, { useState, useEffect } from 'react';
import api from '../../api';
import './Fees.css';

const Fees = () => {
    const [fees, setFees] = useState([]);
    const [filteredFees, setFilteredFees] = useState([]);
    const [students, setStudents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        studentId: '',
        amount: '',
        type: 'Tuition',
        term: 'Term 1',
        status: 'Paid'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            const filtered = fees.filter(fee =>
                fee.studentName.toLowerCase().includes(lowerQuery) ||
                fee.type.toLowerCase().includes(lowerQuery) ||
                fee.term.toLowerCase().includes(lowerQuery)
            );
            setFilteredFees(filtered);
        } else {
            setFilteredFees(fees);
        }
    }, [searchQuery, fees]);

    const fetchData = async () => {
        try {
            const [feesRes, studentsRes] = await Promise.all([
                api.get('/school/fees'),
                api.get('/school/students')
            ]);
            setFees(feesRes.data);
            setStudents(studentsRes.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch data');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const selectedStudent = students.find(s => s.id === formData.studentId);
        if (!selectedStudent) {
            setError('Please select a valid student');
            return;
        }

        try {
            const res = await api.post('/school/fees', {
                ...formData,
                studentName: selectedStudent.name
            });
            setFees([res.data, ...fees]);
            setFormData({
                studentId: '',
                amount: '',
                type: 'Tuition',
                term: 'Term 1',
                status: 'Paid'
            });
            setShowForm(false);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to record fee');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this record?')) return;
        try {
            await api.delete(`/school/fees/${id}`);
            setFees(fees.filter(fee => fee.id !== id));
        } catch (err) {
            setError('Failed to delete record');
        }
    };

    const toggleForm = () => {
        setShowForm(!showForm);
        if (showForm) {
            setFormData({
                studentId: '',
                amount: '',
                type: 'Tuition',
                term: 'Term 1',
                status: 'Paid'
            });
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="entity-page">
            <div className="page-header">
                <h1>Fee Management</h1>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Search fees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button onClick={toggleForm} className="btn-add">
                        {showForm ? 'Cancel' : '+ Record Fee'}
                    </button>
                </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className="entity-form">
                    <h3 className="form-title">Record New Fee</h3>
                    <div className="form-row">
                        <select
                            value={formData.studentId}
                            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                            required
                            className="form-input"
                        >
                            <option value="">Select Student</option>
                            {students.map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.name} ({student.studentId})
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Amount (GHS)"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-row">
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            required
                            className="form-input"
                        >
                            <option value="Tuition">Tuition Fee</option>
                            <option value="Exam">Exam Fee</option>
                            <option value="Transport">Transport Fee</option>
                            <option value="Other">Other</option>
                        </select>
                        <select
                            value={formData.term}
                            onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                            required
                            className="form-input"
                        >
                            <option value="Term 1">Term 1</option>
                            <option value="Term 2">Term 2</option>
                            <option value="Term 3">Term 3</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-submit">Record Payment</button>
                </form>
            )}

            <div className="entity-table">
                {filteredFees.length === 0 ? (
                    <p className="empty-state">No fee records found.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Student</th>
                                <th>Type</th>
                                <th>Term</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFees.map((fee) => (
                                <tr key={fee.id}>
                                    <td>{new Date(fee.date).toLocaleDateString()}</td>
                                    <td>{fee.studentName}</td>
                                    <td>{fee.type}</td>
                                    <td>{fee.term}</td>
                                    <td>GHS {fee.amount.toFixed(2)}</td>
                                    <td>
                                        <span className={`status-badge ${fee.status.toLowerCase()}`}>
                                            {fee.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button onClick={() => handleDelete(fee.id)} className="btn-delete">
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

export default Fees;

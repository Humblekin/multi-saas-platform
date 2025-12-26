import React, { useState, useEffect } from 'react';
import api from '../../api';
import './Attendance.css';

const Attendance = () => {
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [filteredAttendance, setFilteredAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [status, setStatus] = useState('Present');
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            const filtered = attendance.filter(record =>
                record.employeeName?.toLowerCase().includes(lowerQuery) ||
                record.status.toLowerCase().includes(lowerQuery) ||
                new Date(record.date).toLocaleDateString().includes(lowerQuery)
            );
            setFilteredAttendance(filtered);
        } else {
            setFilteredAttendance(attendance);
        }
    }, [searchQuery, attendance]);

    const fetchData = async () => {
        try {
            const [empRes, attRes] = await Promise.all([
                api.get('/office/employees'),
                api.get('/office/attendance')
            ]);
            setEmployees(empRes.data);
            setAttendance(attRes.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch data');
            setLoading(false);
        }
    };

    const handleMarkAttendance = async (e) => {
        e.preventDefault();
        if (!selectedEmployee) return;

        try {
            if (editMode) {
                const res = await api.put(`/office/attendance/${editingId}`, {
                    status,
                    checkInTime: new Date().toLocaleTimeString()
                });
                setAttendance(attendance.map(a => a.id === editingId ? res.data : a));
                setEditMode(false);
                setEditingId(null);
            } else {
                const res = await api.post('/office/attendance', {
                    employeeId: selectedEmployee,
                    status,
                    checkInTime: new Date().toLocaleTimeString(),
                    checkOutTime: ''
                });
                setAttendance([res.data, ...attendance]);
            }
            setSelectedEmployee('');
            setStatus('Present');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to mark attendance');
        }
    };

    const handleEdit = (record) => {
        setSelectedEmployee(record.employeeId);
        setStatus(record.status);
        setEditMode(true);
        setEditingId(record.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this attendance record?')) return;
        try {
            await api.delete(`/office/attendance/${id}`);
            setAttendance(attendance.filter(a => a.id !== id));
        } catch (err) {
            setError('Failed to delete record');
        }
    };

    const toggleForm = () => {
        setEditMode(false);
        setEditingId(null);
        setSelectedEmployee('');
        setStatus('Present');
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="entity-page">
            <div className="page-header">
                <h1>Attendance Management</h1>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Search attendance..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleMarkAttendance} className="entity-form">
                <h3 className="form-title">{editMode ? 'Edit Attendance' : 'Mark Attendance'}</h3>
                <div className="form-row">
                    <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        required
                        className="form-input"
                        disabled={editMode}
                    >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>
                        ))}
                    </select>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        required
                        className="form-input"
                    >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                        <option value="Leave">Leave</option>
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-submit">
                        {editMode ? 'Update Attendance' : 'Mark Attendance'}
                    </button>
                    {editMode && (
                        <button type="button" onClick={toggleForm} className="btn-add">
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="entity-table">
                {filteredAttendance.length === 0 ? (
                    <p className="empty-state">No attendance records found.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Employee</th>
                                <th>Status</th>
                                <th>Check In</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAttendance.map((record) => (
                                <tr key={record.id}>
                                    <td>{new Date(record.date).toLocaleDateString()}</td>
                                    <td>{record.employeeName}</td>
                                    <td>
                                        <span className={`status-badge ${record.status.toLowerCase()}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td>{record.checkInTime || '-'}</td>
                                    <td>
                                        <button
                                            onClick={() => handleEdit(record)}
                                            className="btn-edit"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(record.id)}
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

export default Attendance;

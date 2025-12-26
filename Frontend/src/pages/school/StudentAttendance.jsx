import React, { useState, useEffect } from 'react';
import api from '../../api';
import './StudentAttendance.css';

const StudentAttendance = () => {
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [selectedClass, setSelectedClass] = useState('Class 1');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchStudents();
    }, [selectedClass]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/school/students');
            // Filter by class
            const classStudents = res.data.filter(s => s.class === selectedClass);
            setStudents(classStudents);

            // Initialize attendance data
            const initialData = {};
            classStudents.forEach(s => {
                initialData[s.id] = 'Present';
            });
            setAttendanceData(initialData);

            setLoading(false);
        } catch (err) {
            setError('Failed to fetch students');
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            const promises = students.map(student => {
                return api.post('/school/attendance', {
                    studentId: student.id,
                    studentName: student.name,
                    class: selectedClass,
                    status: attendanceData[student.id],
                    term: 'Term 1' // Default for now
                });
            });

            await Promise.all(promises);
            setSuccessMsg('Attendance marked successfully!');
            setLoading(false);
        } catch (err) {
            setError('Failed to mark attendance');
            setLoading(false);
        }
    };

    return (
        <div className="attendance-page">
            <div className="page-header">
                <h1>Student Attendance</h1>
                <div className="class-selector">
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="class-select"
                    >
                        <option value="Class 1">Class 1</option>
                        <option value="Class 2">Class 2</option>
                        <option value="Class 3">Class 3</option>
                        <option value="Class 4">Class 4</option>
                        <option value="Class 5">Class 5</option>
                        <option value="Class 6">Class 6</option>
                        <option value="JHS 1">JHS 1</option>
                        <option value="JHS 2">JHS 2</option>
                        <option value="JHS 3">JHS 3</option>
                    </select>
                </div>
            </div>

            {error && <div className="error-msg">{error}</div>}
            {successMsg && <div className="success-msg">{successMsg}</div>}

            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <div className="attendance-list">
                    {students.length === 0 ? (
                        <p className="empty-state">No students found in this class.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>ID</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.name}</td>
                                        <td>{student.studentId}</td>
                                        <td>
                                            <div className="status-options">
                                                <label className={`option ${attendanceData[student.id] === 'Present' ? 'selected present' : ''}`}>
                                                    <input
                                                        type="radio"
                                                        name={`status-${student.id}`}
                                                        checked={attendanceData[student.id] === 'Present'}
                                                        onChange={() => handleStatusChange(student.id, 'Present')}
                                                    />
                                                    Present
                                                </label>
                                                <label className={`option ${attendanceData[student.id] === 'Absent' ? 'selected absent' : ''}`}>
                                                    <input
                                                        type="radio"
                                                        name={`status-${student.id}`}
                                                        checked={attendanceData[student.id] === 'Absent'}
                                                        onChange={() => handleStatusChange(student.id, 'Absent')}
                                                    />
                                                    Absent
                                                </label>
                                                <label className={`option ${attendanceData[student.id] === 'Late' ? 'selected late' : ''}`}>
                                                    <input
                                                        type="radio"
                                                        name={`status-${student.id}`}
                                                        checked={attendanceData[student.id] === 'Late'}
                                                        onChange={() => handleStatusChange(student.id, 'Late')}
                                                    />
                                                    Late
                                                </label>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {students.length > 0 && (
                        <div className="actions">
                            <button onClick={handleSubmit} className="btn-submit">Save Attendance</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentAttendance;

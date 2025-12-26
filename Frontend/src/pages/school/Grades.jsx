import React, { useState, useEffect } from 'react';
import api from '../../api';
import './Grades.css';

const Grades = () => {
    const [grades, setGrades] = useState([]);
    const [filteredGrades, setFilteredGrades] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editMode, setEditMode] = useState(false);

    // Form State
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('');
    const [subjectScores, setSubjectScores] = useState({}); // { "Math": 85, "English": 90 }

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchGrades();
        fetchStudents();
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            const filtered = grades.filter(grade =>
                grade.studentName.toLowerCase().includes(lowerQuery) ||
                grade.subject.toLowerCase().includes(lowerQuery) ||
                grade.term.toLowerCase().includes(lowerQuery)
            );
            setFilteredGrades(filtered);
        } else {
            setFilteredGrades(grades);
        }
    }, [searchQuery, grades]);

    // Pre-fill scores when student/term selected
    useEffect(() => {
        if (selectedStudent && selectedTerm && !editMode) {
            // Check if grades already exist for this student/term combo to warn or pre-fill
            const existingGrades = grades.filter(
                g => g.studentId === selectedStudent && g.term === selectedTerm
            );

            if (existingGrades.length > 0) {
                const scores = {};
                existingGrades.forEach(g => {
                    scores[g.subject] = g.score;
                });
                setSubjectScores(scores);
            } else {
                setSubjectScores({});
            }
        }
    }, [selectedStudent, selectedTerm, grades, editMode]);

    const fetchGrades = async () => {
        try {
            const res = await api.get('/school/grades');
            setGrades(res.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to fetch grades');
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await api.get('/school/students');
            setStudents(res.data);
        } catch (err) {
            console.error('Failed to fetch students');
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/school/subjects');
            setSubjects(res.data);
        } catch (err) {
            console.error('Failed to fetch subjects:', err);
        }
    };

    const calculateGrade = (score) => {
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        if (score >= 40) return 'E';
        return 'F';
    };

    const handleScoreChange = (subjectName, value) => {
        setSubjectScores(prev => ({
            ...prev,
            [subjectName]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!selectedStudent || !selectedTerm) {
            setError('Please select a student and a term');
            return;
        }

        const student = students.find(s => s.id === selectedStudent);
        if (!student) {
            setError('Invalid student selected. Please try again.');
            return;
        }

        // Validate that ALL subjects have a score entered
        const enteredSubjects = Object.keys(subjectScores);
        // We only care about subjects that actually exist in the system
        const missingSubjects = subjects.filter(sub =>
            !enteredSubjects.includes(sub.name) ||
            subjectScores[sub.name] === '' ||
            subjectScores[sub.name] === null ||
            isNaN(Number(subjectScores[sub.name]))
        );

        if (missingSubjects.length > 0) {
            setError(`Please enter scores for all subjects. Missing: ${missingSubjects.map(s => s.name).join(', ')}`);
            return;
        }

        // Prepare payload
        const gradesPayload = Object.entries(subjectScores)
            .map(([subject, score]) => ({
                studentId: student.id,
                studentName: student.name,
                subject,
                score: Number(score),
                grade: calculateGrade(Number(score)),
                term: selectedTerm
            }));

        setSubmitting(true);

        try {
            await api.post('/school/grades', gradesPayload);
            fetchGrades(); // Refresh table
            setSuccessMsg('Grades saved successfully! Ready for next student.');

            if (editMode) {
                setShowForm(false);
                setEditMode(false);
                setSelectedStudent('');
                setSelectedTerm('');
                setSubjectScores({});
            } else {
                // Batch Mode: Keep form open, clear student and scores to "disappear" the entered data
                setSelectedStudent('');
                setSubjectScores({});
                // Note: We deliberately keep selectedTerm for faster batch entry
            }

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || 'Failed to save grades');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (grade) => {
        // Find all grades for this student and term
        const studentGrades = grades.filter(
            g => g.studentId === grade.studentId && g.term === grade.term
        );

        setSelectedStudent(grade.studentId);
        setSelectedTerm(grade.term);

        const scores = {};
        studentGrades.forEach(g => {
            scores[g.subject] = g.score;
        });
        setSubjectScores(scores);

        setEditMode(true);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this grade?')) return;
        try {
            await api.delete(`/school/grades/${id}`);
            setGrades(grades.filter((grade) => grade.id !== id));
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to delete grade');
        }
    };

    const toggleForm = () => {
        setShowForm(!showForm);
        if (showForm) {
            setEditMode(false);
            setSelectedStudent('');
            setSelectedTerm('');
            setSubjectScores({});
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="entity-page">
            <div className="page-header">
                <h1>Grades Management</h1>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Search grades..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button onClick={toggleForm} className="btn-add">
                        {showForm ? 'Cancel' : '+ Record Grades'}
                    </button>
                </div>
            </div>

            {error && <div className="error-msg">{error}</div>}
            {successMsg && <div className="success-msg" style={{ backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>{successMsg}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className="entity-form">
                    <div className="form-title">{editMode ? 'Edit Grades' : 'Batch Grade Entry'}</div>

                    <div className="form-row">
                        <select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            required
                            className="form-input"
                            disabled={editMode}
                        >
                            <option value="">Select Student</option>
                            {students.map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.name} ({student.studentId})
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedTerm}
                            onChange={(e) => setSelectedTerm(e.target.value)}
                            required
                            className="form-input"
                            disabled={editMode}
                        >
                            <option value="">Select Term</option>
                            <option value="Term 1">Term 1</option>
                            <option value="Term 2">Term 2</option>
                            <option value="Term 3">Term 3</option>
                        </select>
                    </div>

                    <div className="subjects-grid">
                        <h3>Enter Scores</h3>
                        <div className="subjects-list">
                            {subjects.length === 0 ? (
                                <p>No subjects found. Please add subjects first.</p>
                            ) : (
                                subjects.map(subject => (
                                    <div key={subject.id} className="subject-input-group">
                                        <label>{subject.name}</label>
                                        <div className="input-wrapper">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="Score"
                                                value={subjectScores[subject.name] || ''}
                                                onChange={(e) => handleScoreChange(subject.name, e.target.value)}
                                            />
                                            {subjectScores[subject.name] && (
                                                <span className={`grade-badge ${calculateGrade(Number(subjectScores[subject.name]))}`}>
                                                    {calculateGrade(Number(subjectScores[subject.name]))}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-submit"
                        style={{ marginTop: '20px', opacity: submitting ? 0.7 : 1 }}
                        disabled={submitting}
                    >
                        {submitting ? 'Saving...' : (editMode ? 'Update All Grades' : 'Save All Grades')}
                    </button>
                </form>
            )}

            <div className="entity-table">
                {filteredGrades.length === 0 ? (
                    <p className="empty-state">No grades recorded yet.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Subject</th>
                                <th>Score</th>
                                <th>Grade</th>
                                <th>Term</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGrades.map((grade) => (
                                <tr key={grade.id}>
                                    <td>{grade.studentName}</td>
                                    <td>{grade.subject}</td>
                                    <td>{grade.score}</td>
                                    <td>
                                        <span className={`grade-badge ${grade.grade}`}>
                                            {grade.grade}
                                        </span>
                                    </td>
                                    <td>{grade.term}</td>
                                    <td>
                                        <button
                                            onClick={() => handleEdit(grade)}
                                            className="btn-edit"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(grade.id)}
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

export default Grades;

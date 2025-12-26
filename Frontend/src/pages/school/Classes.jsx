import React, { useState } from 'react';
import './Classes.css';

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        teacher: '',
        students: '',
        room: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setClasses([...classes, { ...formData, id: Date.now() }]);
        setFormData({ name: '', teacher: '', students: '', room: '' });
        setShowForm(false);
    };

    const handleDelete = (id) => {
        setClasses(classes.filter(cls => cls.id !== id));
    };

    return (
        <div className="classes-page">
            <div className="page-header">
                <h1>Classes</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-add">
                    {showForm ? 'Cancel' : '+ Add Class'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="class-form">
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Class Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Teacher"
                            value={formData.teacher}
                            onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="number"
                            placeholder="Number of Students"
                            value={formData.students}
                            onChange={(e) => setFormData({ ...formData, students: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Room Number"
                            value={formData.room}
                            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-submit">Add Class</button>
                </form>
            )}

            <div className="classes-table">
                {classes.length === 0 ? (
                    <p className="empty-state">No classes added yet.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Class Name</th>
                                <th>Teacher</th>
                                <th>Students</th>
                                <th>Room</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map((cls) => (
                                <tr key={cls.id}>
                                    <td>{cls.name}</td>
                                    <td>{cls.teacher}</td>
                                    <td>{cls.students}</td>
                                    <td>{cls.room}</td>
                                    <td>
                                        <button className="btn-delete">
                                            Edit
                                        </button>

                                        <button onClick={() => handleDelete(cls.id)} className="btn-delete">
                                            Delete
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

export default Classes;

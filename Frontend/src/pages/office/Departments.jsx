import React, { useState } from 'react';
import './Departments.css';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        head: '',
        staff: '',
        budget: '',
    });

    React.useEffect(() => {
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            const filtered = departments.filter(dept =>
                dept.name.toLowerCase().includes(lowerQuery) ||
                dept.head.toLowerCase().includes(lowerQuery)
            );
            setFilteredDepartments(filtered);
        } else {
            setFilteredDepartments(departments);
        }
    }, [searchQuery, departments]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editMode) {
            setDepartments(departments.map(dept =>
                dept.id === editingId ? { ...formData, id: editingId } : dept
            ));
            setEditMode(false);
            setEditingId(null);
        } else {
            setDepartments([...departments, { ...formData, id: Date.now() }]);
        }
        setFormData({ name: '', head: '', staff: '', budget: '' });
        setShowForm(false);
    };

    const handleEdit = (dept) => {
        setFormData({
            name: dept.name,
            head: dept.head,
            staff: dept.staff,
            budget: dept.budget
        });
        setEditMode(true);
        setEditingId(dept.id);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        setDepartments(departments.filter(dept => dept.id !== id));
    };

    const toggleForm = () => {
        setShowForm(!showForm);
        if (showForm) {
            setEditMode(false);
            setEditingId(null);
            setFormData({ name: '', head: '', staff: '', budget: '' });
        }
    };

    return (
        <div className="entity-page">
            <div className="page-header">
                <h1>Departments</h1>
                <div className="header-actions">
                    <input
                        type="text"
                        placeholder="Search departments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button onClick={toggleForm} className="btn-add">
                        {showForm ? 'Cancel' : '+ Add Department'}
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="entity-form">
                    <h3 className="form-title">{editMode ? 'Edit Department' : 'Add New Department'}</h3>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Department Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="form-input"
                        />
                        <input
                            type="text"
                            placeholder="Department Head"
                            value={formData.head}
                            onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="number"
                            placeholder="Number of Staff"
                            value={formData.staff}
                            onChange={(e) => setFormData({ ...formData, staff: e.target.value })}
                            required
                            className="form-input"
                        />
                        <input
                            type="number"
                            placeholder="Budget (GHS)"
                            value={formData.budget}
                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                            required
                            className="form-input"
                        />
                    </div>
                    <button type="submit" className="btn-submit">
                        {editMode ? 'Update Department' : 'Add Department'}
                    </button>
                </form>
            )}

            <div className="entity-table">
                {filteredDepartments.length === 0 ? (
                    <p className="empty-state">No departments added yet.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Department</th>
                                <th>Head</th>
                                <th>Staff Count</th>
                                <th>Budget</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDepartments.map((dept) => (
                                <tr key={dept.id}>
                                    <td>{dept.name}</td>
                                    <td>{dept.head}</td>
                                    <td>{dept.staff}</td>
                                    <td>GHS {Number(dept.budget).toLocaleString()}</td>
                                    <td>
                                        <button
                                            onClick={() => handleEdit(dept)}
                                            className="btn-edit"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dept.id)}
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

export default Departments;

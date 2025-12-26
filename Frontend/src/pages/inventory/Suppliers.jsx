import React, { useState, useEffect } from 'react';
import api from '../../api';
import './Suppliers.css';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await api.get('/inventory/suppliers');
            setSuppliers(res.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch suppliers');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/inventory/suppliers', formData);
            setSuppliers([res.data, ...suppliers]);
            setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '' });
            setShowForm(false);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to add supplier');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;
        try {
            await api.delete(`/inventory/suppliers/${id}`);
            setSuppliers(suppliers.filter(supplier => supplier.id !== id));
        } catch (err) {
            setError('Failed to delete supplier');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="suppliers-page">
            <div className="page-header">
                <h1>Suppliers</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-add">
                    {showForm ? 'Cancel' : '+ Add Supplier'}
                </button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className="supplier-form">
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Supplier Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Contact Person"
                            value={formData.contactPerson}
                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="tel"
                            placeholder="Phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-submit">Add Supplier</button>
                </form>
            )}

            <div className="suppliers-table">
                {suppliers.length === 0 ? (
                    <p className="empty-state">No suppliers added yet.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact Person</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Address</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map((supplier) => (
                                <tr key={supplier.id}>
                                    <td>{supplier.name}</td>
                                    <td>{supplier.contactPerson}</td>
                                    <td>{supplier.phone}</td>
                                    <td>{supplier.email}</td>
                                    <td>{supplier.address}</td>
                                    <td>
                                        <button onClick={() => handleDelete(supplier.id)} className="btn-delete">
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

export default Suppliers;

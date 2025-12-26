import React, { useState, useEffect } from 'react';
import api from '../../api';
import '../../styles/SharedEntity.css';
import './Prescriptions.css';

const Prescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [drugs, setDrugs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        patientName: '',
        patientPhone: '',
        doctorName: '',
        drugs: [{ drugName: '', quantity: '', dosage: '', instructions: '' }],
        notes: ''
    });
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchData();
    }, [filter]);

    const fetchData = async () => {
        try {
            const [prescriptionsRes, drugsRes] = await Promise.all([
                api.get(`/pharmacy/prescriptions?status=${filter}`),
                api.get('/pharmacy/drugs')
            ]);
            setPrescriptions(prescriptionsRes.data);
            setDrugs(drugsRes.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch data');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const res = await api.post('/pharmacy/prescriptions', formData);
            setPrescriptions([res.data, ...prescriptions]);
            setFormData({
                patientName: '',
                patientPhone: '',
                doctorName: '',
                drugs: [{ drugName: '', quantity: '', dosage: '', instructions: '' }],
                notes: ''
            });
            setShowForm(false);
            setSuccess('Prescription created successfully!');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to create prescription');
        }
    };

    const handleDispense = async (id) => {
        if (!window.confirm('Dispense this prescription?')) return;
        setError('');
        setSuccess('');
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            await api.put(`/pharmacy/prescriptions/${id}/dispense`, {
                dispensedBy: user.name
            });
            setSuccess('Prescription dispensed successfully!');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to dispense prescription');
        }
    };

    const addDrugRow = () => {
        setFormData({
            ...formData,
            drugs: [...formData.drugs, { drugName: '', quantity: '', dosage: '', instructions: '' }]
        });
    };

    const removeDrugRow = (index) => {
        const newDrugs = formData.drugs.filter((_, i) => i !== index);
        setFormData({ ...formData, drugs: newDrugs });
    };

    const updateDrugRow = (index, field, value) => {
        const newDrugs = [...formData.drugs];
        newDrugs[index][field] = value;
        setFormData({ ...formData, drugs: newDrugs });
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="entity-page">
            <div className="page-header">
                <h1>📋 Prescriptions</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-add">
                    {showForm ? 'Cancel' : '+ New Prescription'}
                </button>
            </div>

            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className="entity-form prescription-form">
                    <h3>New Prescription</h3>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Patient Name *"
                            value={formData.patientName}
                            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                            required
                        />
                        <input
                            type="tel"
                            placeholder="Patient Phone"
                            value={formData.patientPhone}
                            onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Doctor Name *"
                            value={formData.doctorName}
                            onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                            required
                        />
                    </div>

                    <h4>Prescribed Drugs</h4>
                    {formData.drugs.map((drug, index) => (
                        <div key={index} className="drug-row">
                            <select
                                value={drug.drugName}
                                onChange={(e) => updateDrugRow(index, 'drugName', e.target.value)}
                                required
                            >
                                <option value="">Select Drug *</option>
                                {drugs.map(d => (
                                    <option key={d.id} value={d.name}>
                                        {d.name} ({d.quantity} available)
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                placeholder="Quantity *"
                                value={drug.quantity}
                                onChange={(e) => updateDrugRow(index, 'quantity', e.target.value)}
                                required
                                min="1"
                            />
                            <input
                                type="text"
                                placeholder="Dosage (e.g., 2 tablets)"
                                value={drug.dosage}
                                onChange={(e) => updateDrugRow(index, 'dosage', e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Instructions (e.g., twice daily)"
                                value={drug.instructions}
                                onChange={(e) => updateDrugRow(index, 'instructions', e.target.value)}
                            />
                            {formData.drugs.length > 1 && (
                                <button type="button" onClick={() => removeDrugRow(index)} className="btn-remove">
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addDrugRow} className="btn-add-row">
                        + Add Another Drug
                    </button>

                    <div className="form-row">
                        <textarea
                            placeholder="Additional Notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows="3"
                        />
                    </div>
                    <button type="submit" className="btn-submit">Create Prescription</button>
                </form>
            )}

            <div className="filter-bar">
                <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button
                    className={filter === 'pending' ? 'active' : ''}
                    onClick={() => setFilter('pending')}
                >
                    📋 Pending
                </button>
                <button
                    className={filter === 'dispensed' ? 'active' : ''}
                    onClick={() => setFilter('dispensed')}
                >
                    ✅ Dispensed
                </button>
                <button
                    className={filter === 'cancelled' ? 'active' : ''}
                    onClick={() => setFilter('cancelled')}
                >
                    ❌ Cancelled
                </button>
            </div>

            <div className="entity-table">
                {prescriptions.length === 0 ? (
                    <p className="empty-state">No prescriptions found.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Rx Number</th>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Drugs</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prescriptions.map((prescription) => (
                                <tr key={prescription.id}>
                                    <td><code>{prescription.prescriptionNumber}</code></td>
                                    <td>
                                        <strong>{prescription.patientName}</strong>
                                        {prescription.patientPhone && <div className="sub-text">{prescription.patientPhone}</div>}
                                    </td>
                                    <td>{prescription.doctorName}</td>
                                    <td>
                                        {prescription.drugs.map((d, i) => (
                                            <div key={i} className="drug-item">
                                                {d.drugName} ({d.quantity})
                                            </div>
                                        ))}
                                    </td>
                                    <td>GHS {prescription.totalAmount.toFixed(2)}</td>
                                    <td>
                                        <span className={`status-badge ${prescription.status}`}>
                                            {prescription.status}
                                        </span>
                                    </td>
                                    <td>{new Date(prescription.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {prescription.status === 'pending' && (
                                            <button onClick={() => handleDispense(prescription.id)} className="btn-dispense">
                                                Dispense
                                            </button>
                                        )}
                                        {prescription.status === 'dispensed' && (
                                            <div className="dispensed-info">
                                                <small>By: {prescription.dispensedBy}</small>
                                            </div>
                                        )}
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

export default Prescriptions;

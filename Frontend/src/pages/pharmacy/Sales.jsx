import React, { useState, useEffect } from 'react';
import api from '../../api';
import './Sales.css';

const Sales = () => {
    const [drugs, setDrugs] = useState([]);
    const [sales, setSales] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        drugName: '',
        quantity: '',
        price: '',
        customerName: '',
    });
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredDrugs, setFilteredDrugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Load drugs and sales from API on component mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [drugsRes, salesRes] = await Promise.all([
                api.get('/pharmacy/drugs'),
                api.get('/pharmacy/sales')
            ]);
            setDrugs(drugsRes.data);
            setSales(salesRes.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch data');
            setLoading(false);
        }
    };

    const handleDrugNameChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, drugName: value });

        // Filter drugs based on input
        if (value.trim()) {
            const filtered = drugs.filter(drug =>
                drug.name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredDrugs(filtered);
            setShowDropdown(filtered.length > 0);
        } else {
            setFilteredDrugs([]);
            setShowDropdown(false);
        }
    };

    const handleDrugSelect = (drug) => {
        setFormData({
            ...formData,
            drugName: drug.name,
            price: drug.price
        });
        setShowDropdown(false);
        setFilteredDrugs([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const total = formData.quantity * formData.price;
        const newSale = {
            ...formData,
            total
        };

        try {
            const res = await api.post('/pharmacy/sales', newSale);
            setSales([res.data, ...sales]);
            setFormData({ drugName: '', quantity: '', price: '', customerName: '' });
            setShowForm(false);

            // Refresh drugs to update stock
            const drugsRes = await api.get('/pharmacy/drugs');
            setDrugs(drugsRes.data);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to record sale');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="sales-page">
            <div className="page-header">
                <h1>Sales Records</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-add">
                    {showForm ? 'Cancel' : '+ New Sale'}
                </button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className="sale-form">
                    <div className="form-row">
                        <div className="autocomplete-wrapper">
                            <input
                                type="text"
                                placeholder="Drug Name"
                                value={formData.drugName}
                                onChange={handleDrugNameChange}
                                onFocus={() => {
                                    if (formData.drugName && filteredDrugs.length > 0) {
                                        setShowDropdown(true);
                                    }
                                }}
                                required
                            />
                            {showDropdown && (
                                <div className="autocomplete-dropdown">
                                    {filteredDrugs.map((drug) => (
                                        <div
                                            key={drug.id}
                                            className="autocomplete-item"
                                            onClick={() => handleDrugSelect(drug)}
                                        >
                                            <span className="drug-name">{drug.name}</span>
                                            <span className="drug-info">
                                                {drug.category} - GHS {drug.price} (Stock: {drug.quantity})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <input
                            type="text"
                            placeholder="Customer Name"
                            value={formData.customerName}
                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="number"
                            placeholder="Quantity"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Unit Price (GHS)"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-submit">Record Sale</button>
                </form>
            )}

            <div className="sales-table">
                {sales.length === 0 ? (
                    <p className="empty-state">No sales recorded yet.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Drug</th>
                                <th>Customer</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map((sale) => (
                                <tr key={sale.id}>
                                    <td>{new Date(sale.date).toLocaleDateString()}</td>
                                    <td>{sale.drugName}</td>
                                    <td>{sale.customerName}</td>
                                    <td>{sale.quantity}</td>
                                    <td>GHS {sale.price}</td>
                                    <td>GHS {sale.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Sales;

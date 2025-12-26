import React, { useState, useEffect } from 'react';
import api from '../../api';
import '../../styles/SharedEntity.css';
import './StockMovements.css';

const StockMovements = () => {
    const [movements, setMovements] = useState([]);
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        productId: '',
        type: 'IN',
        quantity: '',
        reason: '',
        reference: ''
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
            const [movementsRes, productsRes] = await Promise.all([
                api.get(`/inventory/stock-movements?type=${filter}`),
                api.get('/inventory/products')
            ]);
            setMovements(movementsRes.data);
            setProducts(productsRes.data);
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
            await api.post(`/inventory/products/${formData.productId}/adjust-stock`, {
                type: formData.type,
                quantity: formData.quantity,
                reason: formData.reason,
                reference: formData.reference
            });
            setSuccess('Stock adjusted successfully!');
            setFormData({ productId: '', type: 'IN', quantity: '', reason: '', reference: '' });
            setShowForm(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to adjust stock');
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'IN': return '#10b981';
            case 'OUT': return '#ef4444';
            case 'ADJUSTMENT': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'IN': return '📥';
            case 'OUT': return '📤';
            case 'ADJUSTMENT': return '⚙️';
            default: return '📦';
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="entity-page">
            <div className="page-header">
                <h1>📊 Stock Movements</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-add">
                    {showForm ? 'Cancel' : '+ Adjust Stock'}
                </button>
            </div>

            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className="entity-form">
                    <div className="form-row">
                        <select
                            value={formData.productId}
                            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                            required
                        >
                            <option value="">Select Product</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} (Current: {p.quantity})
                                </option>
                            ))}
                        </select>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            required
                        >
                            <option value="IN">Stock In</option>
                            <option value="OUT">Stock Out</option>
                            <option value="ADJUSTMENT">Adjustment</option>
                        </select>
                    </div>
                    <div className="form-row">
                        <input
                            type="number"
                            placeholder="Quantity"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            required
                            min="1"
                        />
                        <input
                            type="text"
                            placeholder="Reason"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Reference (optional)"
                            value={formData.reference}
                            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn-submit">Adjust Stock</button>
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
                    className={filter === 'IN' ? 'active' : ''}
                    onClick={() => setFilter('IN')}
                >
                    📥 Stock In
                </button>
                <button
                    className={filter === 'OUT' ? 'active' : ''}
                    onClick={() => setFilter('OUT')}
                >
                    📤 Stock Out
                </button>
                <button
                    className={filter === 'ADJUSTMENT' ? 'active' : ''}
                    onClick={() => setFilter('ADJUSTMENT')}
                >
                    ⚙️ Adjustments
                </button>
            </div>

            <div className="entity-table">
                {movements.length === 0 ? (
                    <p className="empty-state">No stock movements found.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Product</th>
                                <th>Type</th>
                                <th>Quantity</th>
                                <th>Previous</th>
                                <th>New</th>
                                <th>Reason</th>
                                <th>Reference</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.map((movement) => (
                                <tr key={movement.id}>
                                    <td>{new Date(movement.createdAt).toLocaleString()}</td>
                                    <td><strong>{movement.productName}</strong></td>
                                    <td>
                                        <span
                                            className="type-badge"
                                            style={{ backgroundColor: getTypeColor(movement.type) }}
                                        >
                                            {getTypeIcon(movement.type)} {movement.type}
                                        </span>
                                    </td>
                                    <td>{movement.quantity}</td>
                                    <td>{movement.previousStock}</td>
                                    <td><strong>{movement.newStock}</strong></td>
                                    <td>{movement.reason}</td>
                                    <td>{movement.reference || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default StockMovements;

import React, { useState, useEffect } from 'react';
import api from '../../api';
import '../../styles/SharedEntity.css';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        price: '',
        costPrice: '',
        quantity: '',
        minStockLevel: '10',
        maxStockLevel: '',
        supplier: '',
        description: '',
        unit: 'pcs',
        location: '',
        barcode: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        fetchData();
    }, [categoryFilter]);

    const fetchData = async () => {
        try {
            const [productsRes, suppliersRes, categoriesRes] = await Promise.all([
                api.get(`/inventory/products?category=${categoryFilter}`),
                api.get('/inventory/suppliers'),
                api.get('/inventory/categories')
            ]);
            setProducts(productsRes.data);
            setSuppliers(suppliersRes.data);
            setCategories(categoriesRes.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch data');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editingId) {
                const res = await api.put(`/inventory/products/${editingId}`, formData);
                setProducts(products.map(p => p.id === editingId ? res.data : p));
                setEditingId(null);
            } else {
                const res = await api.post('/inventory/products', formData);
                setProducts([res.data, ...products]);
            }
            resetForm();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to save product');
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            sku: product.sku || '',
            category: product.category,
            price: product.price,
            costPrice: product.costPrice || '',
            quantity: product.quantity,
            minStockLevel: product.minStockLevel,
            maxStockLevel: product.maxStockLevel || '',
            supplier: product.supplier,
            description: product.description || '',
            unit: product.unit || 'pcs',
            location: product.location || '',
            barcode: product.barcode || ''
        });
        setEditingId(product.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/inventory/products/${id}`);
            setProducts(products.filter(product => product.id !== id));
        } catch (err) {
            setError('Failed to delete product');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            sku: '',
            category: '',
            price: '',
            costPrice: '',
            quantity: '',
            minStockLevel: '10',
            maxStockLevel: '',
            supplier: '',
            description: '',
            unit: 'pcs',
            location: '',
            barcode: ''
        });
        setShowForm(false);
        setEditingId(null);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStockStatus = (product) => {
        if (product.quantity === 0) return { text: 'Out of Stock', class: 'out-of-stock' };
        if (product.quantity <= product.minStockLevel) return { text: 'Low Stock', class: 'low-stock' };
        return { text: 'In Stock', class: 'in-stock' };
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="entity-page">
            <div className="page-header">
                <h1>📦 Products</h1>
                <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-add">
                    {showForm ? 'Cancel' : '+ Add Product'}
                </button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className="entity-form">
                    <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Product Name *"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="SKU (auto-generated if empty)"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        />
                    </div>
                    <div className="form-row">
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            <option value="">Select Category *</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                        <select
                            value={formData.supplier}
                            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                            required
                        >
                            <option value="">Select Supplier *</option>
                            {suppliers.map(s => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-row">
                        <input
                            type="number"
                            placeholder="Selling Price (GHS) *"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                            step="0.01"
                            min="0"
                        />
                        <input
                            type="number"
                            placeholder="Cost Price (GHS)"
                            value={formData.costPrice}
                            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                            step="0.01"
                            min="0"
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="number"
                            placeholder="Quantity *"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            required
                            min="0"
                        />
                        <input
                            type="text"
                            placeholder="Unit (e.g., pcs, kg, liters)"
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="number"
                            placeholder="Min Stock Level"
                            value={formData.minStockLevel}
                            onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                            min="0"
                        />
                        <input
                            type="number"
                            placeholder="Max Stock Level"
                            value={formData.maxStockLevel}
                            onChange={(e) => setFormData({ ...formData, maxStockLevel: e.target.value })}
                            min="0"
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Location/Shelf"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Barcode"
                            value={formData.barcode}
                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn-submit">
                        {editingId ? 'Update Product' : 'Add Product'}
                    </button>
                </form>
            )}

            <div className="search-filter-bar">
                <input
                    type="text"
                    placeholder="🔍 Search products by name, SKU, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Categories</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="entity-table">
                {filteredProducts.length === 0 ? (
                    <p className="empty-state">No products found.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Status</th>
                                <th>Supplier</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => {
                                const status = getStockStatus(product);
                                return (
                                    <tr key={product.id}>
                                        <td><code>{product.sku || 'N/A'}</code></td>
                                        <td><strong>{product.name}</strong></td>
                                        <td>{product.category}</td>
                                        <td>GHS {product.price.toFixed(2)}</td>
                                        <td>
                                            <span className={status.class}>
                                                {product.quantity} {product.unit}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${status.class}`}>
                                                {status.text}
                                            </span>
                                        </td>
                                        <td>{product.supplier}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button onClick={() => handleEdit(product)} className="btn-edit">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(product.id)} className="btn-delete">
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Products;

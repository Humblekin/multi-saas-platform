import React, { useState, useEffect } from "react";
import api from "../../api";
import "./ManageDrugs.css";

const ManageDrugs = () => {
  const [drugs, setDrugs] = useState([]);
  const [filteredDrugs, setFilteredDrugs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    expiryDate: "",
    minStockLevel: "10"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load drugs from API on component mount
  useEffect(() => {
    fetchDrugs();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = drugs.filter(drug =>
        drug.name.toLowerCase().includes(lowerQuery) ||
        drug.category.toLowerCase().includes(lowerQuery)
      );
      setFilteredDrugs(filtered);
    } else {
      setFilteredDrugs(drugs);
    }
  }, [searchQuery, drugs]);

  const fetchDrugs = async () => {
    try {
      const res = await api.get("/pharmacy/drugs");
      setDrugs(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch drugs", err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        const res = await api.put(`/pharmacy/drugs/${editingId}`, formData);
        setDrugs(drugs.map(d => d.id === editingId ? res.data : d));
        setEditMode(false);
        setEditingId(null);
      } else {
        const res = await api.post("/pharmacy/drugs", formData);
        setDrugs([res.data, ...drugs]);
      }
      setFormData({ name: "", category: "", price: "", quantity: "", expiryDate: "", minStockLevel: "10" });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to save drug");
    }
  };

  const handleEdit = (drug) => {
    setFormData({
      name: drug.name,
      category: drug.category,
      price: drug.price,
      quantity: drug.quantity,
      expiryDate: drug.expiryDate ? drug.expiryDate.split('T')[0] : '',
      minStockLevel: drug.minStockLevel || "10"
    });
    setEditMode(true);
    setEditingId(drug.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this drug?")) return;
    try {
      await api.delete(`/pharmacy/drugs/${id}`);
      setDrugs(drugs.filter((drug) => drug.id !== id));
    } catch (err) {
      setError("Failed to delete drug");
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      setEditMode(false);
      setFormData({ name: "", category: "", price: "", quantity: "", expiryDate: "", minStockLevel: "10" });
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="entity-page">
      <div className="page-header">
        <h1>Manage Drugs</h1>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search drugs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button onClick={toggleForm} className="btn-add">
            {showForm ? "Cancel" : "+ Add Drug"}
          </button>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="entity-form">
          <h3 className="form-title">{editMode ? 'Edit Drug' : 'Add New Drug'}</h3>
          <div className="form-row">
            <input
              type="text"
              placeholder="Drug Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="form-input"
            />
            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
              className="form-input"
            />
          </div>
          <div className="form-row">
            <input
              type="number"
              placeholder="Price (GHS)"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
              className="form-input"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              required
              className="form-input"
            />
          </div>
          <div className="form-row">
            <input
              type="date"
              placeholder="Expiry Date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="form-input"
            />
            <input
              type="number"
              placeholder="Min Stock Level"
              value={formData.minStockLevel}
              onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
              className="form-input"
            />
          </div>
          <button type="submit" className="btn-submit">
            {editMode ? 'Update Drug' : 'Add Drug'}
          </button>
        </form>
      )}

      <div className="entity-table">
        {filteredDrugs.length === 0 ? (
          <p className="empty-state">
            No drugs found.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Expiry</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrugs.map((drug) => (
                <tr key={drug.id}>
                  <td>{drug.name}</td>
                  <td>{drug.category}</td>
                  <td>GHS {drug.price}</td>
                  <td>
                    <span className={drug.quantity <= (drug.minStockLevel || 10) ? "low-stock" : ""}>
                      {drug.quantity}
                    </span>
                  </td>
                  <td>{drug.expiryDate ? new Date(drug.expiryDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(drug)}
                      className="btn-edit"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(drug.id)}
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

export default ManageDrugs;

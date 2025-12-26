import React, { useState, useEffect } from 'react';
import api from '../../api';
import '../../styles/SharedEntity.css';

const SystemSettings = () => {
    const [settings, setSettings] = useState({
        systemName: 'TotalTrack SaaS',
        maintenanceMode: false,
        allowRegistrations: true,
        defaultTrialDays: 14,
        currency: 'GHS',
        supportEmail: 'support@totaltrack.com'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // In a real app, we would fetch these from a backend endpoint like /api/admin/settings
    // For now, we'll simulate it or just use local state

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings({
            ...settings,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setMessage('Settings saved successfully (Simulation)');
            // Here we would normally POST to /api/admin/settings
        }, 1000);
    };

    return (
        <div className="entity-page">
            <div className="page-header">
                <h1>⚙️ System Settings</h1>
            </div>

            {message && <div className="success-msg">{message}</div>}

            <div className="settings-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit} className="entity-form">
                    <div className="form-section">
                        <h3>General Configuration</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>System Name</label>
                                <input
                                    type="text"
                                    name="systemName"
                                    value={settings.systemName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Support Email</label>
                                <input
                                    type="email"
                                    name="supportEmail"
                                    value={settings.supportEmail}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Currency Symbol</label>
                                <select
                                    name="currency"
                                    value={settings.currency}
                                    onChange={handleChange}
                                >
                                    <option value="GHS">GHS (Ghana Cedi)</option>
                                    <option value="USD">USD (US Dollar)</option>
                                    <option value="NGN">NGN (Nigerian Naira)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Default Trial Period (Days)</label>
                                <input
                                    type="number"
                                    name="defaultTrialDays"
                                    value={settings.defaultTrialDays}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section" style={{ marginTop: '24px' }}>
                        <h3>System Control</h3>
                        <div className="form-row">
                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="allowRegistrations"
                                        checked={settings.allowRegistrations}
                                        onChange={handleChange}
                                    />
                                    Allow New User Registrations
                                </label>
                                <p className="help-text">If unchecked, new users cannot sign up.</p>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="maintenanceMode"
                                        checked={settings.maintenanceMode}
                                        onChange={handleChange}
                                    />
                                    Enable Maintenance Mode
                                </label>
                                <p className="help-text">Warning: This will prevent non-admin users from logging in.</p>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions" style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>

                <div className="info-card" style={{ marginTop: '32px', padding: '20px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    <h4 style={{ color: '#38bdf8', marginTop: 0 }}>ℹ️ Server Information</h4>
                    <p style={{ color: '#cbd5e1', marginBottom: '8px' }}><strong>Environment:</strong> Production</p>
                    <p style={{ color: '#cbd5e1', marginBottom: '8px' }}><strong>Version:</strong> v1.0.0</p>
                    <p style={{ color: '#cbd5e1', marginBottom: 0 }}><strong>Database:</strong> Connected</p>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import '../styles/Forms.css';

const ResetPasswordPage = () => {
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const location = useLocation();

    useEffect(() => {
        // Get reset token and email from URL parameters
        const query = new URLSearchParams(location.search);
        const token = query.get('token');
        const userEmail = query.get('email');

        if (!token) {
            // Check session storage as fallback (for backward compatibility during migration)
            const sessionToken = sessionStorage.getItem('resetToken');
            if (!sessionToken) {
                setError('Invalid or missing reset token. Please request a new password reset.');
            }
        }

        if (userEmail) {
            setEmail(userEmail);
        } else {
            const sessionEmail = sessionStorage.getItem('resetEmail');
            if (sessionEmail) setEmail(sessionEmail);
        }
    }, [location]);

    const { newPassword, confirmPassword } = formData;

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password length
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const query = new URLSearchParams(location.search);
            const resetToken = query.get('token') || sessionStorage.getItem('resetToken');

            const res = await api.post("/reset-password", {
                resetToken,
                newPassword
            });

            setSuccess(res.data.msg);

            // Clear session storage
            sessionStorage.removeItem('resetToken');
            sessionStorage.removeItem('resetEmail');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Reset Password</h2>
                {email && <p>Resetting password for: <strong>{email}</strong></p>}

                {error && <div className="error-msg">{error}</div>}
                {success && <div className="success-msg">{success}</div>}

                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={newPassword}
                            onChange={onChange}
                            required
                            placeholder="Enter new password"
                            minLength="6"
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={onChange}
                            required
                            placeholder="Confirm new password"
                            minLength="6"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <p className="auth-footer">
                    Remember your password? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPasswordPage;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles/Forms.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await api.post("/forgot-password", { email });
            setSuccess(res.data.msg);

            // Store reset token in sessionStorage for the reset password page
            sessionStorage.setItem('resetToken', res.data.resetToken);
            sessionStorage.setItem('resetEmail', res.data.email);

            // Redirect to reset password page after 2 seconds
            setTimeout(() => {
                navigate('/reset-password');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to process request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Forgot Password</h2>
                <p>Enter your email address and we'll help you reset your password.</p>

                {error && <div className="error-msg">{error}</div>}
                {success && <div className="success-msg">{success}</div>}

                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Send Reset Link'}
                    </button>
                </form>

                <p className="auth-footer">
                    Remember your password? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;

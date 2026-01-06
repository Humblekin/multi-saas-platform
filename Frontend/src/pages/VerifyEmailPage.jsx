import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css'; // Reusing login styles for consistency

const VerifyEmailPage = () => {
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email...');
    const location = useLocation();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const email = query.get('email');
        const token = query.get('token');

        if (!email || !token) {
            setStatus('error');
            setMessage('Missing email or verification token.');
            return;
        }

        const verifyEmail = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const response = await axios.get(`${apiUrl}/auth/verify-email`, {
                    params: { email, token }
                });
                setStatus('success');
                setMessage(response.data.msg || 'Email verified successfully!');
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.msg || 'Verification failed. The link may be invalid or expired.');
            }
        };

        verifyEmail();
    }, [location]);

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">Email Verification</h1>
                    <p className="login-subtitle">Multi SaaS Platform</p>
                </div>

                <div style={{ textAlign: 'center', padding: '20px' }}>
                    {status === 'verifying' && (
                        <div className="loader-container">
                            <div className="loader"></div>
                            <p>{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="success-message" style={{ color: '#4CAF50', marginBottom: '20px' }}>
                            <i className="fas fa-check-circle" style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}></i>
                            <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{message}</p>
                            <p>You can now log in to your account.</p>
                            <Link to="/login" className="login-button" style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none', textAlign: 'center' }}>
                                Go to Login
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="error-message" style={{ color: '#f44336', marginBottom: '20px' }}>
                            <i className="fas fa-times-circle" style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}></i>
                            <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{message}</p>
                            <p>Please try again or contact support if the issue persists.</p>
                            <Link to="/register" className="login-button" style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none', textAlign: 'center' }}>
                                Back to Registration
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;

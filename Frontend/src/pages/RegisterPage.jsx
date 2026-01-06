import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles/Forms.css';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const { name, email, password } = formData;

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const fbUser = userCredential.user;

            // 2. Get ID token
            const firebaseToken = await fbUser.getIdToken();

            // 3. Send name and token to backend to create Firestore record
            await api.post('/register', {
                name,
                token: firebaseToken
            });

            setSuccess(true);
        } catch (err) {
            console.error('Registration error detail:', err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Email is already in use');
            } else if (err.response && err.response.data) {
                setError(err.response.data.msg || 'Registration failed');
            } else if (err.message) {
                setError(`Registration failed: ${err.message}`);
            } else {
                setError('Registration failed. Please try again.');
            }
        }
    };

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2>Registration Successful!</h2>
                    <div className="success-msg" style={{
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        padding: '20px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        <p>We've sent a verification email to <strong>{email}</strong>.</p>
                        <p>Please check your inbox and click the verification link to activate your account.</p>
                    </div>
                    <p className="auth-footer">
                        Once verified, you can <Link to="/login">Login here</Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Create Account</h2>
                <p>Start your journey with us</p>
                {error && <div className="error-msg">{error}</div>}
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary">Sign Up</button>
                </form>
                <p className="auth-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;

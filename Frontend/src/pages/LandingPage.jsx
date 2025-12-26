import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-container">
            <nav className="landing-nav">
                <div className="logo">
                    <Link to="/">
                        <span className="logo-icon">📊</span>
                        <span className="logo-text">TotalTrack</span>
                    </Link>
                </div>
                <div className="nav-links">
                    <Link to="/login" className="btn-login">Login</Link>
                    <Link to="/register" className="btn-register" style={{color:"black"}}>Sign Up</Link>
                </div>
            </nav>

            <header className="hero-section">
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1>Manage Your Business <br /> <span className="highlight">Effortlessly</span></h1>
                    <p>One platform for Pharmacy, Inventory, School, Office management and others.</p>
                    <Link to="/register">
                        <motion.button
                            className="cta-button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Get Started
                        </motion.button>
                    </Link>
                </motion.div>

                <motion.div
                    className="hero-image"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    {/* Placeholder for a hero image */}
                    <div className="hero-placeholder">
                        <div className="floating-card card-1">💊 Pharmacy</div>
                        <div className="floating-card card-2">📦 Inventory</div>
                        <div className="floating-card card-3">🏫 School</div><br />
                        <div className="floating-card card-4">🏢 office</div>
                    </div>
                </motion.div>
            </header>
        </div>
    );
};

export default LandingPage;

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api';

const ProtectedRoute = ({ children, system, exemptPayment = false }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [hasSubscription, setHasSubscription] = useState(false);
    const [userSystem, setUserSystem] = useState(null);
    const [userRole, setUserRole] = useState('user');
    const [subscriptionError, setSubscriptionError] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user) {
                    setIsAuthenticated(true);
                    setUserRole(user.role || 'user');
                    if (user.subscription && user.subscription.isActive) {
                        setHasSubscription(true);
                        setUserSystem(user.subscription.planType);
                    }
                }

                // If accessing a specific system, verify with backend
                if (system && !exemptPayment) {
                    try {
                        // Make a test request to the system's backend to verify subscription
                        await api.get(`/${system.toLowerCase()}/stats`);
                    } catch (err) {
                        if (err.response && err.response.data) {
                            setSubscriptionError(err.response.data);
                        }
                    }
                }
            } catch (err) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [system, exemptPayment]);

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // Admin Override - Admins can access everything
    if (userRole === 'admin') {
        return children;
    }

    // Check for backend subscription errors
    if (subscriptionError) {
        if (subscriptionError.requiresPayment) {
            return <Navigate to="/payment" state={{ system: system }} />;
        }
        if (subscriptionError.wrongSystem) {
            return <Navigate to="/dashboard" />;
        }
    }

    // Frontend check (as backup)
    if (system && !exemptPayment) {
        if (!hasSubscription) {
            return <Navigate to="/payment" state={{ system: system }} />;
        }

        if (hasSubscription && userSystem !== system) {
            return <Navigate to="/dashboard" />;
        }
    }

    return children;
};

export default ProtectedRoute;

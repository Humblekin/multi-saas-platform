import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import PaymentPage from './pages/PaymentPage';
import ProtectedRoute from './components/ProtectedRoute';

// System Dashboards
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import InventoryDashboard from './pages/inventory/InventoryDashboardMain';
import SchoolDashboard from './pages/school/SchoolDashboard';
import OfficeDashboard from './pages/office/OfficeDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

import './App.css';

function App() {
    return (

        <div className="App">
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Protected Routes - Require Authentication */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/payment"
                    element={
                        <ProtectedRoute exemptPayment={true}>
                            <PaymentPage />
                        </ProtectedRoute>
                    }
                />

                {/* System Specific Routes - Protected & Subscription Validated */}
                <Route
                    path="/pharmacy/*"
                    element={
                        <ProtectedRoute system="Pharmacy">
                            <PharmacyDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/inventory/*"
                    element={
                        <ProtectedRoute system="Inventory">
                            <InventoryDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/school/*"
                    element={
                        <ProtectedRoute system="School">
                            <SchoolDashboard />
                        </ProtectedRoute>


                    }
                />
                <Route
                    path="/office/*"
                    element={
                        <ProtectedRoute system="Office">
                            <OfficeDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </div>

    );
}

export default App;

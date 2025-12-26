# 🛡️ Admin Panel - System Management

## Overview
The Admin Panel provides a centralized interface for managing the entire TotalTrack SaaS platform. It allows administrators to oversee users, subscriptions, and system health.

## 🚀 Features

### 1. **Dashboard Overview**
- **Real-time Stats**: View total users, active subscriptions, and revenue.
- **Financial Metrics**: Monthly and estimated yearly revenue calculations.
- **System Health**: Monitor database status, API latency, and total system data (drugs, products, sales).
- **Subscription Breakdown**: Visual breakdown of users by plan type (Pharmacy, Inventory, School, Office).

### 2. **User Management**
- **User List**: View all registered users with search and filter capabilities.
- **Edit User**: Update user details (name, email, role).
- **Subscription Control**:
  - Activate/Deactivate subscriptions.
  - Change plan types.
  - Set subscription end dates.
- **Delete User**: Remove users from the system.
- **Role Management**: Promote users to admins or demote them.

### 3. **Security**
- **Role-Based Access Control (RBAC)**: Only users with the `admin` role can access the panel.
- **Protected Routes**: Backend middleware ensures API endpoints are secure.

## 🛠️ Technical Implementation

### Backend
- **Routes**: `Backend/routes/admin.js`
- **Middleware**: `isAdmin` middleware checks user role before processing requests.
- **Endpoints**:
  - `GET /admin/stats`: Aggregated system statistics.
  - `GET /admin/users`: List users with filters.
  - `PUT /admin/users/:id`: Update user details.
  - `PUT /admin/users/:id/subscription`: Manage user subscriptions.
  - `DELETE /admin/users/:id`: Delete user.

### Frontend
- **Dashboard**: `Frontend/src/pages/admin/AdminDashboard.jsx`
- **User Management**: `Frontend/src/pages/admin/UserManagement.jsx`
- **Styling**: `Frontend/src/pages/admin/AdminDashboard.css` (Dark theme)

## 📱 Navigation
- Accessible via the "Go to Admin Panel" button on the main dashboard (visible only to admins).
- Sidebar navigation within the admin panel for quick access to different sections.

## 📋 Future Enhancements
- **Subscription Management Page**: Dedicated page for bulk subscription operations.
- **System Settings**: Global configuration for the SaaS platform.
- **Audit Logs**: Detailed logs of admin actions.

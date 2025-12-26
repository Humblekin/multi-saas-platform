import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Students from './Students';
import Classes from './Classes';
import Grades from './Grades';
import Teachers from './Teachers';
import Subjects from './Subjects';
import ReportCard from './ReportCard';
import Fees from './Fees';
import StudentAttendance from './StudentAttendance';
import SchoolSettings from './SchoolSettings';
import api from '../../api';
import './SchoolDashboard.css';

const SchoolDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="school-dashboard">
            {/* Mobile Menu Button */}
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
                <span className="hamburger-icon">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </button>

            {/* Overlay for mobile */}
            {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

            <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-header">
                    <h2>🏫 School</h2>
                    <p className="user-name">{user?.name}</p>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/school" className="nav-link" onClick={closeSidebar}>Dashboard</Link>
                    <Link to="/school/students" className="nav-link" onClick={closeSidebar}>Students</Link>
                    <Link to="/school/teachers" className="nav-link" onClick={closeSidebar}>Teachers</Link>
                    <Link to="/school/subjects" className="nav-link" onClick={closeSidebar}>Subjects</Link>
                    <Link to="/school/attendance" className="nav-link" onClick={closeSidebar}>Attendance</Link>
                    <Link to="/school/fees" className="nav-link" onClick={closeSidebar}>Fees</Link>
                    <Link to="/school/grades" className="nav-link" onClick={closeSidebar}>Grades</Link>
                    <Link to="/school/settings" className="nav-link" onClick={closeSidebar}>⚙️ Settings</Link>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </aside>

            <main className="main-content">
                <Routes>
                    <Route path="/" element={<SchoolHome />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/teachers" element={<Teachers />} />
                    <Route path="/subjects" element={<Subjects />} />
                    <Route path="/attendance" element={<StudentAttendance />} />
                    <Route path="/fees" element={<Fees />} />
                    <Route path="/grades" element={<Grades />} />
                    <Route path="/report-card/:studentId" element={<ReportCard />} />
                    <Route path="/settings" element={<SchoolSettings />} />
                </Routes>
            </main>
        </div>
    );
};

const SchoolHome = () => {
    const [stats, setStats] = React.useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalGrades: 0,
        totalFees: 0
    });

    React.useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/school/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch stats');
        }
    };

    return (
        <div className="dashboard-home">
            <h1>School Dashboard</h1>
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Students</h3>
                    <p className="stat-value">{stats.totalStudents}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Teachers</h3>
                    <p className="stat-value">{stats.totalTeachers}</p>
                </div>
                <div className="stat-card">
                    <h3>Fees Collected</h3>
                    <p className="stat-value">GHS {stats.totalFees?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Grades</h3>
                    <p className="stat-value">{stats.totalGrades}</p>
                </div>
            </div>
        </div>
    );
};

export default SchoolDashboard;

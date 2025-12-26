import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div>
      <nav className="landing-nav">
        <div className="logo">
          <span className="logo-icon">📊</span>
          <span className="logo-text">TotalTrack</span>
        </div>
        <div className="nav-links">
          <Link to="/login" className="btn-login">
            Login
          </Link>
          <Link to="/register" className="btn-register">
            Get Started
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;

import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Forms.css";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const navigate = useNavigate();

  const { email, password } = formData;

  // Input sanitization function
  const sanitizeInput = (value) => {
    if (typeof value !== "string") return "";
    return value
      .trim()
      .replace(/[<>\"']/g, "")
      .substring(0, 255);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: sanitizeInput(value),
    });
    setError("");
  };

  // Email validation
  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
    return emailRegex.test(emailValue);
  };

  // Password validation
  const validatePassword = (passwordValue) => {
    return passwordValue && passwordValue.length >= 6;
  };

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setIsLoading(true);

      try {
        // Client-side validation
        if (!email || !password) {
          setError("Email and password are required");
          setIsLoading(false);
          return;
        }

        if (!validateEmail(email)) {
          setError("Please enter a valid email address");
          setIsLoading(false);
          return;
        }

        if (!validatePassword(password)) {
          setError("Password must be at least 6 characters");
          setIsLoading(false);
          return;
        }

        // 1. Authenticate with Firebase
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const fbUser = userCredential.user;

        // 2. Get the unique ID token
        const firebaseToken = await fbUser.getIdToken();

        // Validate token
        if (typeof firebaseToken !== "string" || !firebaseToken.includes(".")) {
          throw new Error("Invalid authentication token");
        }

        // 3. Send token to backend
        const res = await api.post(
          "/login",
          {
            token: firebaseToken,
            email: email.toLowerCase(),
          },
          {
            timeout: 10000,
            headers: { "Content-Type": "application/json" },
          }
        );

        // Validate response
        if (
          !res.data ||
          !res.data.token ||
          !res.data.user ||
          !res.data.user.id
        ) {
          throw new Error("Invalid server response");
        }

        // Store securely
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        setRemainingAttempts(null);
        navigate("/dashboard");
      } catch (err) {
        console.error("Login error:", err);

        if (err.code === "auth/user-not-found") {
          setError("No account found with this email address");
        } else if (
          err.code === "auth/wrong-password" ||
          err.code === "auth/invalid-credential"
        ) {
          setError("Invalid email or password");
        } else if (err.response && err.response.status === 429) {
          const data = err.response.data;
          setError(
            data.msg || "Too many login attempts. Please try again later."
          );
          setRemainingAttempts(data.minutesRemaining);
        } else if (err.response && err.response.data) {
          setError(err.response.data.msg || "Login failed");
        } else if (err.code === "ECONNABORTED") {
          setError("Request timed out. Please try again.");
        } else {
          setError("Login failed. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [email, password]
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p>Login to your account</p>
        {error && (
          <div className="error-msg">
            {error}
            {remainingAttempts && (
              <div style={{ fontSize: "0.9em", marginTop: "5px" }}>
                Try again in {remainingAttempts} minute
                {remainingAttempts !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              maxLength="255"
              disabled={isLoading}
              autoComplete="email"
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
              placeholder="Enter your password"
              maxLength="255"
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
            <div className="forgot-password-link">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data } = await API.post('/auth/adminlogin', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role);
      navigate('/admin/movies');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-reel auth-bg-reel--left" />
      <div className="auth-bg-reel auth-bg-reel--right" />

      <div className="auth-card">
        <button className="auth-back" onClick={() => navigate('/home')} type="button">
          <FaArrowLeft size={11} /> Home
        </button>

        {/* Brand */}
        <div className="auth-logo">
          <span className="auth-logo-cine">Cine</span><span className="auth-logo-vora">Vora</span>
        </div>
        <p className="auth-tagline">WHERE STORIES COME ALIVE</p>

        <div className="admin-badge-row">
          <span className="admin-badge">
            <FaShieldAlt size={11} /> ADMIN PORTAL
          </span>
        </div>

        <h1 className="auth-heading">Administrator Login</h1>
        <p className="auth-sub">Access dashboard, movies, showtimes & bookings management.</p>

        <form onSubmit={handleAdminLogin} noValidate>
          {/* Email */}
          <div className="auth-field">
            <label htmlFor="admin-email">Admin Email</label>
            <div className="auth-input-wrap">
              <FaEnvelope className="auth-icon-left" />
              <input
                id="admin-email"
                type="email"
                placeholder="admin@cinevora.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="admin-password">Password</label>
            <div className="auth-input-wrap">
              <FaLock className="auth-icon-left" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-icon-right"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <IoMdEyeOff /> : <IoMdEye />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error">
              ⚠ {error}
            </div>
          )}

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? <><span className="auth-spinner" /> Verifying credentials…</> : 'Login'}
          </button>
        </form>

        <div className="auth-divider"><span>OR</span></div>

        <p className="auth-footer-link">
          Customer account? <Link to="/login">Customer Login</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;

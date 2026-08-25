import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailNotVerified, setEmailNotVerified] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Email and password are required.'); return; }
    setIsLoading(true);
    setError('');
    setEmailNotVerified(false);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role);
      navigate(data.user.role === 'admin' ? '/admin/movies' : '/home');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      if (msg.toLowerCase().includes('verify your email')) setEmailNotVerified(true);
      setError(msg);
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

        <h1 className="auth-heading">Welcome Back</h1>
        <p className="auth-sub">Sign in to continue your CineVora experience.</p>

        <form onSubmit={handleLogin} noValidate>

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="login-email">Email Address</label>
            <div className="auth-input-wrap">
              <FaEnvelope className="auth-icon-left" />
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <div className="auth-input-wrap">
              <FaLock className="auth-icon-left" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-icon-right"
                onClick={() => setShowPassword(p => !p)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <IoMdEyeOff /> : <IoMdEye />}
              </button>
            </div>
          </div>

          {/* Forgot */}
          <div className="auth-forgot">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error">
              ⚠ {error}
              {emailNotVerified && (
                <Link to="/resend-verification" className="auth-error-link">
                  Resend verification email
                </Link>
              )}
            </div>
          )}

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? <><span className="auth-spinner" /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
        <div className="auth-divider"><span>OR</span></div>
        <p className="auth-footer-link">
          Are you an admin? <Link to="/admin-login">Admin Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

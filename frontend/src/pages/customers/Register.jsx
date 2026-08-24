import React, { useState } from 'react';
import { FaUser, FaLock, FaArrowLeft } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setIsLoading(true);
    setError('');
    try {
      const { data } = await API.post('/auth/register', { name, email, password });
      setSuccess(data.message || 'Account created! Please check your email to verify your account.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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

        <h1 className="auth-heading">Create Account</h1>
        <p className="auth-sub">Join CineVora for unforgettable movie experiences.</p>

        {success ? (
          <div className="auth-success">
            <span className="auth-success-icon">✓</span>
            <div>
              <p className="auth-success-title">Account Created!</p>
              <p className="auth-success-body">{success}</p>
              <p className="auth-success-redirect">Redirecting to login…</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSignup} noValidate>

            {/* Full Name */}
            <div className="auth-field">
              <label htmlFor="reg-name">Full Name</label>
              <div className="auth-input-wrap">
                <FaUser className="auth-icon-left" />
                <input
                  id="reg-name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="reg-email">Email Address</label>
              <div className="auth-input-wrap">
                <MdEmail className="auth-icon-left" />
                <input
                  id="reg-email"
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
              <label htmlFor="reg-password">Password</label>
              <div className="auth-input-wrap">
                <FaLock className="auth-icon-left" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
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

            {/* Error */}
            {error && (
              <div className="auth-error">⚠ {error}</div>
            )}

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? <><span className="auth-spinner" /> Creating account…</> : 'Create Account'}
            </button>
          </form>
        )}

        <p className="auth-footer-link" style={{ marginTop: '20px' }}>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

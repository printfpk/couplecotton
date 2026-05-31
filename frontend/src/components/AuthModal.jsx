import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconOrders = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8V21H3V8" />
    <path d="M21 8L12 3L3 8" />
    <path d="M16 12H8" />
  </svg>
);

const AuthModal = ({ open, onClose }) => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      // Reset state on open
      setError('');
      setFormData({ email: '', password: '', username: '', firstName: '', lastName: '' });
      setIsLogin(true);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : {
            email: formData.email,
            username: formData.username,
            password: formData.password,
            fullName: {
              firstName: formData.firstName,
              lastName: formData.lastName
            }
          };

      // We'll use relative path, assuming proxy is configured in vite, or absolute localhost:5000
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${endpoint}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.errors?.[0]?.msg || 'Authentication failed');
      }

      // Success
      console.log('Auth success:', data);
      login(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
          <button className="auth-close-btn" onClick={onClose}>
            <IconClose />
          </button>
        </div>
        <div className="auth-modal-body">
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            
            {!isLogin && (
              <>
                <div className="auth-input-row">
                  <div className="auth-input-group">
                    <input type="text" name="firstName" placeholder="First Name" className="auth-input" value={formData.firstName} onChange={handleChange} required />
                  </div>
                  <div className="auth-input-group">
                    <input type="text" name="lastName" placeholder="Last Name" className="auth-input" value={formData.lastName} onChange={handleChange} required />
                  </div>
                </div>
                <div className="auth-input-group">
                  <input type="text" name="username" placeholder="Username" className="auth-input" value={formData.username} onChange={handleChange} required />
                </div>
              </>
            )}

            <div className="auth-input-group">
              <input type="text" name="email" placeholder={isLogin ? "Email or Username" : "Email"} className="auth-input" value={formData.email} onChange={handleChange} required />
            </div>
            
            <div className="auth-input-group">
              <input type="password" name="password" placeholder="Password" className="auth-input" value={formData.password} onChange={handleChange} required />
            </div>

            <button type="submit" className="auth-main-submit-btn" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
            
            <div className="auth-toggle-mode">
              {isLogin ? (
                <p>Don't have an account? <button type="button" onClick={() => setIsLogin(false)}>Sign up</button></p>
              ) : (
                <p>Already have an account? <button type="button" onClick={() => setIsLogin(true)}>Sign in</button></p>
              )}
            </div>
          </form>

          <div className="auth-footer-actions">
            <button className="auth-action-btn">
              <IconOrders /> Orders
            </button>
            <button className="auth-action-btn">
              <IconUser /> Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

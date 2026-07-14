import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--gray-200)', fontSize: '0.95rem', fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
};
const labelStyle = {
  display: 'block', fontSize: '0.88rem', fontWeight: 600,
  color: 'var(--gray-700)', marginBottom: '0.4rem',
};

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]   = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim())        errs.name = 'Name is required.';
    if (!form.email.trim())       errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password)           errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (!form.confirmPassword)    errs.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setGlobalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = 'text', placeholder = '') => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type} name={name} value={form[name]} onChange={handleChange}
        placeholder={placeholder}
        style={{ ...inputStyle, borderColor: errors[name] ? 'var(--danger)' : 'var(--gray-200)' }}
        onFocus={e => { if (!errors[name]) e.target.style.borderColor = 'var(--primary)'; }}
        onBlur={e => { if (!errors[name]) e.target.style.borderColor = 'var(--gray-200)'; }}
      />
      {errors[name] && (
        <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
          {errors[name]}
        </span>
      )}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
      padding: '2rem 1rem',
    }}>
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
        padding: '2.5rem', width: '100%', maxWidth: '440px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛍️</div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.4rem' }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem' }}>Join ShopNow and start shopping</p>
        </div>

        {globalError && (
          <div style={{
            background: '#fff5f5', border: '1.5px solid var(--danger)', borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem', marginBottom: '1.25rem', color: 'var(--danger)',
            fontSize: '0.88rem', fontWeight: 600,
          }}>
            ⚠️ {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {field('name',            'Full Name',       'text',     'John Doe')}
          {field('email',           'Email Address',   'email',    'you@example.com')}
          {field('password',        'Password',        'password', '••••••••')}
          {field('confirmPassword', 'Confirm Password','password', '••••••••')}

          <button
            type="submit" disabled={loading}
            style={{
              background: loading ? 'var(--gray-500)' : 'var(--primary)',
              color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-sm)',
              padding: '0.85rem', fontSize: '1rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s', marginTop: '0.5rem', fontFamily: 'inherit',
            }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--gray-500)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

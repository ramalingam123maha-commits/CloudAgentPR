import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

const API = process.env.REACT_APP_API_URL || '/api';

export default function LoginPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    const body = mode === 'login'
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, password: form.password };

    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      login(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(email, password) {
    setForm((f) => ({ ...f, email, password }));
    setError('');
  }

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.hero}>
          <div className={styles.heroIcon}>📚</div>
          <h1>Library Management System</h1>
          <p>Discover, manage, and borrow books from our extensive collection with ease.</p>
          <ul className={styles.features}>
            <li>📖 Browse thousands of books</li>
            <li>🔍 Advanced search & filters</li>
            <li>👤 Role-based access control</li>
            <li>✅ Real-time availability status</li>
          </ul>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <div className={styles.logoRow}>
            <span className={styles.logoIcon}>📚</span>
            <span className={styles.logoText}>Flywave </span>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${mode === 'login' ? styles.activeTab : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Sign In
            </button>
            <button
              className={`${styles.tab} ${mode === 'register' ? styles.activeTab : ''}`}
              onClick={() => { setMode('register'); setError(''); }}
            >
              Register
            </button>
          </div>

          <h2 className={styles.heading}>
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className={styles.subheading}>
            {mode === 'login'
              ? 'Sign in to access your library'
              : 'Join our library community today'}
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {mode === 'register' && (
              <div className={styles.field}>
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {mode === 'login' && (
            <div className={styles.demo}>
              <p className={styles.demoTitle}>Demo Accounts</p>
              <div className={styles.demoCards}>
                <button
                  className={styles.demoCard}
                  onClick={() => fillDemo('alice@library.com', 'password123')}
                  type="button"
                >
                  <span className={styles.demoRole}>Admin</span>
                  <span className={styles.demoEmail}>alice@library.com</span>
                  <span className={styles.demoPass}>password123</span>
                </button>
                <button
                  className={styles.demoCard}
                  onClick={() => fillDemo('bob@library.com', 'reader456')}
                  type="button"
                >
                  <span className={styles.demoRole}>User</span>
                  <span className={styles.demoEmail}>bob@library.com</span>
                  <span className={styles.demoPass}>reader456</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

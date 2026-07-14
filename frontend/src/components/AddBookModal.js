import React, { useState } from 'react';
import styles from './AddBookModal.module.css';

const API = process.env.REACT_APP_API_URL || '/api';
const GENRES = ['Fiction', 'Fantasy', 'Science Fiction', 'Classic', 'Non-Fiction', 'Mystery', 'Science'];

export default function AddBookModal({ token, onAdd, onClose }) {
  const [form, setForm] = useState({
    title: '',
    author: '',
    genre: 'Fiction',
    year: new Date().getFullYear(),
    pages: '',
    description: '',
    available: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, year: Number(form.year), pages: Number(form.pages) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add book');
      onAdd(data.book);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Add New Book</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Title *</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="Book title" required />
            </div>
            <div className={styles.field}>
              <label>Author *</label>
              <input name="author" value={form.author} onChange={handleChange} placeholder="Author name" required />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Genre</label>
              <select name="genre" value={form.genre} onChange={handleChange}>
                {GENRES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Year</label>
              <input name="year" type="number" value={form.year} onChange={handleChange} min="1000" max="2099" />
            </div>
            <div className={styles.field}>
              <label>Pages</label>
              <input name="pages" type="number" value={form.pages} onChange={handleChange} min="1" placeholder="e.g. 320" />
            </div>
          </div>

          <div className={styles.field}>
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Brief description..." />
          </div>

          <label className={styles.checkboxLabel}>
            <input type="checkbox" name="available" checked={form.available} onChange={handleChange} />
            <span>Available for borrowing</span>
          </label>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Adding…' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './BookCard.module.css';

const API = process.env.REACT_APP_API_URL || '/api';

const GENRE_COLORS = {
  Fiction: { bg: '#eff6ff', color: '#1d4ed8' },
  Fantasy: { bg: '#f5f3ff', color: '#6d28d9' },
  'Science Fiction': { bg: '#ecfdf5', color: '#065f46' },
  Classic: { bg: '#fff7ed', color: '#9a3412' },
  'Non-Fiction': { bg: '#fef9c3', color: '#854d0e' },
  Mystery: { bg: '#fdf4ff', color: '#7e22ce' },
  Science: { bg: '#f0fdfa', color: '#115e59' },
};

export default function BookCard({ book, isAdmin, token, onDelete, onUpdate }) {
  const [busy, setBusy] = useState(false);
  const genreStyle = GENRE_COLORS[book.genre] || { bg: '#f1f5f9', color: '#475569' };

  async function handleToggleAvailability() {
    setBusy(true);
    try {
      const res = await fetch(`${API}/books/${book.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ available: !book.available }),
      });
      const data = await res.json();
      if (res.ok && onUpdate) onUpdate(data.book);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/books/${book.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && onDelete) onDelete(book.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cover} style={{ background: genreStyle.bg }}>
        <span className={styles.coverEmoji}>📖</span>
      </div>

      <div className={styles.body}>
        <div className={styles.topRow}>
          <span
            className={styles.genre}
            style={{ background: genreStyle.bg, color: genreStyle.color }}
          >
            {book.genre}
          </span>
          <span className={`${styles.badge} ${book.available ? styles.available : styles.unavailable}`}>
            {book.available ? '✓ Available' : '✗ Checked Out'}
          </span>
        </div>

        <h3 className={styles.title}>{book.title}</h3>
        <p className={styles.author}>by {book.author}</p>
        <p className={styles.desc}>{book.description}</p>

        <div className={styles.meta}>
          <span className={styles.metaItem}>📅 {book.year}</span>
          <span className={styles.metaItem}>📄 {book.pages} pages</span>
        </div>

        {isAdmin && (
          <div className={styles.adminActions}>
            <button
              className={`${styles.adminBtn} ${book.available ? styles.checkoutBtn : styles.returnBtn}`}
              onClick={handleToggleAvailability}
              disabled={busy}
              aria-label={book.available ? 'Mark as checked out' : 'Mark as available'}
            >
              {book.available ? '⬆ Check Out' : '⬇ Return'}
            </button>
            <button
              className={`${styles.adminBtn} ${styles.deleteBtn}`}
              onClick={handleDelete}
              disabled={busy}
              aria-label="Delete book"
            >
              🗑 Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

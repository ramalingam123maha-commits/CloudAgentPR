import React from 'react';
import styles from './BookCard.module.css';

const GENRE_COLORS = {
  Fiction: { bg: '#eff6ff', color: '#1d4ed8' },
  Fantasy: { bg: '#f5f3ff', color: '#6d28d9' },
  'Science Fiction': { bg: '#ecfdf5', color: '#065f46' },
  Classic: { bg: '#fff7ed', color: '#9a3412' },
  'Non-Fiction': { bg: '#fef9c3', color: '#854d0e' },
  Mystery: { bg: '#fdf4ff', color: '#7e22ce' },
  Science: { bg: '#f0fdfa', color: '#115e59' },
};

export default function BookCard({ book }) {
  const genreStyle = GENRE_COLORS[book.genre] || { bg: '#f1f5f9', color: '#475569' };

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
      </div>
    </div>
  );
}

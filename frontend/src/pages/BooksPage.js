import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import BookCard from '../components/BookCard';
import AddBookModal from '../components/AddBookModal';
import styles from './BooksPage.module.css';

const API = process.env.REACT_APP_API_URL || '/api';

const GENRES = ['All', 'Fiction', 'Fantasy', 'Science Fiction', 'Classic', 'Non-Fiction', 'Mystery', 'Science'];

export default function BooksPage() {
  const { token, user } = useAuth();
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [showAvailable, setShowAvailable] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (genre && genre !== 'All') params.append('genre', genre);
    if (showAvailable) params.append('available', 'true');

    try {
      const res = await fetch(`${API}/books?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load books');
      const data = await res.json();
      setBooks(data.books);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, search, genre, showAvailable]);

  useEffect(() => {
    const timer = setTimeout(fetchBooks, 300);
    return () => clearTimeout(timer);
  }, [fetchBooks]);

  function handleBookAdded(book) {
    setBooks((prev) => [book, ...prev]);
    setTotal((t) => t + 1);
    setShowModal(false);
  }

  function handleBookDeleted(id) {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    setTotal((t) => t - 1);
  }

  function handleBookUpdated(updatedBook) {
    setBooks((prev) => prev.map((b) => (b.id === updatedBook.id ? updatedBook : b)));
  }

  const stats = {
    total: books.length,
    available: books.filter((b) => b.available).length,
    checkedOut: books.filter((b) => !b.available).length,
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Book Catalog</h1>
            <p className={styles.subtitle}>
              Explore and manage the library collection
            </p>
          </div>
          {user?.role === 'admin' && (
            <button className={styles.addBtn} onClick={() => setShowModal(true)}>
              + Add Book
            </button>
          )}
        </div>

        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{total}</span>
            <span className={styles.statLabel}>Total Books</span>
          </div>
          <div className={styles.stat}>
            <span className={`${styles.statNum} ${styles.green}`}>{stats.available}</span>
            <span className={styles.statLabel}>Available</span>
          </div>
          <div className={styles.stat}>
            <span className={`${styles.statNum} ${styles.red}`}>{stats.checkedOut}</span>
            <span className={styles.statLabel}>Checked Out</span>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.filters}>
            <select
              className={styles.select}
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <button
              className={`${styles.availableToggle} ${showAvailable ? styles.activeToggle : ''}`}
              onClick={() => setShowAvailable((v) => !v)}
            >
              {showAvailable ? '✓ Available Only' : 'All Status'}
            </button>
          </div>
        </div>

        {error && <div className={styles.errorBanner} role="alert">{error}</div>}

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading books…</p>
          </div>
        ) : books.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📭</span>
            <p>No books match your search criteria.</p>
            <button className={styles.resetBtn} onClick={() => { setSearch(''); setGenre('All'); setShowAvailable(false); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isAdmin={user?.role === 'admin'}
                token={token}
                onDelete={handleBookDeleted}
                onUpdate={handleBookUpdated}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <AddBookModal
          token={token}
          onAdd={handleBookAdded}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

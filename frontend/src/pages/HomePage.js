import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

const CATEGORIES = [
  { name: 'Electronics',  emoji: '💻' },
  { name: 'Clothing',     emoji: '👗' },
  { name: 'Home & Garden',emoji: '🏡' },
  { name: 'Sports',       emoji: '⚽' },
  { name: 'Books',        emoji: '📚' },
  { name: 'Beauty',       emoji: '💄' },
  { name: 'Toys',         emoji: '🧸' },
  { name: 'Automotive',   emoji: '🚗' },
];

const STATS = [
  { value: '10,000+', label: 'Products',  icon: '📦' },
  { value: '50,000+', label: 'Customers', icon: '👥' },
  { value: '100+',    label: 'Brands',    icon: '🏆' },
  { value: '24/7',    label: 'Support',   icon: '💬' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [email,    setEmail]    = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    api.get('/products?featured=true&limit=8')
      .then(r => setFeatured(r.data.products || r.data))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ===== HERO ===== */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 50%, var(--secondary) 100%)',
        color: 'var(--white)',
        padding: '7rem 1.5rem 5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)', top: '-100px', right: '-100px', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: '250px', height: '250px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)', bottom: '-60px', left: '-60px', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block', background: 'rgba(255,255,255,0.15)',
            borderRadius: 'var(--radius-lg)', padding: '0.4rem 1.1rem',
            fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem',
            backdropFilter: 'blur(8px)',
          }}>
            🎉 Free shipping on orders over $100
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.6rem)', fontWeight: 900,
            lineHeight: 1.15, marginBottom: '1.25rem',
            textShadow: '0 2px 12px rgba(0,0,0,0.15)',
          }}>
            Discover Amazing<br />Products Today
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)', opacity: 0.9,
            marginBottom: '2.5rem', lineHeight: 1.6,
          }}>
            Shop from thousands of premium products. Fast delivery, easy returns, and unbeatable prices — all in one place.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" style={{
              background: 'var(--white)', color: 'var(--primary)',
              padding: '0.9rem 2.2rem', borderRadius: 'var(--radius-md)',
              textDecoration: 'none', fontWeight: 800, fontSize: '1rem',
              boxShadow: 'var(--shadow-md)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              Shop Now →
            </Link>
            <button
              onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'rgba(255,255,255,0.18)', color: 'var(--white)',
                padding: '0.9rem 2.2rem', borderRadius: 'var(--radius-md)',
                border: '2px solid rgba(255,255,255,0.5)', fontWeight: 800,
                fontSize: '1rem', cursor: 'pointer',
                backdropFilter: 'blur(4px)', fontFamily: 'inherit',
              }}
            >
              Browse Categories
            </button>
          </div>
        </div>
      </section>

      {/* ===== STATS BANNER ===== */}
      <section style={{ background: 'var(--dark)', padding: '2.5rem 1.5rem' }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1.5rem', textAlign: 'center',
        }}>
          {STATS.map(({ value, label, icon }) => (
            <div key={label}>
              <div style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>{icon}</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--white)' }}>{value}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section id="categories" style={{ padding: '4.5rem 1.5rem', background: 'var(--gray-100)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
              Shop by Category
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '1rem' }}>
              Find exactly what you're looking for
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '1rem',
          }}>
            {CATEGORIES.map(({ name, emoji }) => (
              <button
                key={name}
                onClick={() => navigate(`/products?category=${encodeURIComponent(name)}`)}
                style={{
                  background: 'var(--white)', border: '1.5px solid var(--gray-200)',
                  borderRadius: 'var(--radius-md)', padding: '1.5rem 0.75rem',
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease',
                  boxShadow: 'var(--shadow-sm)', fontFamily: 'inherit',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--primary)';
                  e.currentTarget.style.color = 'var(--white)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--white)';
                  e.currentTarget.style.color = 'inherit';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--gray-200)';
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>{emoji}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.3 }}>{name}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section style={{ padding: '4.5rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '0.25rem' }}>
                Featured Products
              </h2>
              <p style={{ color: 'var(--gray-500)' }}>Handpicked deals just for you</p>
            </div>
            <Link to="/products" style={{
              background: 'var(--primary)', color: 'var(--white)',
              padding: '0.65rem 1.5rem', borderRadius: 'var(--radius-sm)',
              textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
            }}>
              View All →
            </Link>
          </div>

          {loading ? (
            <Spinner message="Loading featured products…" />
          ) : featured.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--gray-500)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
              <p>No featured products yet. Check back soon!</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
              gap: '1.25rem',
            }}>
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ===== PROMO BANNER ===== */}
      <section style={{
        background: 'linear-gradient(135deg, #ff6584 0%, #f39c12 100%)',
        padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--white)',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔥</div>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 900, marginBottom: '0.75rem' }}>
            Summer Sale — Up to 50% Off!
          </h2>
          <p style={{ opacity: 0.9, marginBottom: '2rem', lineHeight: 1.6 }}>
            Limited time deals on thousands of items. Don't miss out on these incredible savings.
          </p>
          <Link to="/products?sale=true" style={{
            background: 'var(--white)', color: '#ff6584',
            padding: '0.9rem 2.5rem', borderRadius: 'var(--radius-md)',
            textDecoration: 'none', fontWeight: 800, fontSize: '1rem',
            boxShadow: 'var(--shadow-md)',
            display: 'inline-block',
          }}>
            Shop the Sale
          </Link>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section style={{ padding: '4.5rem 1.5rem', background: 'var(--gray-100)' }}>
        <div style={{
          maxWidth: '560px', margin: '0 auto', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📬</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Stay in the Loop
          </h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: '1.75rem' }}>
            Subscribe to get exclusive deals, new arrivals, and updates straight to your inbox.
          </p>
          {subscribed ? (
            <div style={{
              background: '#f0fff4', border: '1.5px solid var(--success)',
              borderRadius: 'var(--radius-md)', padding: '1.25rem',
              color: 'var(--success)', fontWeight: 700,
            }}>
              ✓ Thanks for subscribing! We'll be in touch soon.
            </div>
          ) : (
            <form
              onSubmit={e => { e.preventDefault(); if (email) setSubscribed(true); }}
              style={{ display: 'flex', gap: '0.75rem', maxWidth: '420px', margin: '0 auto' }}
            >
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email…"
                required
                style={{
                  flex: 1, padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--gray-200)', fontSize: '0.95rem',
                  fontFamily: 'inherit', outline: 'none',
                }}
              />
              <button type="submit" style={{
                background: 'var(--primary)', color: 'var(--white)', border: 'none',
                borderRadius: 'var(--radius-sm)', padding: '0.8rem 1.4rem',
                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem',
              }}>
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

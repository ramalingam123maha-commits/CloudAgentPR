import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const PLACEHOLDER = 'https://via.placeholder.com/300x300?text=No+Image';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [adding, setAdding] = useState(false);
  const [added, setAdded]   = useState(false);

  if (!product) return null;

  const {
    _id, name, brand, price, rating, numReviews,
    category, images, imageUrl, countInStock,
  } = product;

  const img = (images && images[0]) || imageUrl || PLACEHOLDER;
  const inStock = countInStock > 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !inStock || adding) return;
    setAdding(true);
    try {
      await addToCart(_id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch {
      // silently fail — user will see cart empty
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <style>{`
        .product-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .product-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg) !important; }
        .product-card-img { transition: transform 0.3s ease; }
        .product-card:hover .product-card-img { transform: scale(1.04); }
        .add-cart-btn:hover:not(:disabled) { background: var(--primary-dark) !important; }
        .add-cart-btn:disabled { opacity: 0.55; cursor: not-allowed; }
      `}</style>

      <Link
        to={`/products/${_id}`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <div
          className="product-card"
          style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
            border: '1px solid var(--gray-200)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Image */}
          <div style={{ position: 'relative', paddingTop: '75%', overflow: 'hidden', background: 'var(--gray-100)' }}>
            <img
              className="product-card-img"
              src={img}
              alt={name}
              onError={(e) => { e.target.src = PLACEHOLDER; }}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
              }}
            />
            {/* Category badge */}
            {category && (
              <span style={{
                position: 'absolute', top: '10px', left: '10px',
                background: 'var(--primary)',
                color: 'var(--white)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.2rem 0.55rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                {category}
              </span>
            )}
            {/* Out of stock overlay */}
            {!inStock && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  background: 'var(--danger)',
                  color: 'var(--white)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.35rem 0.9rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}>
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
            {brand && (
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {brand}
              </span>
            )}
            <h3 style={{
              fontSize: '0.95rem', fontWeight: 700, color: 'var(--gray-900)',
              margin: 0, lineHeight: 1.4,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {name}
            </h3>
            <StarRating rating={rating || 0} numReviews={numReviews} size="sm" />

            <div style={{ marginTop: 'auto', paddingTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                ${Number(price).toFixed(2)}
              </span>
              <button
                className="add-cart-btn"
                onClick={handleAddToCart}
                disabled={!inStock || adding || !isAuthenticated}
                style={{
                  background: added ? 'var(--success)' : 'var(--primary)',
                  color: 'var(--white)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                }}
              >
                {!isAuthenticated ? '🔒 Login' : adding ? '...' : added ? '✓ Added!' : '+ Cart'}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}

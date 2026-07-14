import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import Spinner from '../components/Spinner';
import ProductCard from '../components/ProductCard';

const PLACEHOLDER = 'https://via.placeholder.com/600x600?text=No+Image';

export default function ProductDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product,  setProduct]  = useState(null);
  const [related,  setRelated]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [qty,      setQty]      = useState(1);
  const [activeImg,setActiveImg]= useState(0);
  const [adding,   setAdding]   = useState(false);
  const [addMsg,   setAddMsg]   = useState('');
  const [reviews,  setReviews]  = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    api.get(`/products/${id}`)
      .then(r => {
        const p = r.data.product || r.data;
        setProduct(p);
        setReviews(p.reviews || []);
        if (p.category) {
          api.get(`/products?category=${encodeURIComponent(p.category)}&limit=4`)
            .then(r2 => {
              const all = r2.data.products || r2.data || [];
              setRelated(all.filter(x => x._id !== p._id).slice(0, 4));
            }).catch(() => {});
        }
      })
      .catch(() => navigate('/products', { replace: true }))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const images = product
    ? ((product.images && product.images.length) ? product.images : [product.imageUrl || PLACEHOLDER])
    : [];

  const handleAddToCart = async (buyNow = false) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setAdding(true);
    try {
      await addToCart(product._id, qty);
      if (buyNow) { navigate('/cart'); return; }
      setAddMsg('Added to cart!');
      setTimeout(() => setAddMsg(''), 2200);
    } catch {
      setAddMsg('Could not add to cart.');
    } finally {
      setAdding(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) { setReviewError('Please enter a comment.'); return; }
    setReviewLoading(true);
    setReviewError('');
    try {
      const r = await api.post(`/products/${id}/reviews`, reviewForm);
      const updated = r.data.product || r.data;
      setReviews(updated.reviews || []);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <Spinner fullPage message="Loading product…" />;
  if (!product) return null;

  const { name, brand, price, countInStock, description, category, rating, numReviews } = product;
  const inStock = countInStock > 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>

      {/* Breadcrumb */}
      <nav style={{ marginBottom: '1.5rem', fontSize: '0.88rem', color: 'var(--gray-500)' }}>
        <Link to="/" style={{ color: 'var(--gray-500)', textDecoration: 'none' }}>Home</Link>
        {' / '}
        <Link to="/products" style={{ color: 'var(--gray-500)', textDecoration: 'none' }}>Products</Link>
        {category && <>{' / '}<Link to={`/products?category=${encodeURIComponent(category)}`} style={{ color: 'var(--gray-500)', textDecoration: 'none' }}>{category}</Link></>}
        {' / '}
        <span style={{ color: 'var(--gray-900)', fontWeight: 600 }}>{name}</span>
      </nav>

      {/* Main product layout */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '3rem', marginBottom: '3.5rem',
      }}>
        {/* Image gallery */}
        <div>
          <div style={{
            borderRadius: 'var(--radius-md)', overflow: 'hidden',
            background: 'var(--gray-100)', marginBottom: '0.75rem',
            border: '1.5px solid var(--gray-200)', paddingTop: '100%', position: 'relative',
          }}>
            <img
              src={images[activeImg] || PLACEHOLDER}
              alt={name}
              onError={e => { e.target.src = PLACEHOLDER; }}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '1rem', boxSizing: 'border-box' }}
            />
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{
                  width: '72px', height: '72px', borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden', border: `2px solid ${i === activeImg ? 'var(--primary)' : 'var(--gray-200)'}`,
                  cursor: 'pointer', background: 'var(--gray-100)', padding: 0,
                }}>
                  <img src={img} alt={`thumb-${i}`} onError={e => { e.target.src = PLACEHOLDER; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {category && (
            <span style={{
              display: 'inline-block', background: 'var(--primary)', color: 'var(--white)',
              borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.7rem',
              fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
              alignSelf: 'flex-start',
            }}>
              {category}
            </span>
          )}
          <h1 style={{ fontSize: '1.65rem', fontWeight: 900, lineHeight: 1.25, margin: 0 }}>{name}</h1>
          {brand && <p style={{ color: 'var(--gray-500)', fontWeight: 600, margin: 0 }}>by {brand}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <StarRating rating={rating || 0} numReviews={numReviews} size="md" />
            <span style={{ color: 'var(--gray-500)', fontSize: '0.88rem' }}>
              {numReviews || 0} review{numReviews !== 1 ? 's' : ''}
            </span>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)',
            color: 'var(--white)', borderRadius: 'var(--radius-sm)', padding: '1rem 1.25rem',
            display: 'flex', alignItems: 'baseline', gap: '0.6rem',
          }}>
            <span style={{ fontSize: '2rem', fontWeight: 900 }}>${Number(price).toFixed(2)}</span>
          </div>

          {/* Stock */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-sm)',
            background: inStock ? '#f0fff4' : '#fff5f5',
            border: `1.5px solid ${inStock ? 'var(--success)' : 'var(--danger)'}`,
            alignSelf: 'flex-start',
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: inStock ? 'var(--success)' : 'var(--danger)' }}>
              {inStock ? `✓ In Stock (${countInStock} available)` : '✗ Out of Stock'}
            </span>
          </div>

          {/* Qty + buttons */}
          {inStock && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex', alignItems: 'center', border: '1.5px solid var(--gray-200)',
                borderRadius: 'var(--radius-sm)', overflow: 'hidden',
              }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{
                  padding: '0.6rem 1rem', border: 'none', background: 'var(--gray-100)',
                  cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'inherit',
                }}>−</button>
                <span style={{ padding: '0.6rem 1.25rem', fontWeight: 700, minWidth: '40px', textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(countInStock, q + 1))} style={{
                  padding: '0.6rem 1rem', border: 'none', background: 'var(--gray-100)',
                  cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'inherit',
                }}>+</button>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flex: 1 }}>
                <button onClick={() => handleAddToCart(false)} disabled={adding} style={{
                  flex: 1, background: 'var(--primary)', color: 'var(--white)',
                  border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.75rem',
                  fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.95rem',
                  opacity: adding ? 0.7 : 1,
                }}>
                  🛒 Add to Cart
                </button>
                <button onClick={() => handleAddToCart(true)} disabled={adding} style={{
                  flex: 1, background: 'var(--secondary)', color: 'var(--white)',
                  border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.75rem',
                  fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.95rem',
                  opacity: adding ? 0.7 : 1,
                }}>
                  ⚡ Buy Now
                </button>
              </div>
            </div>
          )}

          {addMsg && (
            <div style={{
              background: '#f0fff4', border: '1.5px solid var(--success)',
              borderRadius: 'var(--radius-sm)', padding: '0.65rem 1rem',
              color: 'var(--success)', fontWeight: 700, fontSize: '0.88rem',
            }}>
              ✓ {addMsg}
            </div>
          )}

          {description && (
            <div style={{ borderTop: '1.5px solid var(--gray-200)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>Description</h3>
              <p style={{ color: 'var(--gray-700)', lineHeight: 1.7, fontSize: '0.95rem', margin: 0 }}>{description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div style={{ borderTop: '1.5px solid var(--gray-200)', paddingTop: '2.5rem', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>
          Customer Reviews ({reviews.length})
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
          {/* Review list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--gray-500)' }}>No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((rev, i) => (
                <div key={i} style={{
                  background: 'var(--white)', border: '1.5px solid var(--gray-200)',
                  borderRadius: 'var(--radius-md)', padding: '1.1rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700 }}>{rev.userName || rev.name || 'Anonymous'}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <StarRating rating={rev.rating} size="sm" />
                  <p style={{ marginTop: '0.5rem', color: 'var(--gray-700)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {rev.comment}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Write review form */}
          <div>
            {isAuthenticated ? (
              <div style={{
                background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: '1.5rem',
                border: '1.5px solid var(--gray-200)',
              }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>Write a Review</h3>
                {reviewError && (
                  <div style={{ background: '#fff5f5', border: '1.5px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.9rem', marginBottom: '0.9rem', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>
                    ⚠️ {reviewError}
                  </div>
                )}
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: '0.35rem' }}>Rating</label>
                    <select value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                      style={{ padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--gray-200)', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none' }}>
                      {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} ★ — {['Excellent','Good','Average','Poor','Terrible'][5-r]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: '0.35rem' }}>Comment</label>
                    <textarea value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="Share your experience with this product…" rows={4}
                      style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--gray-200)', fontFamily: 'inherit', fontSize: '0.9rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <button type="submit" disabled={reviewLoading} style={{
                    background: 'var(--primary)', color: 'var(--white)', border: 'none',
                    borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', opacity: reviewLoading ? 0.7 : 1,
                  }}>
                    {reviewLoading ? 'Submitting…' : 'Submit Review'}
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', border: '1.5px dashed var(--gray-200)' }}>
                <p style={{ color: 'var(--gray-500)', marginBottom: '1rem' }}>Sign in to write a review</p>
                <Link to="/login" style={{ background: 'var(--primary)', color: 'var(--white)', padding: '0.65rem 1.5rem', borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontWeight: 700 }}>
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div style={{ borderTop: '1.5px solid var(--gray-200)', paddingTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>Related Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.1rem' }}>
            {related.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}

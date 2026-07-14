import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Spinner from '../components/Spinner';

const PLACEHOLDER = 'https://via.placeholder.com/80x80?text=Item';
const SHIPPING_THRESHOLD = 100;
const SHIPPING_COST = 9.99;
const TAX_RATE = 0.08;

export default function CartPage() {
  const { items, loading, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (loading) return <Spinner fullPage message="Loading cart…" />;

  const subtotal  = cartTotal;
  const shipping  = subtotal > SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax       = subtotal * TAX_RATE;
  const total     = subtotal + shipping + tax;

  if (!items || items.length === 0) {
    return (
      <div style={{ maxWidth: '700px', margin: '5rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🛒</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: '2rem', fontSize: '1.05rem' }}>
          Looks like you haven't added anything yet. Let's change that!
        </p>
        <Link to="/products" style={{
          background: 'var(--primary)', color: 'var(--white)',
          padding: '0.9rem 2.5rem', borderRadius: 'var(--radius-md)',
          textDecoration: 'none', fontWeight: 800, fontSize: '1rem',
          display: 'inline-block',
        }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          Shopping Cart <span style={{ color: 'var(--gray-500)', fontWeight: 500, fontSize: '1.1rem' }}>({items.length} {items.length === 1 ? 'item' : 'items'})</span>
        </h1>
        <button onClick={clearCart} style={{
          background: 'none', border: '1.5px solid var(--danger)', color: 'var(--danger)',
          borderRadius: 'var(--radius-sm)', padding: '0.5rem 1.1rem', cursor: 'pointer',
          fontWeight: 700, fontSize: '0.85rem', fontFamily: 'inherit',
        }}>
          🗑 Clear Cart
        </button>
      </div>

      {/* Free shipping progress */}
      {subtotal < SHIPPING_THRESHOLD && (
        <div style={{
          background: '#fffbeb', border: '1.5px solid var(--warning)', borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ fontSize: '1.2rem' }}>🚚</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Add <strong>${(SHIPPING_THRESHOLD - subtotal).toFixed(2)}</strong> more for free shipping!
            </div>
            <div style={{ background: 'var(--gray-200)', borderRadius: '99px', height: '6px' }}>
              <div style={{
                background: 'var(--warning)', height: '6px', borderRadius: '99px',
                width: `${Math.min(100, (subtotal / SHIPPING_THRESHOLD) * 100)}%`,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'flex-start' }}>

        {/* Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map((item) => {
            const product = item.product || item;
            const img     = (product.images && product.images[0]) || product.imageUrl || PLACEHOLDER;
            const unitPrice = Number(item.price || product.price || 0);
            const lineTotal = unitPrice * item.quantity;

            return (
              <div key={item._id || product._id} style={{
                background: 'var(--white)', borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)',
                padding: '1.25rem',
                display: 'flex', gap: '1.25rem', alignItems: 'center',
              }}>
                {/* Image */}
                <Link to={`/products/${product._id}`}>
                  <img src={img} alt={product.name}
                    onError={e => { e.target.src = PLACEHOLDER; }}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)', flexShrink: 0 }}
                  />
                </Link>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.name}
                    </h3>
                  </Link>
                  {product.brand && <p style={{ color: 'var(--gray-500)', fontSize: '0.82rem', margin: 0 }}>{product.brand}</p>}
                  <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem', marginTop: '0.3rem' }}>
                    ${unitPrice.toFixed(2)} each
                  </p>
                </div>

                {/* Quantity stepper */}
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <button onClick={() => updateQuantity(product._id, item.quantity - 1)} style={{ padding: '0.45rem 0.8rem', border: 'none', background: 'var(--gray-100)', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>−</button>
                  <span style={{ padding: '0.45rem 0.8rem', minWidth: '36px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(product._id, item.quantity + 1)} style={{ padding: '0.45rem 0.8rem', border: 'none', background: 'var(--gray-100)', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>+</button>
                </div>

                {/* Line total */}
                <div style={{ textAlign: 'right', minWidth: '75px' }}>
                  <div style={{ fontWeight: 800, color: 'var(--gray-900)' }}>${lineTotal.toFixed(2)}</div>
                </div>

                {/* Remove */}
                <button onClick={() => removeFromCart(product._id)} style={{
                  background: 'none', border: 'none', color: 'var(--danger)',
                  cursor: 'pointer', fontSize: '1.15rem', padding: '0.25rem',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  ✕
                </button>
              </div>
            );
          })}

          <Link to="/products" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', alignSelf: 'flex-start', marginTop: '0.5rem' }}>
            ← Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)', border: '1px solid var(--gray-200)',
          padding: '1.75rem', position: 'sticky', top: '90px',
        }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1.5px solid var(--gray-200)' }}>
            Order Summary
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Subtotal', value: `$${subtotal.toFixed(2)}` },
              { label: 'Shipping', value: shipping === 0 ? '🎉 Free' : `$${shipping.toFixed(2)}` },
              { label: 'Tax (8%)', value: `$${tax.toFixed(2)}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: 'var(--gray-700)' }}>
                <span>{label}</span>
                <span style={{ fontWeight: 600, color: label === 'Shipping' && shipping === 0 ? 'var(--success)' : 'inherit' }}>{value}</span>
              </div>
            ))}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            borderTop: '2px solid var(--gray-900)', paddingTop: '1rem', marginBottom: '1.5rem',
          }}>
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Total</span>
            <span style={{ fontWeight: 900, fontSize: '1.35rem', color: 'var(--primary)' }}>${total.toFixed(2)}</span>
          </div>
          <button onClick={() => navigate('/checkout')} style={{
            width: '100%', background: 'var(--primary)', color: 'var(--white)',
            border: 'none', borderRadius: 'var(--radius-sm)', padding: '1rem',
            fontWeight: 800, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit',
            transition: 'background 0.2s',
          }}>
            Proceed to Checkout →
          </button>
          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
            🔒 Secure checkout · Free returns
          </div>
        </div>
      </div>
    </div>
  );
}

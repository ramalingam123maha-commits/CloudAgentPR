import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const STATUS_COLORS = {
  pending:    { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  processing: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  shipped:    { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  delivered:  { bg: '#f0fdf4', color: '#166534', border: '#86efac' },
  cancelled:  { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
};

const PLACEHOLDER = 'https://via.placeholder.com/64x64?text=Item';

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status?.toLowerCase()] || {};
  return (
    <span style={{
      background: s.bg || 'var(--gray-100)', color: s.color || 'var(--gray-700)',
      border: `1.5px solid ${s.border || 'var(--gray-200)'}`,
      borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.85rem',
      fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize',
    }}>
      {status}
    </span>
  );
}

function StatusTracker({ status }) {
  const currentIdx = STATUS_STEPS.findIndex(s => s.toLowerCase() === status?.toLowerCase());
  if (status?.toLowerCase() === 'cancelled') {
    return (
      <div style={{ background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: 'var(--radius-sm)', padding: '1rem 1.25rem', color: '#be123c', fontWeight: 700, textAlign: 'center' }}>
        ✕ This order has been cancelled
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '1.5rem 0', overflow: 'auto' }}>
      {STATUS_STEPS.map((s, i) => {
        const done    = i <= currentIdx;
        const current = i === currentIdx;
        return (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', minWidth: '80px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: done ? 'var(--primary)' : 'var(--gray-200)',
                color: done ? 'var(--white)' : 'var(--gray-500)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '1rem',
                boxShadow: current ? '0 0 0 4px rgba(108,99,255,0.2)' : 'none',
                transition: 'all 0.2s',
              }}>
                {done ? (current ? ['⏳','⚙️','🚚','🎉'][i] : '✓') : i + 1}
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: current ? 800 : 500, color: current ? 'var(--primary)' : done ? 'var(--gray-700)' : 'var(--gray-500)', textAlign: 'center' }}>
                {s}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div style={{ flex: 1, height: '3px', background: i < currentIdx ? 'var(--primary)' : 'var(--gray-200)', minWidth: '40px', transition: 'background 0.3s', margin: '0 0.5rem', marginBottom: '1.4rem' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const justPlaced = location.state?.justPlaced;

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => setOrder(r.data.order || r.data))
      .catch(() => setError('Could not load order details.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner message="Loading order…" />;
  if (error)   return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--danger)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
      <p>{error}</p>
      <Link to="/orders" style={{ color: 'var(--primary)', fontWeight: 700 }}>← Back to Orders</Link>
    </div>
  );

  const status    = order?.status || order?.orderStatus || 'pending';
  const shipping  = order?.shippingAddress || {};
  const payment   = order?.paymentMethod;
  const items     = order?.orderItems || [];
  const subtotal  = Number(order?.itemsPrice || 0);
  const shipCost  = Number(order?.shippingPrice || 0);
  const tax       = Number(order?.taxPrice || 0);
  const total     = Number(order?.totalPrice || 0);

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem' }}>

      {/* Confirmation banner for new orders */}
      {justPlaced && (
        <div style={{
          background: 'linear-gradient(135deg, var(--success), #16a34a)',
          color: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '1.5rem',
          textAlign: 'center', marginBottom: '2rem', boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
          <h2 style={{ fontWeight: 900, fontSize: '1.35rem', marginBottom: '0.3rem' }}>Order Placed Successfully!</h2>
          <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>
            Thank you for your purchase. We'll send you an update when your order ships.
          </p>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
              Order #{order?._id?.slice(-8).toUpperCase()}
            </h1>
            <StatusBadge status={status} />
          </div>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', margin: 0 }}>
            Placed on {new Date(order?.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/orders" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
          ← My Orders
        </Link>
      </div>

      {/* Status tracker */}
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1rem' }}>Order Progress</h3>
        <StatusTracker status={status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'flex-start' }}>

        {/* Order items */}
        <div>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1.5px solid var(--gray-200)', fontWeight: 700, fontSize: '0.95rem' }}>
              Items ({items.length})
            </div>
            {items.map((item, i) => {
              const img = item.image || PLACEHOLDER;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem',
                  borderBottom: i < items.length - 1 ? '1px solid var(--gray-200)' : 'none',
                }}>
                  <img src={img} alt={item.name} onError={e => { e.target.src = PLACEHOLDER; }}
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, margin: 0, fontSize: '0.92rem' }}>{item.name}</p>
                    <p style={{ color: 'var(--gray-500)', margin: 0, fontSize: '0.82rem' }}>Qty: {item.quantity}</p>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shipping + Payment */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)', padding: '1.25rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>📦 Shipping Address</h3>
              <div style={{ fontSize: '0.88rem', color: 'var(--gray-700)', lineHeight: 1.7 }}>
                <p style={{ margin: 0 }}>{shipping.firstName} {shipping.lastName}</p>
                <p style={{ margin: 0 }}>{shipping.address}</p>
                <p style={{ margin: 0 }}>{shipping.city}, {shipping.state} {shipping.zipCode}</p>
                <p style={{ margin: 0 }}>{shipping.country}</p>
              </div>
            </div>
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)', padding: '1.25rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>💳 Payment</h3>
              <div style={{ fontSize: '0.88rem', color: 'var(--gray-700)' }}>
                <p style={{ margin: 0, textTransform: 'capitalize', marginBottom: '0.4rem' }}>
                  {payment === 'card' ? '💳 Credit / Debit Card' : payment === 'paypal' ? '🅿️ PayPal' : '💵 Cash on Delivery'}
                </p>
                <span style={{
                  background: order?.isPaid ? '#f0fff4' : '#fff5f5',
                  color: order?.isPaid ? 'var(--success)' : 'var(--danger)',
                  border: `1.5px solid ${order?.isPaid ? 'var(--success)' : 'var(--danger)'}`,
                  borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.6rem', fontSize: '0.78rem', fontWeight: 700,
                }}>
                  {order?.isPaid ? '✓ Paid' : 'Not Paid'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)', padding: '1.5rem', position: 'sticky', top: '90px' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1.5px solid var(--gray-200)' }}>
            Price Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Subtotal',      value: `$${subtotal.toFixed(2)}`  },
              { label: 'Shipping',      value: shipCost === 0 ? '🎉 Free' : `$${shipCost.toFixed(2)}` },
              { label: 'Tax',           value: `$${tax.toFixed(2)}`       },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--gray-700)' }}>
                <span>{label}</span>
                <span style={{ fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--gray-900)', paddingTop: '1rem', fontWeight: 800 }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

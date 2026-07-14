import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const STATUS_COLORS = {
  pending:    { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  processing: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  shipped:    { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  delivered:  { bg: '#f0fdf4', color: '#166534', border: '#86efac' },
  cancelled:  { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status?.toLowerCase()] || { bg: 'var(--gray-100)', color: 'var(--gray-700)', border: 'var(--gray-200)' };
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1.5px solid ${s.border}`,
      borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.7rem',
      fontSize: '0.78rem', fontWeight: 700, textTransform: 'capitalize',
    }}>
      {status || 'Unknown'}
    </span>
  );
}

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get('/orders/myorders')
      .then(r => setOrders(r.data.orders || r.data || []))
      .catch(() => setError('Could not load orders.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner message="Loading your orders…" />;

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>My Orders</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>Track and manage your purchases</p>

      {error && (
        <div style={{ background: '#fff5f5', border: '1.5px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '1rem', color: 'var(--danger)', fontWeight: 600, marginBottom: '1.5rem' }}>
          ⚠️ {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--gray-500)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.25rem' }}>📦</div>
          <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No orders yet</h2>
          <p style={{ marginBottom: '1.75rem' }}>You haven't placed any orders. Start shopping!</p>
          <Link to="/products" style={{ background: 'var(--primary)', color: 'var(--white)', padding: '0.85rem 2rem', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 700 }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.8fr 0.8fr 1fr 0.8fr',
            padding: '1rem 1.5rem', background: 'var(--gray-100)',
            fontWeight: 700, fontSize: '0.8rem', color: 'var(--gray-500)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            borderBottom: '1.5px solid var(--gray-200)',
          }}>
            <span>Order #</span>
            <span>Date</span>
            <span>Items</span>
            <span>Total</span>
            <span>Status</span>
            <span style={{ textAlign: 'right' }}>Action</span>
          </div>

          {orders.map((order, i) => (
            <div key={order._id} style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.8fr 0.8fr 1fr 0.8fr',
              padding: '1.1rem 1.5rem', alignItems: 'center',
              borderBottom: i < orders.length - 1 ? '1px solid var(--gray-200)' : 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontWeight: 700, fontSize: '0.88rem', fontFamily: 'monospace', color: 'var(--primary)' }}>
                #{order._id.slice(-8).toUpperCase()}
              </span>
              <span style={{ fontSize: '0.88rem', color: 'var(--gray-700)' }}>
                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span style={{ fontSize: '0.88rem' }}>
                {order.orderItems?.length || 0} item{order.orderItems?.length !== 1 ? 's' : ''}
              </span>
              <span style={{ fontWeight: 700 }}>${Number(order.totalPrice).toFixed(2)}</span>
              <div><StatusBadge status={order.status || order.orderStatus || 'pending'} /></div>
              <div style={{ textAlign: 'right' }}>
                <Link to={`/orders/${order._id}`} style={{
                  background: 'var(--primary)', color: 'var(--white)',
                  padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700,
                }}>
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

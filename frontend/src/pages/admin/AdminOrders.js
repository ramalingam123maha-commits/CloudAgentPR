import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS = {
  pending:    { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  processing: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  shipped:    { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  delivered:  { bg: '#f0fdf4', color: '#166534', border: '#86efac' },
  cancelled:  { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status?.toLowerCase()] || {};
  return (
    <span style={{
      background: s.bg || 'var(--gray-100)', color: s.color || 'var(--gray-700)',
      border: `1.5px solid ${s.border || 'var(--gray-200)'}`,
      borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.65rem',
      fontSize: '0.78rem', fontWeight: 700, textTransform: 'capitalize',
    }}>
      {status}
    </span>
  );
}

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('');
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [updating, setUpdating] = useState(null);

  const PER_PAGE = 15;

  const fetchOrders = useCallback(() => {
    setLoading(true);
    api.get('/admin/orders', { params: { status: filter || undefined, page, limit: PER_PAGE } })
      .then(r => {
        setOrders(r.data.orders || r.data || []);
        setTotal(r.data.total || (r.data.orders || r.data || []).length);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [filter, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.put(`/admin/orders/${orderId}`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus, orderStatus: newStatus } : o));
    } catch {
      alert('Failed to update order status.');
    } finally {
      setUpdating(null);
    }
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, marginBottom: '0.2rem' }}>Orders Management</h1>
          <p style={{ color: 'var(--gray-500)', margin: 0, fontSize: '0.9rem' }}>{total} total orders</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['', ...ORDER_STATUSES].map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }} style={{
            padding: '0.5rem 1.1rem', borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--gray-200)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
            fontSize: '0.82rem', textTransform: 'capitalize',
            background: filter === s ? 'var(--primary)' : 'var(--white)',
            color: filter === s ? 'var(--white)' : 'var(--gray-700)',
            transition: 'all 0.15s',
          }}>
            {s === '' ? 'All Orders' : s}
          </button>
        ))}
      </div>

      {/* Orders table */}
      {loading ? <Spinner message="Loading orders…" /> : (
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.5fr 1fr 0.9fr 1fr 1.5fr', padding: '0.75rem 1.25rem', background: 'var(--gray-100)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid var(--gray-200)' }}>
            <span>Order ID</span><span>Customer</span><span>Date</span><span>Total</span><span>Status</span><span>Update Status</span>
          </div>
          {orders.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>No orders found.</div>
          ) : orders.map(order => {
            const status = (order.status || order.orderStatus || 'pending').toLowerCase();
            return (
              <div key={order._id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.5fr 1fr 0.9fr 1fr 1.5fr', padding: '0.9rem 1.25rem', alignItems: 'center', borderTop: '1px solid var(--gray-200)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Link to={`/orders/${order._id}`} style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'monospace' }}>
                  #{order._id.slice(-8).toUpperCase()}
                </Link>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {order.user?.name || order.userName || 'N/A'}
                  </p>
                  <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {order.user?.email || order.userEmail || ''}
                  </p>
                </div>
                <span style={{ fontSize: '0.82rem', color: 'var(--gray-700)' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>${Number(order.totalPrice).toFixed(2)}</span>
                <div><StatusBadge status={status} /></div>
                <select
                  value={status}
                  onChange={e => handleStatusChange(order._id, e.target.value)}
                  disabled={updating === order._id}
                  style={{
                    padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--gray-200)',
                    fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                    background: 'var(--white)', outline: 'none',
                    opacity: updating === order._id ? 0.6 : 1,
                  }}
                >
                  {ORDER_STATUSES.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{ padding: '0.5rem 0.9rem', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', background: p === page ? 'var(--primary)' : 'var(--white)', color: p === page ? 'var(--white)' : 'var(--gray-700)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

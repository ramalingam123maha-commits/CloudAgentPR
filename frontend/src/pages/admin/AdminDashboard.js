import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

const STAT_CARDS = [
  { key: 'revenue',   label: 'Total Revenue',   icon: '💰', color: '#6c63ff', bg: 'rgba(108,99,255,0.1)'  },
  { key: 'orders',    label: 'Total Orders',     icon: '📦', color: '#2ecc71', bg: 'rgba(46,204,113,0.1)'  },
  { key: 'products',  label: 'Total Products',   icon: '🏷️', color: '#f39c12', bg: 'rgba(243,156,18,0.1)'  },
  { key: 'users',     label: 'Total Users',      icon: '👥', color: '#e74c3c', bg: 'rgba(231,76,60,0.1)'   },
];

const STATUS_COLORS = {
  pending:    '#b45309',
  processing: '#1d4ed8',
  shipped:    '#15803d',
  delivered:  '#166534',
  cancelled:  '#be123c',
};

function StatCard({ label, value, icon, color, bg, loading }) {
  return (
    <div style={{
      background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--gray-200)', padding: '1.5rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, marginBottom: '0.4rem' }}>{label}</p>
        {loading
          ? <div style={{ width: '80px', height: '28px', background: 'var(--gray-200)', borderRadius: '6px', animation: 'pulse 1.5s infinite' }} />
          : <p style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, color: 'var(--gray-900)' }}>
              {label === 'Total Revenue' ? `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : (value || 0).toLocaleString()}
            </p>
        }
      </div>
      <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
        {icon}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats,         setStats]         = useState({});
  const [recentOrders,  setRecentOrders]  = useState([]);
  const [ordersByStatus,setOrdersByStatus]= useState({});
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats').catch(() => ({ data: {} })),
      api.get('/admin/orders?limit=8').catch(() => ({ data: [] })),
    ]).then(([statsRes, ordersRes]) => {
      const s = statsRes.data;
      setStats(s);
      const orders = ordersRes.data.orders || ordersRes.data || [];
      setRecentOrders(orders.slice(0, 8));

      // Aggregate status counts
      const counts = {};
      orders.forEach(o => {
        const st = (o.status || o.orderStatus || 'pending').toLowerCase();
        counts[st] = (counts[st] || 0) + 1;
      });
      setOrdersByStatus(counts);
    }).finally(() => setLoading(false));
  }, []);

  const maxCount = Math.max(1, ...Object.values(ordersByStatus));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, marginBottom: '0.25rem' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--gray-500)', margin: 0 }}>Welcome back! Here's what's happening.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { to: '/admin/products', label: '🏷️ Products' },
            { to: '/admin/orders',   label: '📦 Orders'   },
            { to: '/admin/users',    label: '👥 Users'    },
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={{
              background: 'var(--primary)', color: 'var(--white)', padding: '0.55rem 1.1rem',
              borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem',
            }}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {STAT_CARDS.map(({ key, label, icon, color, bg }) => (
          <StatCard
            key={key} label={label} icon={icon} color={color} bg={bg}
            value={stats[key]} loading={loading}
          />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'flex-start' }}>

        {/* Recent Orders */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
          <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1.5px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem' }}>Recent Orders</span>
            <Link to="/admin/orders" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>View All →</Link>
          </div>
          {loading ? <Spinner message="Loading…" /> : recentOrders.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>No orders yet.</div>
          ) : (
            <div>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr', padding: '0.65rem 1.5rem', background: 'var(--gray-100)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span>Order ID</span>
                <span>Customer</span>
                <span>Total</span>
                <span>Status</span>
              </div>
              {recentOrders.map((o, i) => {
                const st = (o.status || o.orderStatus || 'pending').toLowerCase();
                return (
                  <div key={o._id} style={{
                    display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr',
                    padding: '0.85rem 1.5rem', alignItems: 'center',
                    borderTop: '1px solid var(--gray-200)',
                  }}>
                    <Link to={`/orders/${o._id}`} style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'monospace' }}>
                      #{o._id.slice(-8).toUpperCase()}
                    </Link>
                    <span style={{ fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {o.user?.name || o.userName || 'N/A'}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>${Number(o.totalPrice || 0).toFixed(2)}</span>
                    <span style={{
                      display: 'inline-block', borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.6rem',
                      fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize',
                      background: `${STATUS_COLORS[st]}18`, color: STATUS_COLORS[st] || 'var(--gray-700)',
                    }}>
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Orders by Status - CSS Bar Chart */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)', padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '1.5rem' }}>Orders by Status</h3>
          {loading ? <Spinner message="Loading…" /> : Object.keys(ordersByStatus).length === 0 ? (
            <p style={{ color: 'var(--gray-500)', textAlign: 'center', padding: '2rem 0' }}>No data available.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {Object.entries(ordersByStatus).map(([status, count]) => (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{status}</span>
                    <span style={{ fontWeight: 700, color: STATUS_COLORS[status] || 'var(--gray-700)' }}>{count}</span>
                  </div>
                  <div style={{ background: 'var(--gray-100)', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(count / maxCount) * 100}%`, height: '100%',
                      background: STATUS_COLORS[status] || 'var(--primary)',
                      borderRadius: '99px', transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick links */}
          <div style={{ marginTop: '2rem', borderTop: '1.5px solid var(--gray-200)', paddingTop: '1.25rem' }}>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Actions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { to: '/admin/products', icon: '➕', label: 'Add New Product'  },
                { to: '/admin/orders',   icon: '📋', label: 'Manage Orders'    },
                { to: '/admin/users',    icon: '👤', label: 'Manage Users'     },
              ].map(({ to, icon, label }) => (
                <Link key={to} to={to} style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)',
                  background: 'var(--gray-100)', textDecoration: 'none', color: 'var(--gray-700)',
                  fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'var(--white)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--gray-100)'; e.currentTarget.style.color = 'var(--gray-700)'; }}
                >
                  <span>{icon}</span> {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }`}</style>
    </div>
  );
}

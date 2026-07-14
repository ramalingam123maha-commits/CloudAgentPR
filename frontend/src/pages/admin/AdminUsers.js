import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

function RoleBadge({ role }) {
  const isAdmin = role === 'admin';
  return (
    <span style={{
      background: isAdmin ? 'rgba(108,99,255,0.12)' : 'rgba(46,204,113,0.12)',
      color: isAdmin ? 'var(--primary)' : 'var(--success)',
      border: `1.5px solid ${isAdmin ? 'rgba(108,99,255,0.3)' : 'rgba(46,204,113,0.3)'}`,
      borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.7rem',
      fontSize: '0.78rem', fontWeight: 700, textTransform: 'capitalize',
    }}>
      {isAdmin ? '👑 Admin' : '👤 User'}
    </span>
  );
}

export default function AdminUsers() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [updating, setUpdating] = useState(null);
  const [confirmRole, setConfirmRole] = useState(null); // { userId, name, newRole }

  const PER_PAGE = 15;

  const fetchUsers = useCallback(() => {
    setLoading(true);
    api.get('/admin/users', { params: { page, limit: PER_PAGE } })
      .then(r => {
        setUsers(r.data.users || r.data || []);
        setTotal(r.data.total || (r.data.users || r.data || []).length);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async () => {
    if (!confirmRole) return;
    const { userId, newRole } = confirmRole;
    setUpdating(userId);
    setConfirmRole(null);
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch {
      alert('Failed to update user role.');
    } finally {
      setUpdating(null);
    }
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  const avatarColor = (name) => {
    const colors = ['#6c63ff','#ff6584','#2ecc71','#f39c12','#e74c3c','#3498db','#9b59b6','#1abc9c'];
    let hash = 0;
    for (let i = 0; i < (name||'').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, marginBottom: '0.2rem' }}>Users Management</h1>
        <p style={{ color: 'var(--gray-500)', margin: 0, fontSize: '0.9rem' }}>{total} total users</p>
      </div>

      {loading ? <Spinner message="Loading users…" /> : (
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1.2fr', padding: '0.75rem 1.25rem', background: 'var(--gray-100)', fontWeight: 700, fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid var(--gray-200)' }}>
            <span>User</span>
            <span>Email</span>
            <span>Role</span>
            <span>Joined</span>
            <span>Actions</span>
          </div>

          {users.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>No users found.</div>
          ) : users.map(user => {
            const isAdmin = user.role === 'admin';
            const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const bg = avatarColor(user.name);
            return (
              <div key={user._id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1.2fr', padding: '0.9rem 1.25rem', alignItems: 'center', borderTop: '1px solid var(--gray-200)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* User with avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gray-200)' }} />
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: bg, color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.78rem', flexShrink: 0 }}>
                      {initials}
                    </div>
                  )}
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                </div>

                <span style={{ fontSize: '0.85rem', color: 'var(--gray-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>

                <div><RoleBadge role={user.role} /></div>

                <span style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </span>

                <button
                  onClick={() => setConfirmRole({ userId: user._id, name: user.name, newRole: isAdmin ? 'user' : 'admin' })}
                  disabled={updating === user._id}
                  style={{
                    background: isAdmin ? 'rgba(231,76,60,0.1)' : 'rgba(108,99,255,0.1)',
                    color: isAdmin ? 'var(--danger)' : 'var(--primary)',
                    border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.85rem',
                    fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem',
                    opacity: updating === user._id ? 0.6 : 1,
                  }}
                >
                  {updating === user._id ? '…' : isAdmin ? '⬇️ Make User' : '⬆️ Make Admin'}
                </button>
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

      {/* Role change confirmation modal */}
      {confirmRole && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', padding: '2rem', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{confirmRole.newRole === 'admin' ? '👑' : '👤'}</div>
            <h3 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Change Role</h3>
            <p style={{ color: 'var(--gray-700)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Are you sure you want to make <strong>{confirmRole.name}</strong>{' '}
              {confirmRole.newRole === 'admin' ? 'an admin? They will have full access to the admin panel.' : 'a regular user? They will lose admin access.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setConfirmRole(null)} style={{ background: 'var(--gray-100)', color: 'var(--gray-700)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.7rem 1.5rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={handleRoleChange} style={{ background: confirmRole.newRole === 'admin' ? 'var(--primary)' : 'var(--warning)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.7rem 1.5rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

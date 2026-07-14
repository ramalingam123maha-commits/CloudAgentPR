import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--gray-200)', fontSize: '0.95rem', fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
};
const labelStyle = {
  display: 'block', fontSize: '0.88rem', fontWeight: 600,
  color: 'var(--gray-700)', marginBottom: '0.4rem',
};
const sectionCard = {
  background: 'var(--white)', borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-sm)', padding: '2rem',
  border: '1px solid var(--gray-200)',
};

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [profileForm, setProfileForm]   = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileMsg, setProfileMsg]     = useState(null);
  const [passwordMsg, setPasswordMsg]   = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  /* ---- Profile update ---- */
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      await updateProfile({ name: profileForm.name, avatar: profileForm.avatar });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setProfileLoading(false);
    }
  };

  /* ---- Password change ---- */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' }); return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' }); return;
    }
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      await updateProfile({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Password change failed.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const msgBox = (msg) => msg && (
    <div style={{
      borderRadius: 'var(--radius-sm)', padding: '0.7rem 1rem',
      marginBottom: '1rem',
      background: msg.type === 'success' ? '#f0fff4' : '#fff5f5',
      border: `1.5px solid ${msg.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
      color: msg.type === 'success' ? 'var(--success)' : 'var(--danger)',
      fontSize: '0.88rem', fontWeight: 600,
    }}>
      {msg.type === 'success' ? '✓ ' : '⚠️ '}{msg.text}
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>My Profile</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>Manage your account information</p>

      {/* Avatar preview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', flexShrink: 0, overflow: 'hidden',
          border: '3px solid var(--gray-200)',
        }}>
          {profileForm.avatar
            ? <img src={profileForm.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span>👤</span>
          }
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{user?.name}</h2>
          <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: '0.9rem' }}>{user?.email}</p>
          <span style={{
            display: 'inline-block', marginTop: '0.25rem',
            background: user?.role === 'admin' ? 'var(--danger)' : 'var(--primary)',
            color: 'var(--white)', borderRadius: 'var(--radius-sm)',
            padding: '0.15rem 0.55rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          }}>
            {user?.role || 'user'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Update Profile */}
        <div style={sectionCard}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--gray-900)' }}>
            ✏️ Update Profile
          </h3>
          {msgBox(profileMsg)}
          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text" value={profileForm.name}
                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="Your name" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
              />
            </div>
            <div>
              <label style={labelStyle}>Avatar URL</label>
              <input
                type="url" value={profileForm.avatar}
                onChange={e => setProfileForm({ ...profileForm, avatar: e.target.value })}
                placeholder="https://..." style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
              />
            </div>
            <button
              type="submit" disabled={profileLoading}
              style={{
                background: 'var(--primary)', color: 'var(--white)', border: 'none',
                borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontWeight: 700,
                fontSize: '0.95rem', cursor: profileLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', transition: 'background 0.2s',
                opacity: profileLoading ? 0.7 : 1,
              }}
            >
              {profileLoading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div style={sectionCard}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--gray-900)' }}>
            🔒 Change Password
          </h3>
          {msgBox(passwordMsg)}
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { key: 'currentPassword', label: 'Current Password' },
              { key: 'newPassword',     label: 'New Password' },
              { key: 'confirmPassword', label: 'Confirm New Password' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input
                  type="password" value={passwordForm[key]}
                  onChange={e => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                  placeholder="••••••••" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                />
              </div>
            ))}
            <button
              type="submit" disabled={passwordLoading}
              style={{
                background: 'var(--warning)', color: 'var(--white)', border: 'none',
                borderRadius: 'var(--radius-sm)', padding: '0.75rem', fontWeight: 700,
                fontSize: '0.95rem', cursor: passwordLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', transition: 'background 0.2s',
                opacity: passwordLoading ? 0.7 : 1,
              }}
            >
              {passwordLoading ? 'Updating…' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Account Info */}
      <div style={{ ...sectionCard, marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--gray-900)' }}>
          📋 Account Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Email',      value: user?.email },
            { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' },
            { label: 'Account ID', value: user?._id ? `...${user._id.slice(-8)}` : 'N/A' },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.3rem' }}>{label}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gray-900)' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

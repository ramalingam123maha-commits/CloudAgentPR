import React from 'react';

/**
 * Spinner — centered loading indicator.
 * Props:
 *   size    : number (px, default 44)
 *   message : string (optional)
 *   fullPage: boolean (default false) — fills entire viewport
 */
export default function Spinner({ size = 44, message, fullPage = false }) {
  const containerStyle = fullPage
    ? {
        position: 'fixed', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.85)',
        zIndex: 9999,
        gap: '1rem',
      }
    : {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '4rem 0',
        gap: '1rem',
      };

  return (
    <div style={containerStyle} role="status" aria-label="Loading">
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: `${Math.max(3, size / 11)}px solid var(--gray-200)`,
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
        }}
      />
      {message && (
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', margin: 0 }}>{message}</p>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

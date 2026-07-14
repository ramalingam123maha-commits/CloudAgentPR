import React from 'react';

/**
 * StarRating — renders filled / half / empty stars.
 * Props:
 *   rating     : number  (0–5, supports decimals)
 *   numReviews : number  (optional)
 *   size       : 'sm' | 'md' | 'lg'
 */
export default function StarRating({ rating = 0, numReviews, size = 'md' }) {
  const clamped = Math.min(5, Math.max(0, Number(rating)));
  const fullStars = Math.floor(clamped);
  const hasHalf   = clamped - fullStars >= 0.4;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  const sizes = { sm: '0.85rem', md: '1rem', lg: '1.25rem' };
  const fontSize = sizes[size] || sizes.md;
  const gap      = size === 'sm' ? '1px' : '2px';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <div style={{ display: 'flex', gap }}>
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={`f-${i}`} style={{ fontSize, color: '#f39c12', lineHeight: 1 }}>★</span>
        ))}
        {hasHalf && (
          <span style={{ fontSize, color: '#f39c12', lineHeight: 1 }}>⯨</span>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={`e-${i}`} style={{ fontSize, color: '#dee2e6', lineHeight: 1 }}>★</span>
        ))}
      </div>
      {numReviews !== undefined && (
        <span style={{
          fontSize: size === 'sm' ? '0.75rem' : '0.82rem',
          color: 'var(--gray-500)',
          fontWeight: 500,
        }}>
          ({numReviews})
        </span>
      )}
    </div>
  );
}

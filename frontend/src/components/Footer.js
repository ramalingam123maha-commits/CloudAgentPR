import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  const linkStyle = {
    color: 'rgba(255,255,255,0.65)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    lineHeight: '2',
    display: 'block',
    transition: 'color 0.2s ease',
  };

  return (
    <footer style={{ background: 'var(--dark)', color: 'rgba(255,255,255,0.85)', paddingTop: '3.5rem' }}>
      <style>{`
        .footer-link:hover { color: #fff !important; }
        .footer-social:hover { background: var(--primary) !important; }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2.5rem',
          paddingBottom: '3rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🛍️</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--white)' }}>ShopNow</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              Your one-stop destination for amazing products at unbeatable prices. Shop smarter, live better.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {['𝕏', 'f', 'in', '📸'].map((icon, i) => (
                <button
                  key={i}
                  className="footer-social"
                  style={{
                    width: '36px', height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'var(--white)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    transition: 'background 0.2s ease',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'var(--white)', marginBottom: '1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Quick Links
            </h4>
            <nav>
              {[
                { label: 'Home',     to: '/' },
                { label: 'Products', to: '/products' },
                { label: 'My Cart',  to: '/cart' },
                { label: 'My Orders', to: '/orders' },
                { label: 'Profile',  to: '/profile' },
              ].map(({ label, to }) => (
                <Link key={to} to={to} style={linkStyle} className="footer-link">{label}</Link>
              ))}
            </nav>
          </div>

          {/* Customer Service */}
          <div>
            <h4 style={{ color: 'var(--white)', marginBottom: '1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Customer Service
            </h4>
            <nav>
              {[
                'Help Center',
                'Return Policy',
                'Shipping Info',
                'Track Your Order',
                'Privacy Policy',
                'Terms of Service',
              ].map((item) => (
                <a key={item} href="#/" style={linkStyle} className="footer-link">{item}</a>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'var(--white)', marginBottom: '1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Contact Us
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { icon: '📍', text: '123 Commerce St, NY 10001' },
                { icon: '📞', text: '+1 (800) 555-0100' },
                { icon: '✉️', text: 'support@shopnow.com' },
                { icon: '🕐', text: 'Mon–Fri, 9am – 6pm EST' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.95rem', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem', lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1.25rem 0',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', margin: 0 }}>
            © {year} ShopNow. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {['💳 Visa', '💳 Mastercard', '📦 PayPal', '🔒 Secure'].map((label) => (
              <span key={label} style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.25rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

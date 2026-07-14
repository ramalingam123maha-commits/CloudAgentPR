import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const styles = {
  navbar: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    height: 'var(--navbar-height)',
    background: 'var(--white)',
    borderBottom: '1px solid var(--gray-200)',
    zIndex: 900,
    transition: 'box-shadow 0.2s ease',
  },
  navbarScrolled: {
    boxShadow: 'var(--shadow-md)',
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.3rem',
    fontWeight: 800,
    color: 'var(--primary)',
    textDecoration: 'none',
    flexShrink: 0,
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    flex: 1,
  },
  navLink: {
    padding: '0.45rem 0.85rem',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    fontSize: '0.92rem',
    color: 'var(--gray-700)',
    textDecoration: 'none',
    transition: 'all var(--transition)',
  },
  navLinkActive: {
    color: 'var(--primary)',
    background: 'var(--primary-light)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexShrink: 0,
  },
  cartBtn: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.85rem',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    fontSize: '0.92rem',
    color: 'var(--gray-700)',
    textDecoration: 'none',
    transition: 'all var(--transition)',
  },
  cartBadge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    background: 'var(--secondary)',
    color: 'var(--white)',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '0.65rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileDropdown: {
    position: 'relative',
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.45rem 0.85rem',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    fontSize: '0.92rem',
    color: 'var(--gray-700)',
    background: 'var(--gray-100)',
    border: '1.5px solid var(--gray-200)',
    cursor: 'pointer',
    transition: 'all var(--transition)',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    background: 'var(--white)',
    border: '1px solid var(--gray-200)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    minWidth: '180px',
    overflow: 'hidden',
    animation: 'fadeDown 0.15s ease',
    zIndex: 100,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    color: 'var(--gray-700)',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'background var(--transition)',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'var(--font-sans)',
  },
  hamburger: {
    display: 'none',
    flexDirection: 'column',
    gap: '5px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  hamburgerLine: {
    width: '24px',
    height: '2px',
    background: 'var(--gray-700)',
    borderRadius: '2px',
    transition: 'all 0.2s ease',
  },
  mobileMenu: {
    position: 'absolute',
    top: 'var(--navbar-height)',
    left: 0,
    right: 0,
    background: 'var(--white)',
    borderBottom: '1px solid var(--gray-200)',
    boxShadow: 'var(--shadow-md)',
    padding: '1rem 1.5rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    zIndex: 899,
  },
  mobileLink: {
    padding: '0.7rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 600,
    fontSize: '0.95rem',
    color: 'var(--gray-700)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all var(--transition)',
  },
};

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const linkStyle = (isActiveParam) => ({
    ...styles.navLink,
    ...(isActiveParam ? styles.navLinkActive : {}),
  });

  return (
    <>
      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-link-hover:hover { background: var(--gray-100); color: var(--gray-900) !important; }
        .dropdown-item-hover:hover { background: var(--gray-100); }
        .cart-btn-hover:hover { background: var(--primary-light); color: var(--primary) !important; }
        .profile-btn-hover:hover { background: var(--gray-200); }
        .hamburger-btn { display: none; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .desktop-actions { display: none !important; }
        }
      `}</style>

      <nav style={{ ...styles.navbar, ...(scrolled ? styles.navbarScrolled : {}) }}>
        <div style={styles.inner}>
          {/* Logo */}
          <Link to="/" style={styles.logo}>
            🛍️ ShopNow
          </Link>

          {/* Desktop Nav Links */}
          <div className="desktop-nav" style={styles.navLinks}>
            <NavLink to="/" end style={({ isActive }) => linkStyle(isActive)} className="nav-link-hover">
              Home
            </NavLink>
            <NavLink to="/products" style={({ isActive }) => linkStyle(isActive)} className="nav-link-hover">
              Products
            </NavLink>
          </div>

          {/* Desktop Actions */}
          <div className="desktop-actions" style={styles.actions}>
            {isAuthenticated ? (
              <>
                <Link to="/cart" style={styles.cartBtn} className="cart-btn-hover">
                  🛒 Cart
                  {cartCount > 0 && (
                    <span style={styles.cartBadge}>{cartCount > 99 ? '99+' : cartCount}</span>
                  )}
                </Link>
                <Link to="/orders" style={styles.navLink} className="nav-link-hover">
                  📦 Orders
                </Link>
                <div style={styles.profileDropdown} ref={dropdownRef}>
                  <button
                    style={styles.profileBtn}
                    className="profile-btn-hover"
                    onClick={() => setDropdownOpen((v) => !v)}
                  >
                    👤 {user?.name?.split(' ')[0] || 'Account'} ▾
                  </button>
                  {dropdownOpen && (
                    <div style={styles.dropdown}>
                      <Link
                        to="/profile"
                        style={styles.dropdownItem}
                        className="dropdown-item-hover"
                        onClick={() => setDropdownOpen(false)}
                      >
                        ⚙️ Profile
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          style={styles.dropdownItem}
                          className="dropdown-item-hover"
                          onClick={() => setDropdownOpen(false)}
                        >
                          🔧 Admin Dashboard
                        </Link>
                      )}
                      <div style={{ height: '1px', background: 'var(--gray-200)', margin: '0.25rem 0' }} />
                      <button style={{ ...styles.dropdownItem, color: 'var(--danger)' }} className="dropdown-item-hover" onClick={handleLogout}>
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="hamburger-btn"
            style={styles.hamburger}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span style={styles.hamburgerLine} />
            <span style={styles.hamburgerLine} />
            <span style={styles.hamburgerLine} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>🏠 Home</Link>
          <Link to="/products" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>🛍️ Products</Link>
          {isAuthenticated ? (
            <>
              <Link to="/cart" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                🛒 Cart {cartCount > 0 && <span style={{ ...styles.cartBadge, position: 'static', marginLeft: 'auto' }}>{cartCount}</span>}
              </Link>
              <Link to="/orders" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>📦 Orders</Link>
              <Link to="/profile" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>⚙️ Profile</Link>
              {isAdmin && (
                <Link to="/admin" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>🔧 Admin Dashboard</Link>
              )}
              <button style={{ ...styles.mobileLink, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }} onClick={handleLogout}>
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" style={{ ...styles.mobileLink, color: 'var(--primary)' }} onClick={() => setMobileOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </>
  );
}

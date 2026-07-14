import React from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>📚</span>
          <span className={styles.logoText}>LibraryMS</span>
        </div>

        <div className={styles.right}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user?.name}</span>
              <span className={`${styles.role} ${user?.role === 'admin' ? styles.admin : styles.userRole}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={logout}>
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, LayoutGrid, Home, Menu, X, Trophy } from 'lucide-react';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/arcade', label: 'Juegos', icon: LayoutGrid },
  { to: '/scores', label: 'Scores', icon: Trophy },
];

export function Navbar() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Gamepad2 size={20} />
            </div>
            <span className={styles.logoText}>
              <span className="gradient-text">AndVar</span>
              <span className={styles.logoSub}>Arcade</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className={styles.desktopNav}>
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`${styles.navLink} ${pathname === to ? styles.active : ''}`}
              >
                <Icon size={15} />
                {label}
                {pathname === to && (
                  <motion.span
                    className={styles.activeIndicator}
                    layoutId="navbar-active"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            className={styles.menuToggle}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menú"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`${styles.mobileLink} ${pathname === to ? styles.mobileActive : ''}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import CartDrawer from '../Cart/CartDrawer'
import styles from './Navbar.module.css'

const LOGO_URL = 'https://fedznkkxobzgzsbybozb.supabase.co/storage/v1/object/public/product-images/Porokhane%20SHOP.png'

export default function Navbar() {
  const { totalItems } = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = path => location.pathname === path

  return (
    <>
      {/* ─── NAVBAR DESKTOP ─── */}
      <nav className={styles.navbar}>
        <Link to="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
          <img
            src={LOGO_URL}
            alt="Porokhane Shop"
            className={styles.logoImg}
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
          />
          <div className={styles.logoIconFallback}>🛍️</div>
          <div>
            <div className={styles.logoName}>Porokhane</div>
            <div className={styles.logoSub}>Shop ✨</div>
          </div>
        </Link>

        {/* LIENS DESKTOP */}
        <div className={`${styles.navLinks} ${menuOpen ? styles.open : ''}`}>
          <Link to="/" className={styles.navLink} onClick={() => setMenuOpen(false)}>Accueil</Link>
          <Link to="/produits?cat=Pashmina" className={styles.navLink} onClick={() => setMenuOpen(false)}>Pashmina</Link>
          <Link to="/produits?cat=Jersey" className={styles.navLink} onClick={() => setMenuOpen(false)}>Jersey</Link>
          <Link to="/produits?cat=Cashmere" className={styles.navLink} onClick={() => setMenuOpen(false)}>Cashmere</Link>
          <Link to="/produits?cat=Accessoires" className={styles.navLink} onClick={() => setMenuOpen(false)}>Accessoires</Link>

          {/* FERMER MENU MOBILE */}
          <button className={styles.closeMenu} onClick={() => setMenuOpen(false)}>✕ Fermer</button>
        </div>

        {/* OVERLAY MENU MOBILE */}
        {menuOpen && <div className={styles.menuOverlay} onClick={() => setMenuOpen(false)} />}

        <div className={styles.navActions}>
          <a href="https://wa.me/221785363425" target="_blank" rel="noopener noreferrer"
             className={styles.waBtn} title="WhatsApp">💬</a>
          <button className={styles.cartBtn} onClick={() => setCartOpen(true)} aria-label="Panier">
            🛒
            {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
          </button>
          <button className={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* ─── NAVIGATION BAS MOBILE ─── */}
      <nav className="mobile-bottom-nav">
        <Link to="/" className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`}>
          <span className="mobile-nav-icon">🏠</span>
          <span>Accueil</span>
        </Link>
        <Link to="/produits" className={`mobile-nav-item ${isActive('/produits') ? 'active' : ''}`}>
          <span className="mobile-nav-icon">🧕</span>
          <span>Collection</span>
        </Link>
        <button className="mobile-nav-item" onClick={() => setCartOpen(true)}>
          <span className="mobile-nav-icon" style={{ position: 'relative' }}>
            🛒
            {totalItems > 0 && <span className="mobile-nav-badge">{totalItems}</span>}
          </span>
          <span>Panier</span>
        </button>
        <a href="https://wa.me/221785363425" target="_blank" rel="noopener noreferrer"
           className="mobile-nav-item">
          <span className="mobile-nav-icon">💬</span>
          <span>WhatsApp</span>
        </a>
        <Link to="/admin" className={`mobile-nav-item ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>
          <span className="mobile-nav-icon">⚙️</span>
          <span>Admin</span>
        </Link>
      </nav>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
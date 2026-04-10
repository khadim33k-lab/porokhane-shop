import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import CartDrawer from '../Cart/CartDrawer'
import styles from './Navbar.module.css'

const LOGO_URL = 'https://fedznkkxobzgzsbybozb.supabase.co/storage/v1/object/public/product-images/Porokhane%20SHOP.png'

function Navbar() {
  const { totalItems } = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <nav className={styles.navbar}>
        {/* LOGO */}
        <Link to="/" className={styles.logo}>
          <img
            src={LOGO_URL}
            alt="Porokhane Shop"
            className={styles.logoImg}
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
          />
          <div className={styles.logoIconFallback}>🛍️</div>
          <div>
            <div className={styles.logoName}>Porokhane</div>
            <div className={styles.logoSub}>Shop ✨</div>
          </div>
        </Link>

        {/* LIENS */}
        <div className={`${styles.navLinks} ${menuOpen ? styles.open : ''}`}>
          <Link to="/" className={styles.navLink} onClick={() => setMenuOpen(false)}>Accueil</Link>
          <Link to="/produits?cat=Pashmina" className={styles.navLink} onClick={() => setMenuOpen(false)}>Pashmina</Link>
          <Link to="/produits?cat=Jersey" className={styles.navLink} onClick={() => setMenuOpen(false)}>Jersey</Link>
          <Link to="/produits?cat=Cashmere" className={styles.navLink} onClick={() => setMenuOpen(false)}>Cashmere</Link>
          <Link to="/produits?cat=Accessoires" className={styles.navLink} onClick={() => setMenuOpen(false)}>Accessoires</Link>
        </div>

        {/* ACTIONS */}
        <div className={styles.navActions}>
          <a
            href="https://wa.me/221785363425"
            target="_blank" rel="noopener noreferrer"
            className={styles.waBtn}
            title="Commander sur WhatsApp"
          >💬</a>
          <button
            className={styles.cartBtn}
            onClick={() => setCartOpen(true)}
            aria-label="Panier"
          >
            🛒
            {totalItems > 0 && (
              <span className={styles.cartBadge}>{totalItems}</span>
            )}
          </button>
          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

export default Navbar
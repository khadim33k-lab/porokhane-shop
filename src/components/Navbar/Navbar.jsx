import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { SHOP_CONFIG, whatsappLink } from '../../lib/shopConfig'
import WhatsAppIcon from '../icons/WhatsAppIcon'
import { BagIcon as StoreBagIcon, GridIcon, HomeIcon } from '../icons/StoreIcons'
import CartDrawer from '../Cart/CartDrawer'
import styles from './Navbar.module.css'

const SearchIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
  </svg>
)

const BagIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" />
  </svg>
)

const MenuIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export default function Navbar() {
  const { totalItems } = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  const isActive = path => location.pathname === path ||
    (path === '/produits' && location.pathname.startsWith('/produits'))

  return (
    <>
      <div className={styles.announcement}>
        <span>Livraison à Dakar et environs</span>
        <span>{SHOP_CONFIG.slogan}</span>
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon size={15} /> {SHOP_CONFIG.phone}
        </a>
      </div>

      <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <nav className={styles.desktopNav} aria-label="Navigation principale">
          <Link to="/produits">Nouveautés</Link>
          <Link to="/produits?cat=Mode%20%26%20Voiles">Mode & Voiles</Link>
          <Link to="/produits?cat=Accessoires">Accessoires</Link>
        </nav>

        <Link to="/" className={styles.logo} aria-label="Porokhane Shop, accueil">
          <img src={SHOP_CONFIG.logo} alt="Logo Porokhane Shop" />
          <span>Porokhane Shop</span>
        </Link>

        <div className={styles.actions}>
          <Link to="/produits" className={styles.iconButton} aria-label="Rechercher un produit">
            <SearchIcon />
          </Link>
          <a
            href={whatsappLink('Bonjour Porokhane Shop, je souhaite avoir des informations sur vos produits.')}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.iconButton} ${styles.whatsappButton}`}
            aria-label="Contacter Porokhane Shop sur WhatsApp"
          >
            <WhatsAppIcon size={21} />
          </a>
          <button type="button" className={styles.iconButton} onClick={() => setCartOpen(true)} aria-label="Ouvrir le panier">
            <BagIcon />
            {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
          </button>
          <button type="button" className={`${styles.iconButton} ${styles.menuButton}`} onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu">
            <MenuIcon />
          </button>
        </div>
      </header>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`} aria-hidden={!menuOpen}>
        <div className={styles.mobileMenuHead}>
          <span>Menu</span>
          <button type="button" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu">Fermer ×</button>
        </div>
        <Link to="/">Accueil</Link>
        <Link to="/produits">Nouveautés</Link>
        <Link to="/produits?cat=Mode%20%26%20Voiles">Mode & Voiles</Link>
        <Link to="/produits?cat=Accessoires">Accessoires</Link>
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={styles.mobileWhatsapp}>
          <WhatsAppIcon size={21} /> WhatsApp
        </a>
      </div>
      {menuOpen && <button type="button" className={styles.overlay} aria-label="Fermer le menu" onClick={() => setMenuOpen(false)} />}

      <nav className="mobile-bottom-nav" aria-label="Navigation mobile">
        <Link to="/" className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`}><HomeIcon size={19} /><span>Accueil</span></Link>
        <Link to="/produits" className={`mobile-nav-item ${isActive('/produits') ? 'active' : ''}`}><GridIcon size={19} /><span>Boutique</span></Link>
        <button type="button" className="mobile-nav-item" onClick={() => setCartOpen(true)}>
          <span className="mobile-nav-icon"><StoreBagIcon size={19} />{totalItems > 0 && <span className="mobile-nav-badge">{totalItems}</span>}</span>
          <span>Panier</span>
        </button>
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="mobile-nav-item whatsapp-mobile-link">
          <WhatsAppIcon size={20} /><span>WhatsApp</span>
        </a>
      </nav>

      <a
        href={whatsappLink('Bonjour Porokhane Shop, je souhaite avoir des informations sur vos produits.')}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.floatingWhatsapp}
        aria-label="Contacter Porokhane Shop sur WhatsApp"
      >
        <WhatsAppIcon size={27} />
        <span>Besoin d’aide ?</span>
      </a>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

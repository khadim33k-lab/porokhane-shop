import React from 'react'
import { Link } from 'react-router-dom'
import { SHOP_CONFIG, whatsappLink } from '../lib/shopConfig'
import WhatsAppIcon from './icons/WhatsAppIcon'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.main}>
        <div className={styles.brand}>
          <Link to="/" className={styles.brandLockup}>
            <img src={SHOP_CONFIG.logo} alt="Logo Porokhane Shop" />
            <span>Porokhane Shop</span>
          </Link>
          <p>{SHOP_CONFIG.slogan}</p>
          <small>{SHOP_CONFIG.address}<br />{SHOP_CONFIG.phone}</small>
        </div>

        <div>
          <h2>La boutique</h2>
          <Link to="/produits">Nouveautés</Link>
          <Link to="/produits?cat=Mode%20%26%20Voiles">Mode & Voiles</Link>
          <Link to="/produits?cat=Accessoires">Accessoires</Link>
        </div>

        <div>
          <h2>Informations</h2>
          <span>Livraison à Dakar et environs</span>
          <span>Paiement à la livraison</span>
          <Link to="/login">Espace administrateur</Link>
        </div>

        <div>
          <h2>Nous contacter</h2>
          <a
            href={whatsappLink('Bonjour Porokhane Shop, je souhaite avoir des informations sur vos produits.')}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsapp}
          >
            <WhatsAppIcon size={21} /> WhatsApp
          </a>
          <span>{SHOP_CONFIG.phone}</span>
          <span>Guédiawaye, Hamo 4, Dakar</span>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>© 2026 Porokhane Shop · Tous droits réservés</span>
        <span>{SHOP_CONFIG.slogan}</span>
      </div>
    </footer>
  )
}

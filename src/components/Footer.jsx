import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>🛍️</div>
            <div>
              <div className={styles.brandName}>Porokhane Shop</div>
              <div className={styles.brandSlogan}>"Élégance, Pudeur et Classe en parfait symbiose !"</div>
            </div>
          </div>
          <p className={styles.brandInfo}>
            📍 Guediawaye, Hamo4 · Dakar, Sénégal<br />
            📞 78 536 34 25<br />
            🐦 @porokhaneshop
          </p>
        </div>

        <div>
          <h4 className={styles.colTitle}>Collections</h4>
          <Link to="/produits?cat=Pashmina" className={styles.link}>Voiles Pashmina</Link>
          <Link to="/produits?cat=Cashmere" className={styles.link}>Voiles Cashmere</Link>
          <Link to="/produits?cat=Jersey" className={styles.link}>Voiles Jersey</Link>
          <Link to="/produits?cat=Crêpe & Soie" className={styles.link}>Crêpe & Soie</Link>
          <Link to="/produits?cat=Accessoires" className={styles.link}>Accessoires</Link>
        </div>

        <div>
          <h4 className={styles.colTitle}>Informations</h4>
          <span className={styles.link}>Livraison & retrait</span>
          <span className={styles.link}>Comment commander</span>
          <span className={styles.link}>Paiement Wave / OM</span>
          <span className={styles.link}>Retours & échanges</span>
          <Link to="/login" className={styles.link}>Espace Admin</Link>
        </div>

        <div>
          <h4 className={styles.colTitle}>Nous contacter</h4>
          <a
            href="https://wa.me/221785363425"
            target="_blank" rel="noopener noreferrer"
            className={`${styles.link} ${styles.waLink}`}
          >
            💬 WhatsApp
          </a>
          <a
            href="https://twitter.com/porokhaneshop"
            target="_blank" rel="noopener noreferrer"
            className={styles.link}
          >
            🐦 X (Twitter)
          </a>
          <span className={styles.link}>📞 78 536 34 25</span>
          <div className={styles.paymentMethods}>
            <span>💙 Wave</span>
            <span>🟠 Orange Money</span>
            <span>💵 Espèces</span>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>© 2026 Porokhane Shop ✨ · Tous droits réservés</span>
        <span>Fait avec ❤️ au Sénégal 🇸🇳</span>
      </div>
    </footer>
  )
}

export default Footer

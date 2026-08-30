import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { productMatchesUniverse, SHOP_UNIVERSES } from '../lib/catalog'
import { SHOP_CONFIG, whatsappLink } from '../lib/shopConfig'
import Navbar from '../components/Navbar/Navbar'
import ProductCard from '../components/Product/ProductCard'
import WhatsAppIcon from '../components/icons/WhatsAppIcon'
import Footer from '../components/Footer'
import styles from './Home.module.css'

export default function Home() {
  const [activeUniverse, setActiveUniverse] = useState('Tous')
  const { products, loading } = useProducts()

  const selectedProducts = products
    .filter(product => productMatchesUniverse(product, activeUniverse))
    .slice(0, 8)

  return (
    <>
      <Navbar />

      <main>
        <section className={styles.hero}>
          <span className={styles.heroEdition}>Porokhane · Dakar</span>
          <div className={styles.heroContent}>
            <img src={SHOP_CONFIG.logo} alt="Logo Porokhane Shop" className={styles.heroLogo} />
            <h1>Porokhane Shop</h1>
            <p className={styles.heroSlogan}>{SHOP_CONFIG.slogan}</p>
            <div className={styles.heroTags} aria-label="Univers de la boutique">
              <span>Mode & Voiles</span>
              <span>Accessoires</span>
            </div>
            <div className={styles.heroActions}>
              <Link to="/produits" className={styles.primaryAction}>Explorer la boutique</Link>
              <a
                href={whatsappLink('Bonjour Porokhane Shop, je souhaite découvrir vos produits.')}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappAction}
              >
                <WhatsAppIcon size={21} /> WhatsApp
              </a>
            </div>
          </div>
          <span className={styles.heroSideText}>Élégance · Pudeur · Classe</span>
        </section>

        <section className={styles.universes} aria-label="Catégories principales">
          <Link to="/produits?cat=Mode%20%26%20Voiles" className={styles.universeCard}>
            <div className={styles.universeNumber}>01</div>
            <div>
              <p>Notre sélection textile</p>
              <h2>Mode & Voiles</h2>
              <span>Découvrir la collection →</span>
            </div>
            <div className={styles.fabricVisual} aria-hidden="true"><i /><i /><i /></div>
          </Link>

          <Link to="/produits?cat=Accessoires" className={`${styles.universeCard} ${styles.accessoryCard}`}>
            <div className={styles.universeNumber}>02</div>
            <div>
              <p>Technologie & quotidien</p>
              <h2>Accessoires</h2>
              <span>Zikr Ring, chapelets électroniques et plus →</span>
            </div>
            <div className={styles.accessoryVisual} aria-hidden="true">
              <div className={styles.ringVisual}><i /></div>
              <div className={styles.beadsVisual}>{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</div>
            </div>
          </Link>
        </section>

        <section className={styles.selection}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.kicker}>Sélection du moment</p>
              <h2>Découvrez la boutique</h2>
            </div>
            <div className={styles.filters} aria-label="Filtrer les produits">
              {SHOP_UNIVERSES.map(universe => (
                <button
                  type="button"
                  key={universe}
                  className={activeUniverse === universe ? styles.activeFilter : ''}
                  onClick={() => setActiveUniverse(universe)}
                >
                  {universe === 'Tous' ? 'Tout voir' : universe}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : selectedProducts.length > 0 ? (
            <div className={styles.productGrid}>
              {selectedProducts.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <p className={styles.empty}>Les nouveaux articles seront bientôt disponibles.</p>
          )}

          <div className={styles.allProducts}>
            <Link to="/produits">Voir tous les produits</Link>
          </div>
        </section>

        <section className={styles.campaign}>
          <div className={styles.campaignImage} role="img" aria-label="Univers élégant Porokhane Shop" />
          <div className={styles.campaignContent}>
            <p className={styles.kicker}>L’univers Porokhane</p>
            <h2>Une boutique,<br />plusieurs envies.</h2>
            <p>
              Mode, voiles et accessoires — dont Zikr Ring iQibla et chapelets électroniques —
              réunis dans une sélection utile, élégante et pensée pour votre quotidien.
            </p>
            <Link to="/produits">Découvrir notre sélection →</Link>
          </div>
        </section>

        <section className={styles.trust} aria-label="Nos engagements">
          <div><strong>Sélection contrôlée</strong><span>Des articles choisis avec soin</span></div>
          <div><strong>Livraison rapide</strong><span>Dakar et environs</span></div>
          <div><strong>Conseil personnalisé</strong><span>Une réponse directe sur WhatsApp</span></div>
        </section>
      </main>

      <Footer />
    </>
  )
}

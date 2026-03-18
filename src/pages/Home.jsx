import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import Navbar      from '../components/Navbar/Navbar'
import ProductCard from '../components/Product/ProductCard'
import Footer      from '../components/Footer'
import styles      from './Home.module.css'

const CATS = ['Tous','Pashmina','Jersey','Cashmere','Crêpe & Soie','Accessoires']
const MATS = ['Toutes','Pashmina','Cashmere','Jersey','Crêpe','Soie','Chiffon','Viscose']

export default function Home() {
  const [activeCat, setActiveCat] = useState('Tous')
  const [activeMat, setActiveMat] = useState('Toutes')
  const { products, loading } = useProducts()

  const filtered = products.filter(p => {
    const okCat = activeCat === 'Tous' || p.category === activeCat
    const okMat = activeMat === 'Toutes' || p.material === activeMat
    return okCat && okMat
  })

  return (
    <>
      <Navbar />

      <div className={styles.promoBar}>
        <span>🚚 Livraison rapide Dakar et banlieue</span>
        <span>📞 78 536 34 25</span>
        <span>📍 Guediawaye Hamo4</span>
        <span>💳 Wave · Orange Money · Espèces</span>
      </div>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>✨ Nouvelle Collection 2026</span>
          <h1 className={styles.heroTitle}>Voiles &<br /><em>Accessoires</em><br />de Prestige</h1>
          <p className={styles.heroSlogan}>"Élégance, Pudeur et Classe<br />en parfait symbiose !"</p>
          <p className={styles.heroSub}>Pashminas · Cashmere · Jersey · Crêpe · Soie<br />Livraison à Dakar et toute la banlieue</p>
          <div className={styles.heroBtns}>
            <Link to="/produits" className="btn btn-primary btn-lg">Découvrir la boutique</Link>
            <a href="https://wa.me/221785363425" target="_blank" rel="noopener noreferrer" className={styles.waHero}>
              💬 WhatsApp
            </a>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroEmoji}>🧕</div>
          <div className={styles.heroGrid}><div>🌸</div><div>✨</div></div>
        </div>
      </section>

      {/* MATIÈRES */}
      <section className={styles.matSection}>
        <p className={styles.matTitle}>Filtrer par matière</p>
        <div className={styles.matGrid}>
          {MATS.map(m => (
            <button key={m} className={`${styles.matPill} ${activeMat===m?styles.active:''}`}
              onClick={() => setActiveMat(m)}>{m}</button>
          ))}
        </div>
      </section>

      {/* CATALOGUE */}
      <section className="container" style={{ paddingBottom:'64px' }}>
        <div className={styles.catBar}>
          {CATS.map(c => (
            <button key={c} className={`${styles.catPill} ${activeCat===c?styles.active:''}`}
              onClick={() => setActiveCat(c)}>{c}</button>
          ))}
        </div>
        <div className={styles.catalogHeader}>
          <h2 className={styles.catalogTitle}>{activeCat === 'Tous' ? 'Notre Collection' : activeCat}</h2>
          <span style={{ fontSize:'12px', color:'var(--gray-mid)' }}>
            {filtered.length} article{filtered.length>1?'s':''}
          </span>
        </div>
        {loading ? <div className="spinner" /> : (
          <div className={styles.productsGrid}>
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* SLOGAN */}
      <section className={styles.sloganSection}>
        <h2 className={styles.sloganText}>"Élégance, Pudeur et Classe<br /><em>en parfait symbiose !"</em></h2>
        <p className={styles.sloganBrand}>— Porokhane Shop ✨ · Guediawaye, Sénégal</p>
      </section>

      <Footer />
    </>
  )
}

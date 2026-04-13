import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { DEMO } from '../hooks/useProducts'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar/Navbar'
import ProductCard from '../components/Product/ProductCard'
import Footer from '../components/Footer'
import styles from './ProductDetail.module.css'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct]       = useState(null)
  const [related, setRelated]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [qty, setQty]               = useState(1)
  const [selColor, setSelColor]     = useState('')
  const [colorError, setColorError] = useState(false) // ← erreur si pas de couleur
  const [added, setAdded]           = useState(false)
  const [currentImg, setCurrentImg] = useState(0)   // index image active

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    setSelColor('')
    setColorError(false)
    setCurrentImg(0)
    try {
      const { data, error } = await supabase
        .from('products').select('*').eq('id', id).single()

      if (error || !data) {
        const demo = DEMO.find(p => p.id === id)
        if (!demo) { navigate('/produits'); return }
        setProduct(demo)
        setRelated(DEMO.filter(p => p.category === demo.category && p.id !== id).slice(0, 4))
      } else {
        setProduct(data)
        const { data: rel } = await supabase
          .from('products').select('*')
          .eq('category', data.category).eq('active', true)
          .neq('id', id).limit(4)
        setRelated(rel || [])
      }
    } catch {
      const demo = DEMO.find(p => p.id === id)
      if (demo) {
        setProduct(demo)
        setRelated(DEMO.filter(p => p.category === demo.category && p.id !== id).slice(0, 4))
      } else navigate('/produits')
    } finally {
      setLoading(false)
    }
  }

  // Récupérer toutes les images du produit
  const getAllImages = () => {
    if (!product) return []
    const imgs = []
    if (product.images && Array.isArray(product.images)) {
      imgs.push(...product.images.filter(Boolean))
    }
    if (product.image_url && !imgs.includes(product.image_url)) {
      imgs.unshift(product.image_url)
    }
    return imgs
  }

  const allImages = getAllImages()

  // Découper les couleurs (accepte · , ; espace)
  const colors = product?.colors
    ? product.colors.split(/[·,;]+/).map(c => c.trim()).filter(Boolean)
    : []

  const hasColors = colors.length > 0

  const fmt      = n => Number(n || 0).toLocaleString('fr-SN') + ' FCFA'
  const discount = product?.old_price > 0
    ? Math.round((1 - product.price / product.old_price) * 100) : 0

  // ─── AJOUTER AU PANIER ───
  const handleAddToCart = () => {
    // Couleur obligatoire si le produit en a
    if (hasColors && !selColor) {
      setColorError(true)
      document.getElementById('color-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    addToCart(product, qty, selColor)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  // ─── COMMANDER SUR WHATSAPP ───
  const handleWhatsApp = () => {
    if (hasColors && !selColor) {
      setColorError(true)
      document.getElementById('color-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    const msg = `Bonjour Porokhane Shop ✨ !\n\nJe suis intéressée par :\n• ${product.name}\n• Matière : ${product.material}\n• Coloris : ${selColor || 'à préciser'}\n• Quantité : ${qty}\n• Prix : ${fmt(product.price)}\n\nMerci !`
    window.open(`https://wa.me/221785363425?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (loading) return <><Navbar /><div className="spinner" style={{ marginTop: 80 }} /></>
  if (!product) return null

  return (
    <>
      <Navbar />

      {/* FIL D'ARIANE */}
      <div className={`container ${styles.breadcrumb}`}>
        <Link to="/">Accueil</Link><span>›</span>
        <Link to="/produits">Collection</Link><span>›</span>
        <Link to={`/produits?cat=${product.category}`}>{product.category}</Link><span>›</span>
        <span>{product.name}</span>
      </div>

      <div className={`container ${styles.productSection}`}>

        {/* ─── GALERIE IMAGES ─── */}
        <div className={styles.imageBlock}>
          {/* Image principale */}
          <div className={styles.mainImage} style={{ background: allImages.length === 0 ? (product.bg_color || '#FFF6E8') : '#F5F5F5' }}>
            {allImages.length > 0 ? (
              <img
                src={allImages[currentImg]}
                alt={product.name}
                className={styles.productImage}
              />
            ) : (
              <span className={styles.productEmoji}>{product.emoji || '🧕'}</span>
            )}
            {discount > 0 && (
              <span className={styles.discountBadge}>-{discount}%</span>
            )}
            {/* Flèches navigation si plusieurs images */}
            {allImages.length > 1 && (
              <>
                <button className={styles.imgPrev} onClick={() => setCurrentImg(i => (i - 1 + allImages.length) % allImages.length)}>‹</button>
                <button className={styles.imgNext} onClick={() => setCurrentImg(i => (i + 1) % allImages.length)}>›</button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className={styles.thumbs}>
              {allImages.map((img, i) => (
                <div
                  key={i}
                  className={`${styles.thumb} ${currentImg === i ? styles.thumbActive : ''}`}
                  onClick={() => setCurrentImg(i)}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── INFOS PRODUIT ─── */}
        <div className={styles.infoBlock}>
          <div className={styles.productHeader}>
            <span className={styles.category}>{product.category}</span>
            {product.badge && (
              <span className={`badge badge-${product.badge === 'Promo' ? 'promo' : 'new'}`}>
                {product.badge}
              </span>
            )}
          </div>

          <h1 className={styles.productName}>{product.name}</h1>
          <p className={styles.productMaterial}>{product.material} · {product.colors}</p>

          {/* PRIX */}
          <div className={styles.priceBlock}>
            <span className={styles.price}>{fmt(product.price)}</span>
            {product.old_price > 0 && (
              <>
                <span className={styles.oldPrice}>{fmt(product.old_price)}</span>
                <span className={styles.savings}>
                  Économisez {fmt(product.old_price - product.price)}
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className={styles.description}>{product.description}</p>
          )}

          {/* ─── CHOIX COULEUR OBLIGATOIRE ─── */}
          {hasColors && (
            <div id="color-section" className={`${styles.colorsBlock} ${colorError ? styles.colorsError : ''}`}>
              <p className={styles.colorsLabel}>
                Choisissez votre coloris
                <span className={styles.required}>*</span>
                {selColor && <span className={styles.selectedBadge}>✓ {selColor}</span>}
              </p>

              {colorError && !selColor && (
                <div className={styles.colorErrorMsg}>
                  ⚠️ Veuillez choisir un coloris avant d'ajouter au panier
                </div>
              )}

              <div className={styles.colorsList}>
                {colors.map(color => (
                  <button
                    key={color}
                    className={`${styles.colorBtn} ${selColor === color ? styles.colorSelected : ''}`}
                    onClick={() => { setSelColor(color); setColorError(false) }}
                  >
                    {selColor === color && <span className={styles.colorCheck}>✓</span>}
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUANTITÉ */}
          <div className={styles.qtyBlock}>
            <p className={styles.qtyLabel}>Quantité :</p>
            <div className={styles.qtyCtrl}>
              <button className={styles.qtyBtn} onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className={styles.qtyVal}>{qty}</span>
              <button className={styles.qtyBtn} onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}>+</button>
            </div>
            <span className={styles.stockInfo}>
              {(product.stock || 0) > 0
                ? <span style={{ color: 'var(--success)' }}>✓ {product.stock} en stock</span>
                : <span style={{ color: 'var(--danger)' }}>✗ Rupture de stock</span>
              }
            </span>
          </div>

          {/* BOUTONS */}
          <div className={styles.actions}>
            <button
              className={`btn btn-primary btn-lg ${styles.addBtn} ${added ? styles.addedBtn : ''}`}
              onClick={handleAddToCart}
              disabled={(product.stock || 0) === 0}
            >
              {added ? '✓ Ajouté au panier !' : '+ Ajouter au panier'}
            </button>
            <button className={`btn btn-lg ${styles.waBtn}`} onClick={handleWhatsApp}>
              💬 Commander sur WhatsApp
            </button>
          </div>

          {/* Si couleur pas choisie et bouton cliqué */}
          {colorError && !selColor && (
            <p className={styles.colorErrorBottom}>
              👆 Choisissez d'abord votre coloris ci-dessus
            </p>
          )}

          {/* INFOS LIVRAISON */}
          <div className={styles.deliveryInfo}>
            <div className={styles.deliveryItem}>
              <span>🚚</span>
              <div>
                <strong>Livraison rapide</strong>
                <p>Dakar, Pikine, Guediawaye, Parcelles, Thiaroye</p>
              </div>
            </div>
            <div className={styles.deliveryItem}>
              <span>💳</span>
              <div>
                <strong>Paiement flexible</strong>
                <p>Wave · Orange Money · Free Money · Espèces</p>
              </div>
            </div>
            <div className={styles.deliveryItem}>
              <span>📞</span>
              <div>
                <strong>Contact direct</strong>
                <p>78 536 34 25 · @porokhaneshop</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUITS SIMILAIRES */}
      {related.length > 0 && (
        <section className={`container ${styles.related}`}>
          <h2 className={styles.relatedTitle}>Vous aimerez aussi</h2>
          <div className={styles.relatedGrid}>
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <Footer />
    </>
  )
}
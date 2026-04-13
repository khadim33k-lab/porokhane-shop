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

  const [product, setProduct]     = useState(null)
  const [related, setRelated]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [currentImg, setCurrentImg] = useState(0)
  const [added, setAdded]         = useState(false)
  const [colorError, setColorError] = useState(false)

  // ─── NOUVEAU : sélection couleur par pièce ───
  // Chaque pièce a sa propre couleur sélectionnée
  // Ex: [{ qty: 1, color: 'Noir' }, { qty: 1, color: 'Blanc' }]
  const [colorLines, setColorLines] = useState([{ qty: 1, color: '' }])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    setColorLines([{ qty: 1, color: '' }])
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
        const { data: rel } = await supabase.from('products').select('*')
          .eq('category', data.category).eq('active', true).neq('id', id).limit(4)
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

  const getAllImages = () => {
    if (!product) return []
    const imgs = []
    if (product.images && Array.isArray(product.images)) imgs.push(...product.images.filter(Boolean))
    if (product.image_url && !imgs.includes(product.image_url)) imgs.unshift(product.image_url)
    return imgs
  }

  const allImages = getAllImages()
  const colors = product?.colors
    ? product.colors.split(/[·,;]+/).map(c => c.trim()).filter(Boolean)
    : []
  const hasColors  = colors.length > 0
  const totalQty   = colorLines.reduce((s, l) => s + l.qty, 0)

  const fmt = n => Number(n || 0).toLocaleString('fr-SN') + ' FCFA'
  const discount = product?.old_price > 0
    ? Math.round((1 - product.price / product.old_price) * 100) : 0

  // ─── Gérer les lignes de couleur ───
  const addColorLine = () => {
    if (totalQty >= (product?.stock || 99)) return
    setColorLines(prev => [...prev, { qty: 1, color: '' }])
  }

  const removeColorLine = idx => {
    if (colorLines.length === 1) return
    setColorLines(prev => prev.filter((_, i) => i !== idx))
  }

  const updateLineColor = (idx, color) => {
    setColorLines(prev => prev.map((l, i) => i === idx ? { ...l, color } : l))
    setColorError(false)
  }

  const updateLineQty = (idx, delta) => {
    setColorLines(prev => prev.map((l, i) => {
      if (i !== idx) return l
      const newQty = Math.max(1, l.qty + delta)
      return { ...l, qty: newQty }
    }))
  }

  // ─── Validation ───
  const validate = () => {
    if (!hasColors) return true
    return colorLines.every(l => l.color !== '')
  }

  // ─── Ajouter au panier ───
  const handleAddToCart = () => {
    if (!validate()) {
      setColorError(true)
      document.getElementById('color-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    // Ajouter chaque ligne séparément dans le panier
    colorLines.forEach(line => {
      addToCart(product, line.qty, line.color)
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  // ─── WhatsApp ───
  const handleWhatsApp = () => {
    if (!validate()) {
      setColorError(true)
      document.getElementById('color-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    const detail = colorLines
      .map(l => `• ${product.name} x${l.qty} — Coloris : ${l.color || 'Non précisé'}`)
      .join('\n')
    const total = fmt(product.price * totalQty)
    const msg = `Bonjour Porokhane Shop ✨ !\n\nJe voudrais commander :\n${detail}\n\nTotal : ${total} (${totalQty} pièce${totalQty > 1 ? 's' : ''})\n\nMerci !`
    window.open(`https://wa.me/221785363425?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (loading) return <><Navbar /><div className="spinner" style={{ marginTop: 80 }} /></>
  if (!product) return null

  return (
    <>
      <Navbar />

      <div className={`container ${styles.breadcrumb}`}>
        <Link to="/">Accueil</Link><span>›</span>
        <Link to="/produits">Collection</Link><span>›</span>
        <Link to={`/produits?cat=${product.category}`}>{product.category}</Link><span>›</span>
        <span>{product.name}</span>
      </div>

      <div className={`container ${styles.productSection}`}>

        {/* ─── GALERIE ─── */}
        <div className={styles.imageBlock}>
          <div className={styles.mainImage} style={{ background: allImages.length === 0 ? (product.bg_color || '#FFF6E8') : '#F5F5F5' }}>
            {allImages.length > 0 ? (
              <img src={allImages[currentImg]} alt={product.name} className={styles.productImage} />
            ) : (
              <span className={styles.productEmoji}>{product.emoji || '🧕'}</span>
            )}
            {discount > 0 && <span className={styles.discountBadge}>-{discount}%</span>}
            {allImages.length > 1 && (
              <>
                <button className={styles.imgPrev} onClick={() => setCurrentImg(i => (i - 1 + allImages.length) % allImages.length)}>‹</button>
                <button className={styles.imgNext} onClick={() => setCurrentImg(i => (i + 1) % allImages.length)}>›</button>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className={styles.thumbs}>
              {allImages.map((img, i) => (
                <div key={i} className={`${styles.thumb} ${currentImg === i ? styles.thumbActive : ''}`} onClick={() => setCurrentImg(i)}>
                  <img src={img} alt={`vue ${i + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── INFOS ─── */}
        <div className={styles.infoBlock}>
          <div className={styles.productHeader}>
            <span className={styles.category}>{product.category}</span>
            {product.badge && <span className={`badge badge-${product.badge === 'Promo' ? 'promo' : 'new'}`}>{product.badge}</span>}
          </div>

          <h1 className={styles.productName}>{product.name}</h1>
          <p className={styles.productMaterial}>{product.material} · {product.colors}</p>

          <div className={styles.priceBlock}>
            <span className={styles.price}>{fmt(product.price)}</span>
            {product.old_price > 0 && (
              <>
                <span className={styles.oldPrice}>{fmt(product.old_price)}</span>
                <span className={styles.savings}>Économisez {fmt(product.old_price - product.price)}</span>
              </>
            )}
          </div>

          {product.description && <p className={styles.description}>{product.description}</p>}

          {/* ─── SÉLECTION COULEUR PAR PIÈCE ─── */}
          {hasColors && (
            <div id="color-section" className={`${styles.colorsBlock} ${colorError ? styles.colorsError : ''}`}>
              <div className={styles.colorsHeader}>
                <p className={styles.colorsTitle}>
                  🎨 Choisissez vos coloris
                  <span className={styles.required}>*</span>
                </p>
                <span className={styles.totalPieces}>
                  {totalQty} pièce{totalQty > 1 ? 's' : ''} — {fmt(product.price * totalQty)}
                </span>
              </div>

              {colorError && (
                <div className={styles.colorErrorMsg}>
                  ⚠️ Veuillez choisir un coloris pour chaque ligne
                </div>
              )}

              {/* LIGNES DE COULEUR */}
              <div className={styles.colorLines}>
                {colorLines.map((line, idx) => (
                  <div key={idx} className={`${styles.colorLine} ${line.color ? styles.colorLineDone : ''}`}>
                    {/* Numéro de ligne */}
                    <div className={styles.lineNum}>
                      {line.color ? '✓' : idx + 1}
                    </div>

                    {/* Sélecteur couleur */}
                    <div className={styles.lineColors}>
                      <p className={styles.lineLabel}>
                        {line.color
                          ? <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓ {line.color}</span>
                          : <span style={{ color: 'var(--danger)' }}>Choisir un coloris</span>
                        }
                      </p>
                      <div className={styles.colorBtns}>
                        {colors.map(color => (
                          <button
                            key={color}
                            className={`${styles.colorBtn} ${line.color === color ? styles.colorSelected : ''}`}
                            onClick={() => updateLineColor(idx, color)}
                          >
                            {line.color === color && '✓ '}{color}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantité pour cette couleur */}
                    <div className={styles.lineQty}>
                      <button className={styles.qtyBtn} onClick={() => updateLineQty(idx, -1)}>−</button>
                      <span className={styles.qtyNum}>{line.qty}</span>
                      <button className={styles.qtyBtn} onClick={() => updateLineQty(idx, 1)}>+</button>
                    </div>

                    {/* Supprimer la ligne */}
                    {colorLines.length > 1 && (
                      <button className={styles.removeLine} onClick={() => removeColorLine(idx)} title="Supprimer">✕</button>
                    )}
                  </div>
                ))}
              </div>

              {/* AJOUTER UNE AUTRE COULEUR */}
              {totalQty < (product.stock || 99) && (
                <button className={styles.addColorLine} onClick={addColorLine}>
                  + Ajouter une autre couleur
                </button>
              )}

              {/* RÉCAPITULATIF */}
              {colorLines.some(l => l.color) && (
                <div className={styles.recap}>
                  <p className={styles.recapTitle}>📋 Récapitulatif de votre commande :</p>
                  {colorLines.map((l, i) => l.color && (
                    <div key={i} className={styles.recapLine}>
                      <span>• {l.color}</span>
                      <span>x{l.qty} pièce{l.qty > 1 ? 's' : ''}</span>
                      <span style={{ color: 'var(--orange)', fontWeight: 600 }}>{fmt(product.price * l.qty)}</span>
                    </div>
                  ))}
                  <div className={styles.recapTotal}>
                    <span>Total</span>
                    <span>{fmt(product.price * totalQty)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STOCK */}
          <div className={styles.stockRow}>
            {(product.stock || 0) > 0
              ? <span className={styles.inStock}>✓ {product.stock} en stock</span>
              : <span className={styles.outStock}>✗ Rupture de stock</span>
            }
          </div>

          {/* BOUTONS */}
          <div className={styles.actions}>
            <button
              className={`btn btn-primary btn-lg ${styles.addBtn} ${added ? styles.addedBtn : ''}`}
              onClick={handleAddToCart}
              disabled={(product.stock || 0) === 0}
            >
              {added
                ? `✓ ${totalQty} pièce${totalQty > 1 ? 's' : ''} ajoutée${totalQty > 1 ? 's' : ''} !`
                : `+ Ajouter au panier (${totalQty} pièce${totalQty > 1 ? 's' : ''})`
              }
            </button>
            <button className={`btn btn-lg ${styles.waBtn}`} onClick={handleWhatsApp}>
              💬 Commander sur WhatsApp
            </button>
          </div>

          {/* INFOS LIVRAISON */}
          <div className={styles.deliveryInfo}>
            <div className={styles.deliveryItem}><span>🚚</span><div><strong>Livraison rapide</strong><p>Dakar, Pikine, Guediawaye, Parcelles, Thiaroye</p></div></div>
            <div className={styles.deliveryItem}><span>💳</span><div><strong>Paiement flexible</strong><p>Wave · Orange Money · Free Money · Espèces</p></div></div>
            <div className={styles.deliveryItem}><span>📞</span><div><strong>Contact direct</strong><p>78 536 34 25 · @porokhaneshop</p></div></div>
          </div>
        </div>
      </div>

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
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
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty]         = useState(1)
  const [selColor, setSelColor] = useState('')
  const [added, setAdded]     = useState(false)

  useEffect(() => {
    window.scrollTo({ top:0, behavior:'smooth' })
    // Chercher dans Supabase
    supabase.from('products').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error || !data) {
          // Fallback demo
          const demo = DEMO.find(p => p.id === id)
          if (!demo) { navigate('/produits'); return }
          setProduct(demo)
          setRelated(DEMO.filter(p => p.category === demo.category && p.id !== id).slice(0,4))
        } else {
          setProduct(data)
          supabase.from('products').select('*').eq('category', data.category).eq('active', true).neq('id', id).limit(4)
            .then(({ data: rel }) => setRelated(rel || []))
        }
        setLoading(false)
      }).catch(() => {
        const demo = DEMO.find(p => p.id === id)
        if (demo) { setProduct(demo); setRelated(DEMO.filter(p => p.category === demo.category && p.id !== id).slice(0,4)) }
        else navigate('/produits')
        setLoading(false)
      })
  }, [id])

  const fmt      = n => Number(n).toLocaleString('fr-SN') + ' FCFA'
  const colors   = product?.colors?.split('·').map(c=>c.trim()).filter(Boolean) || []
  const discount = product?.old_price > 0 ? Math.round((1-product.price/product.old_price)*100) : 0

  const handleAddToCart = () => {
    addToCart(product, qty, selColor)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  const handleWhatsApp = () => {
    const msg = `Bonjour Porokhane Shop ✨ !\n\nJe suis intéressée par :\n• ${product.name}\n• Coloris : ${selColor||'à préciser'}\n• Quantité : ${qty}\n• Prix : ${fmt(product.price)}\n\nMerci !`
    window.open(`https://wa.me/221785363425?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (loading) return <><Navbar /><div className="spinner" style={{marginTop:80}} /></>
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
        <div className={styles.imageBlock}>
          <div className={styles.mainImage} style={{background:product.bg_color||'#FFF6E8'}}>
            {product.image_url
              ? <img src={product.image_url} alt={product.name} className={styles.productImage} />
              : <span className={styles.productEmoji}>{product.emoji||'🧕'}</span>
            }
            {discount>0 && <span className={styles.discountBadge}>-{discount}%</span>}
          </div>
        </div>
        <div className={styles.infoBlock}>
          <div className={styles.productHeader}>
            <span className={styles.category}>{product.category}</span>
            {product.badge && <span className={`badge badge-${product.badge==='Promo'?'promo':'new'}`}>{product.badge}</span>}
          </div>
          <h1 className={styles.productName}>{product.name}</h1>
          <p className={styles.productMaterial}>{product.material} · {product.colors}</p>
          <div className={styles.priceBlock}>
            <span className={styles.price}>{fmt(product.price)}</span>
            {(product.old_price||product.oldPrice)>0 && <>
              <span className={styles.oldPrice}>{fmt(product.old_price||product.oldPrice)}</span>
              <span className={styles.savings}>Économisez {fmt((product.old_price||product.oldPrice)-product.price)}</span>
            </>}
          </div>
          {product.description && <p className={styles.description}>{product.description}</p>}
          {colors.length>0 && (
            <div className={styles.colorsBlock}>
              <p className={styles.colorsLabel}>Coloris disponibles :</p>
              <div className={styles.colorsList}>
                {colors.map(c => (
                  <button key={c} className={`${styles.colorBtn} ${selColor===c?styles.colorSelected:''}`} onClick={()=>setSelColor(c)}>{c}</button>
                ))}
              </div>
              {selColor && <p className={styles.selectedColor}>Sélectionné : <strong>{selColor}</strong></p>}
            </div>
          )}
          <div className={styles.qtyBlock}>
            <p className={styles.qtyLabel}>Quantité :</p>
            <div className={styles.qtyCtrl}>
              <button className={styles.qtyBtn} onClick={()=>setQty(Math.max(1,qty-1))}>−</button>
              <span className={styles.qtyVal}>{qty}</span>
              <button className={styles.qtyBtn} onClick={()=>setQty(Math.min(product.stock||99,qty+1))}>+</button>
            </div>
            <span className={styles.stockInfo}>
              {(product.stock||0)>0
                ? <span style={{color:'var(--success)'}}>✓ {product.stock} en stock</span>
                : <span style={{color:'var(--danger)'}}>✗ Rupture de stock</span>
              }
            </span>
          </div>
          <div className={styles.actions}>
            <button className={`btn btn-primary btn-lg ${styles.addBtn} ${added?styles.addedBtn:''}`} onClick={handleAddToCart} disabled={(product.stock||0)===0}>
              {added ? '✓ Ajouté au panier !' : '+ Ajouter au panier'}
            </button>
            <button className={`btn btn-lg ${styles.waBtn}`} onClick={handleWhatsApp}>
              💬 Commander sur WhatsApp
            </button>
          </div>
          <div className={styles.deliveryInfo}>
            <div className={styles.deliveryItem}><span>🚚</span><div><strong>Livraison rapide</strong><p>Dakar, Pikine, Guediawaye, Parcelles, Thiaroye</p></div></div>
            <div className={styles.deliveryItem}><span>💳</span><div><strong>Paiement flexible</strong><p>Wave · Orange Money · Free Money · Espèces</p></div></div>
            <div className={styles.deliveryItem}><span>📞</span><div><strong>Contact direct</strong><p>78 536 34 25 · @porokhaneshop</p></div></div>
          </div>
        </div>
      </div>
      {related.length>0 && (
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

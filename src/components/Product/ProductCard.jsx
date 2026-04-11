import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import styles from './ProductCard.module.css'

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [imgError, setImgError] = useState(false)

  // Récupérer la meilleure image disponible
  const getMainImage = () => {
    // Vérifier le tableau images[] en premier
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const validImg = product.images.find(img => img && img.trim() !== '')
      if (validImg) return validImg
    }
    // Sinon utiliser image_url
    if (product.image_url && product.image_url.trim() !== '') {
      return product.image_url
    }
    // Pas d'image
    return null
  }

  const mainImage = getMainImage()
  const hasImage  = mainImage && !imgError

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  const fmt = (n) => Number(n || 0).toLocaleString('fr-SN') + ' FCFA'

  return (
    <Link to={`/produits/${product.id}`} className={styles.card}>
      {/* IMAGE */}
      <div
        className={styles.imageWrap}
        style={{ background: hasImage ? '#F5F5F5' : (product.bg_color || product.bgColor || '#FFF6E8') }}
      >
        {hasImage ? (
          <img
            src={mainImage}
            alt={product.name}
            className={styles.image}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <span className={styles.emoji}>{product.emoji || '🧕'}</span>
        )}

        {/* TAG MATIÈRE */}
        {product.material && product.material !== '—' && (
          <span className={styles.matTag}>{product.material}</span>
        )}

        {/* OVERLAY AU SURVOL */}
        <div className={styles.overlay}>
          <button className={styles.addBtn} onClick={handleAddToCart}>
            + Ajouter au panier
          </button>
          {product.colors && (
            <span className={styles.colors}>{product.colors}</span>
          )}
        </div>
      </div>

      {/* INFOS */}
      <div className={styles.info}>
        <div className={styles.category}>{product.category}</div>
        <h3 className={styles.name}>{product.name}</h3>
        {product.colors && (
          <p className={styles.colorsList}>{product.colors}</p>
        )}
        <div className={styles.bottom}>
          <div className={styles.prices}>
            <span className={styles.price}>{fmt(product.price)}</span>
            {(product.old_price > 0 || product.oldPrice > 0) && (
              <span className={styles.oldPrice}>
                {fmt(product.old_price || product.oldPrice)}
              </span>
            )}
          </div>
          {product.badge && (
            <span className={`${styles.badge} ${
              product.badge === 'Promo' ? styles.badgePromo :
              product.badge === 'Premium' || product.badge === 'Luxe' ? styles.badgeLuxe :
              styles.badgeDefault
            }`}>
              {product.badge}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
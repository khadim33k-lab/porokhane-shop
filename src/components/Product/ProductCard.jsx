import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { getProductUniverse } from '../../lib/catalog'
import { SHOP_CONFIG } from '../../lib/shopConfig'
import { getProductOption } from '../../lib/productOptions'
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
  const universe = getProductUniverse(product)
  const requiresSelection = Boolean(product.colors?.trim()) || getProductOption(product).enabled

  const handleAddToCart = (e) => {
    if (requiresSelection) return
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  const fmt = (n) => Number(n || 0) > 0
    ? Number(n).toLocaleString('fr-SN') + ' FCFA'
    : 'Prix en boutique'

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
          <div className={styles.placeholder}>
            <img src={SHOP_CONFIG.logo} alt="" aria-hidden="true" />
            <span>{universe}</span>
          </div>
        )}

        {/* TAG MATIÈRE */}
        {product.material && product.material !== '—' && (
          <span className={styles.matTag}>{product.material}</span>
        )}

        {/* OVERLAY AU SURVOL */}
        <div className={styles.overlay}>
          <button type="button" className={styles.addBtn} onClick={handleAddToCart}>
            {requiresSelection ? 'Choisir les options' : '+ Ajouter au panier'}
          </button>
          {product.colors && (
            <span className={styles.colors}>{product.colors}</span>
          )}
        </div>
      </div>

      {/* INFOS */}
      <div className={styles.info}>
        <div className={styles.category}>{universe}</div>
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

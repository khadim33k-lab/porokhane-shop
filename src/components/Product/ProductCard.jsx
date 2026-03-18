import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import styles from './ProductCard.module.css'

function ProductCard({ product }) {
  const { addToCart } = useCart()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
    // Petite notification visuelle (à améliorer avec un toast)
  }

  const fmt = (n) => Number(n).toLocaleString('fr-SN') + ' FCFA'

  return (
    <Link to={`/produits/${product.id}`} className={styles.card}>
      {/* IMAGE */}
      <div className={styles.imageWrap} style={{ background: product.bgColor || '#FFF6E8' }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className={styles.image} />
        ) : (
          <span className={styles.emoji}>{product.emoji || '🧕'}</span>
        )}
        {product.material && product.material !== '—' && (
          <span className={styles.matTag}>{product.material}</span>
        )}
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
            {product.oldPrice > 0 && (
              <span className={styles.oldPrice}>{fmt(product.oldPrice)}</span>
            )}
          </div>
          {product.badge && (
            <span className={`${styles.badge} ${styles[`badge${product.badge}`] || styles.badgeDefault}`}>
              {product.badge}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard

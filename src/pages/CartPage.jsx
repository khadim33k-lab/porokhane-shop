import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer'
import styles from './CartPage.module.css'

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart()
  const navigate = useNavigate()

  const fmt = (n) => Number(n).toLocaleString('fr-SN') + ' FCFA'

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <div className={styles.emptyPage}>
          <div className={styles.emptyIcon}>🛍️</div>
          <h2 className={styles.emptyTitle}>Votre panier est vide</h2>
          <p className={styles.emptySub}>Découvrez notre collection de voiles et accessoires</p>
          <Link to="/produits" className="btn btn-primary btn-lg">
            Explorer la boutique
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className={`container ${styles.cartPage}`}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Mon Panier</h1>
          <span className={styles.itemCount}>{totalItems} article{totalItems > 1 ? 's' : ''}</span>
        </div>

        <div className={styles.cartLayout}>
          {/* LISTE DES ARTICLES */}
          <div className={styles.cartItems}>
            {cartItems.map(item => (
              <div key={item.key} className={styles.cartItem}>
                <div className={styles.itemImg} style={{ background: item.bgColor || '#FFF6E8' }}>
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                    : <span>{item.emoji || '🧕'}</span>
                  }
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemTop}>
                    <div>
                      <h3 className={styles.itemName}>{item.name}</h3>
                      <p className={styles.itemMeta}>
                        {item.material && `${item.material}`}
                        {item.color && ` · Coloris : ${item.color}`}
                      </p>
                    </div>
                    <button className={styles.removeBtn} onClick={() => removeFromCart(item.key)} title="Retirer">✕</button>
                  </div>
                  <div className={styles.itemBottom}>
                    <div className={styles.qtyCtrl}>
                      <button className={styles.qtyBtn} onClick={() => updateQuantity(item.key, item.quantity - 1)}>−</button>
                      <span className={styles.qty}>{item.quantity}</span>
                      <button className={styles.qtyBtn} onClick={() => updateQuantity(item.key, item.quantity + 1)}>+</button>
                    </div>
                    <span className={styles.itemPrice}>{fmt(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className={styles.cartActions}>
              <button className="btn btn-outline btn-sm" onClick={clearCart}>🗑️ Vider le panier</button>
              <Link to="/produits" className="btn btn-outline btn-sm">← Continuer mes achats</Link>
            </div>
          </div>

          {/* RÉSUMÉ */}
          <div className={styles.summary}>
            <div className="card">
              <div className="card-header"><span className="card-title">Résumé de la commande</span></div>
              <div className="card-body">
                {cartItems.map(item => (
                  <div key={item.key} className={styles.summaryLine}>
                    <span>{item.name} x{item.quantity}</span>
                    <span>{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className={styles.summaryDivider} />
                <div className={styles.summaryLine}>
                  <span>Sous-total</span>
                  <span>{fmt(totalPrice)}</span>
                </div>
                <div className={styles.summaryLine}>
                  <span>Livraison</span>
                  <span style={{ color: 'var(--success)', fontWeight: 500 }}>À confirmer</span>
                </div>
                <div className={`${styles.summaryLine} ${styles.summaryTotal}`}>
                  <span>Total</span>
                  <span>{fmt(totalPrice)}</span>
                </div>

                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={() => navigate('/commande')}
                  style={{ marginTop: '16px' }}
                >
                  Commander — {fmt(totalPrice)}
                </button>

                <a
                  href={`https://wa.me/221785363425?text=${encodeURIComponent(
                    'Bonjour Porokhane Shop ✨ !\n\nJe voudrais commander :\n' +
                    cartItems.map(i => `• ${i.name} x${i.quantity} = ${fmt(i.price * i.quantity)}`).join('\n') +
                    `\n\nTotal : ${fmt(totalPrice)}\n\nMerci !`
                  )}`}
                  target="_blank" rel="noopener noreferrer"
                  className={styles.waBtn}
                >
                  💬 Commander via WhatsApp
                </a>

                <div className={styles.paymentIcons}>
                  <span>💙 Wave</span>
                  <span>🟠 Orange Money</span>
                  <span>💵 Espèces</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default CartPage

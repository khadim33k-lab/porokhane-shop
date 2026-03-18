import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import styles from './CartDrawer.module.css'

function CartDrawer({ isOpen, onClose }) {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart()
  const navigate = useNavigate()

  const fmt = (n) => Number(n).toLocaleString('fr-SN') + ' FCFA'

  const handleCheckout = () => {
    onClose()
    navigate('/commande')
  }

  const handleWhatsApp = () => {
    const items = cartItems.map(i => `• ${i.name} x${i.quantity} = ${fmt(i.price * i.quantity)}`).join('\n')
    const msg = `Bonjour Porokhane Shop ✨ !\n\nJe voudrais commander :\n${items}\n\n💰 Total : ${fmt(totalPrice)}\n\nMerci !`
    window.open(`https://wa.me/221785363425?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <>
      {/* OVERLAY */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.show : ''}`}
        onClick={onClose}
      />

      {/* DRAWER */}
      <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <span>🛒 Mon Panier</span>
            {totalItems > 0 && <span className={styles.count}>{totalItems}</span>}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* CONTENU */}
        <div className={styles.body}>
          {cartItems.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🛍️</div>
              <p className={styles.emptyTitle}>Votre panier est vide</p>
              <p className={styles.emptySub}>Découvrez notre collection de voiles</p>
              <button className="btn btn-primary" onClick={onClose}>
                Explorer la boutique
              </button>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.key} className={styles.item}>
                <div className={styles.itemImg} style={{ background: item.bgColor || '#FFF6E8' }}>
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                    : <span>{item.emoji || '🧕'}</span>
                  }
                </div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemMeta}>
                    {item.material}
                    {item.color && ` · ${item.color}`}
                  </p>
                  <div className={styles.itemBottom}>
                    <div className={styles.qtyCtrl}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      >−</button>
                      <span className={styles.qty}>{item.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      >+</button>
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeFromCart(item.key)}
                    >Retirer</button>
                  </div>
                  <p className={styles.itemPrice}>{fmt(item.price * item.quantity)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        {cartItems.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span>Livraison</span>
              <span className={styles.free}>À confirmer</span>
            </div>
            <div className={styles.totalRow + ' ' + styles.grandTotal}>
              <span>Total</span>
              <span>{fmt(totalPrice)}</span>
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={handleCheckout}>
              Commander — {fmt(totalPrice)}
            </button>
            <button
              className={styles.waBtn}
              onClick={handleWhatsApp}
            >
              💬 Commander via WhatsApp
            </button>
            <button className="btn btn-outline btn-full" onClick={onClose} style={{ marginTop: '8px' }}>
              Continuer mes achats
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default CartDrawer

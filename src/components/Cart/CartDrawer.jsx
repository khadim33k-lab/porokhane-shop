import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { getProductImage } from '../../lib/productImages'
import { SHOP_CONFIG } from '../../lib/shopConfig'
import { formatItemOption } from '../../lib/productOptions'
import WhatsAppIcon from '../icons/WhatsAppIcon'
import { BagIcon, CloseIcon } from '../icons/StoreIcons'
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
    const items = cartItems.map(i => {
      const choices = [i.color && `Coloris : ${i.color}`, formatItemOption(i)].filter(Boolean).join(' · ')
      return `• ${i.name} x${i.quantity}${choices ? ` — ${choices}` : ''} = ${fmt(i.price * i.quantity)}`
    }).join('\n')
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
            <BagIcon size={23} />
            <span>Votre panier</span>
            {totalItems > 0 && <span className={styles.count}>{totalItems}</span>}
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer le panier">
            <CloseIcon size={24} />
          </button>
        </div>

        {/* CONTENU */}
        <div className={styles.body}>
          {cartItems.length === 0 ? (
            <div className={styles.empty}>
              <img className={styles.emptyLogo} src={SHOP_CONFIG.logo} alt="Porokhane Shop" />
              <p className={styles.emptyTitle}>Votre panier est vide</p>
              <p className={styles.emptySub}>Découvrez notre sélection Mode & Voiles et Accessoires.</p>
              <button className="btn btn-primary" onClick={onClose}>
                Explorer la boutique
              </button>
            </div>
          ) : (
            cartItems.map(item => {
              const image = getProductImage(item)

              return (
                <div key={item.key} className={styles.item}>
                  <div className={styles.itemImg}>
                    <img
                      src={image || SHOP_CONFIG.logo}
                      alt={image ? item.name : 'Porokhane Shop'}
                      className={image ? styles.productImage : styles.fallbackLogo}
                    />
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTop}>
                      <div>
                        <p className={styles.itemName}>{item.name}</p>
                        <p className={styles.itemMeta}>
                          {item.material}
                          {item.color && ` · ${item.color}`}
                          {item.option_value && ` · ${item.option_name || 'Option'} : ${item.option_value}`}
                        </p>
                      </div>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeFromCart(item.key)}
                      >Retirer</button>
                    </div>
                    <div className={styles.itemBottom}>
                      <div className={styles.qtyCtrl}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          aria-label={`Diminuer la quantité de ${item.name}`}
                        >−</button>
                        <span className={styles.qty}>{item.quantity}</span>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          aria-label={`Augmenter la quantité de ${item.name}`}
                        >+</button>
                      </div>
                      <p className={styles.itemPrice}>{fmt(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              )
            })
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
              <WhatsAppIcon size={20} /> Commander via WhatsApp
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

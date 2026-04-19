import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { useCart } from '../context/CartContext'
import { whatsappLink, SHOP_CONFIG } from '../lib/shopConfig'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer'
import styles from './Checkout.module.css'

export default function Checkout() {
  const { cartItems, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading]       = useState(false)
  const [success, setSuccess]       = useState(false)
  const [orderId, setOrderId]       = useState('')
  const [serverError, setServerError] = useState('')
  const [form, setForm] = useState({
    firstName:'', lastName:'', phone:'',
    zone:'', address:'', paymentMethod:'Wave', note:''
  })
  const [errors, setErrors] = useState({})

  const fmt = n => Number(n || 0).toLocaleString('fr-SN') + ' FCFA'
  const set  = e => {
    setForm({...form, [e.target.name]: e.target.value})
    setErrors({...errors, [e.target.name]: ''})
    setServerError('')
  }

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Prénom requis'
    if (!form.lastName.trim())  e.lastName  = 'Nom requis'
    if (!form.phone.trim())     e.phone     = 'Téléphone requis'
    if (!form.zone.trim())      e.zone      = 'Quartier requis'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    setServerError('')

    try {
      // ✅ Fix #5 : fonction SQL transactionnelle
      // commande + décrémentation stock en une seule opération atomique
      const { data, error } = await supabase.rpc('create_order_with_stock', {
        p_client_name:    `${form.firstName} ${form.lastName}`,
        p_client_phone:   form.phone,
        p_client_zone:    form.zone,
        p_client_address: form.address,
        p_items: cartItems.map(i => ({
          product_id: i.id,
          name:       i.name,
          price:      i.price,
          quantity:   i.quantity,
          color:      i.color || '',
          emoji:      i.emoji || '🧕'
        })),
        p_total:          totalPrice,
        p_payment_method: form.paymentMethod,
        p_note:           form.note
      })

      if (error) {
        // Erreur métier (stock insuffisant, etc.)
        const msg = error.message?.includes('Stock insuffisant')
          ? error.message
          : 'Erreur lors de l\'enregistrement. Veuillez réessayer.'
        setServerError(msg)
        return
      }

      // ✅ Seulement si tout s'est bien passé en base
      const shortId = data.order_id.toString().slice(-6).toUpperCase()
      clearCart()
      setOrderId(shortId)
      setSuccess(true)

    } catch (err) {
      console.error(err)
      setServerError('Erreur inattendue. Commandez directement sur WhatsApp.')
    } finally {
      setLoading(false)
    }
  }

  // ─── SUCCÈS ───
  if (success) return (
    <>
      <Navbar />
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✅</div>
          <h1>Commande confirmée !</h1>
          <p className={styles.successId}>Réf : CMD-{orderId}</p>
          <p>
            Merci {form.firstName} ! Votre commande a bien été enregistrée.
            Nous vous contacterons au <strong>{form.phone}</strong> sous peu.
          </p>
          <a
            href={whatsappLink(`Bonjour ! J'ai passé une commande (CMD-${orderId}). Merci !`)}
            target="_blank" rel="noopener noreferrer"
            className="btn btn-success btn-lg"
            style={{ marginTop: 20 }}
          >
            💬 Confirmer sur WhatsApp
          </a>
          <button className="btn btn-outline" onClick={() => navigate('/')} style={{ marginTop: 10 }}>
            Retour à la boutique
          </button>
        </div>
      </div>
      <Footer />
    </>
  )

  if (cartItems.length === 0) return (
    <>
      <Navbar />
      <div className={styles.emptyPage}>
        <p>Votre panier est vide</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Voir la boutique
        </button>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <Navbar />
      <div className={`container ${styles.checkoutPage}`}>
        <h1 className={styles.pageTitle}>Finaliser ma commande</h1>

        {serverError && (
          <div className="alert alert-danger" style={{ marginBottom: 20 }}>
            ❌ {serverError}
            <a
              href={whatsappLink('Bonjour ! Je voudrais passer une commande.')}
              target="_blank" rel="noopener noreferrer"
              style={{ display:'block', marginTop:8, fontWeight:700 }}
            >
              💬 Commander directement sur WhatsApp →
            </a>
          </div>
        )}

        <div className={styles.checkoutGrid}>
          <form onSubmit={handleSubmit}>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header"><span className="card-title">Vos informations</span></div>
              <div className="card-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Prénom *</label>
                    <input className="form-input" name="firstName" value={form.firstName} onChange={set} placeholder="Fatou" />
                    {errors.firstName && <span className="form-error">{errors.firstName}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom *</label>
                    <input className="form-input" name="lastName" value={form.lastName} onChange={set} placeholder="Diallo" />
                    {errors.lastName && <span className="form-error">{errors.lastName}</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone *</label>
                  <input className="form-input" name="phone" value={form.phone} onChange={set} placeholder="77 000 00 00" />
                  {errors.phone && <span className="form-error">{errors.phone}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Quartier *</label>
                  <input className="form-input" name="zone" value={form.zone} onChange={set} placeholder="Guediawaye, Parcelles, Pikine..." />
                  {errors.zone && <span className="form-error">{errors.zone}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Adresse précise</label>
                  <input className="form-input" name="address" value={form.address} onChange={set} placeholder="Rue, numéro, repère..." />
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header"><span className="card-title">Paiement</span></div>
              <div className="card-body">
                <div className="form-group">
                  <select className="form-select" name="paymentMethod" value={form.paymentMethod} onChange={set}>
                    <option value="Wave">💙 Wave</option>
                    <option value="Orange Money">🟠 Orange Money</option>
                    <option value="Free Money">🟢 Free Money</option>
                    <option value="Espèces">💵 Espèces à la livraison</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Note (instructions livraison...)</label>
                  <textarea className="form-textarea" name="note" value={form.note} onChange={set}
                    placeholder="Ex: livraison après 17h..." rows={3} />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
              {loading ? '⏳ Enregistrement...' : `✅ Confirmer — ${fmt(totalPrice)}`}
            </button>
          </form>

          {/* RÉSUMÉ */}
          <div className={styles.summary}>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Résumé ({cartItems.length} article{cartItems.length > 1 ? 's' : ''})</span>
              </div>
              <div className="card-body">
                {cartItems.map(i => (
                  <div key={i.key} className={styles.summaryItem}>
                    <div className={styles.summaryEmoji}>{i.emoji || '🧕'}</div>
                    <div className={styles.summaryInfo}>
                      <p className={styles.summaryName}>{i.name}</p>
                      <p className={styles.summaryMeta}>{i.color && `${i.color} · `}Qté: {i.quantity}</p>
                    </div>
                    <p className={styles.summaryPrice}>{fmt(i.price * i.quantity)}</p>
                  </div>
                ))}
                <div className={`${styles.summaryTotal} ${styles.summaryGrand}`}>
                  <span>Total</span>
                  <span>{fmt(totalPrice)}</span>
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
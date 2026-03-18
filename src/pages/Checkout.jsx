import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { useCart } from '../context/CartContext'
import Navbar  from '../components/Navbar/Navbar'
import Footer  from '../components/Footer'
import styles  from './Checkout.module.css'

export default function Checkout() {
  const { cartItems, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [form, setForm] = useState({
    firstName:'', lastName:'', phone:'', zone:'', address:'', paymentMethod:'Wave', note:''
  })
  const [errors, setErrors] = useState({})

  const fmt = n => Number(n).toLocaleString('fr-SN') + ' FCFA'
  const set = e => { setForm({...form, [e.target.name]: e.target.value}); setErrors({...errors, [e.target.name]:''}) }

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
    try {
      // Créer la commande dans Supabase
      const { data, error } = await supabase.from('orders').insert({
        client_name:    `${form.firstName} ${form.lastName}`,
        client_phone:   form.phone,
        client_zone:    form.zone,
        client_address: form.address,
        items: cartItems.map(i => ({
          product_id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          color: i.color || '',
          emoji: i.emoji || '🧕'
        })),
        total:          totalPrice,
        payment_method: form.paymentMethod,
        note:           form.note,
        status:         'Nouveau'
      }).select().single()

      if (error) throw error

      // Décrémenter le stock
      for (const item of cartItems) {
        const { data: prod } = await supabase.from('products').select('stock, sales_count').eq('id', item.id).single()
        if (prod) {
          await supabase.from('products').update({
            stock:       Math.max(0, prod.stock - item.quantity),
            sales_count: (prod.sales_count || 0) + item.quantity
          }).eq('id', item.id)
        }
      }

      setOrderId(data.id.slice(-6).toUpperCase())
      clearCart()
      setSuccess(true)
    } catch (err) {
      // Mode demo — commande locale
      setOrderId(Math.random().toString(36).slice(-6).toUpperCase())
      clearCart()
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <>
      <Navbar />
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✅</div>
          <h1>Commande confirmée !</h1>
          <p className={styles.successId}>Réf : CMD-{orderId}</p>
          <p>Merci ! Nous vous contacterons au <strong>{form.phone}</strong> pour confirmer la livraison.</p>
          <a href={`https://wa.me/221785363425?text=${encodeURIComponent(`Bonjour ! J'ai commandé (CMD-${orderId}). Merci !`)}`}
             target="_blank" rel="noopener noreferrer" className="btn btn-success btn-lg" style={{marginTop:20}}>
            💬 Confirmer sur WhatsApp
          </a>
          <button className="btn btn-outline" onClick={() => navigate('/')} style={{marginTop:10}}>
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
        <button className="btn btn-primary" onClick={() => navigate('/')}>Voir la boutique</button>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <Navbar />
      <div className={`container ${styles.checkoutPage}`}>
        <h1 className={styles.pageTitle}>Finaliser ma commande</h1>
        <div className={styles.checkoutGrid}>
          <form onSubmit={handleSubmit}>
            <div className="card" style={{marginBottom:20}}>
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
            <div className="card" style={{marginBottom:20}}>
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
                  <label className="form-label">Note (couleur souhaitée, etc.)</label>
                  <textarea className="form-textarea" name="note" value={form.note} onChange={set}
                    placeholder="Ex: coloris bordeaux, livraison après 17h..." rows={3} />
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
              {loading ? 'Traitement...' : `Commander — ${fmt(totalPrice)}`}
            </button>
          </form>

          <div className={styles.summary}>
            <div className="card">
              <div className="card-header"><span className="card-title">Résumé</span></div>
              <div className="card-body">
                {cartItems.map(i => (
                  <div key={i.key} className={styles.summaryItem}>
                    <div className={styles.summaryEmoji}>{i.emoji||'🧕'}</div>
                    <div className={styles.summaryInfo}>
                      <p className={styles.summaryName}>{i.name}</p>
                      <p className={styles.summaryMeta}>{i.color && `${i.color} · `}Qté: {i.quantity}</p>
                    </div>
                    <p className={styles.summaryPrice}>{fmt(i.price*i.quantity)}</p>
                  </div>
                ))}
                <div className={styles.summaryTotal}><span>Total</span><span>{fmt(totalPrice)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabase/client'
import styles from './AdminOrders.module.css'

const STATUSES = ['Tous', 'Nouveau', 'En cours', 'Livré', 'Annulé']

export default function AdminOrders() {
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [filter, setFilter]     = useState('Tous')
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchOrders()

    // Écoute temps réel
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      ).subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      setOrders(data || [])
    } catch (err) {
      console.error('Erreur commandes:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = orders.filter(o => {
    const okStatus = filter === 'Tous' || o.status === filter
    const okSearch = !search ||
      o.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.client_phone?.includes(search) ||
      o.id?.includes(search)
    return okStatus && okSearch
  })

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === 'Tous' ? orders.length : orders.filter(o => o.status === s).length
    return acc
  }, {})

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    }
  }

  const deleteOrder = async id => {
    if (!window.confirm('Supprimer cette commande ?')) return
    await supabase.from('orders').delete().eq('id', id)
    setOrders(prev => prev.filter(o => o.id !== id))
  }

  const fmt     = n => Number(n || 0).toLocaleString('fr-SN') + ' FCFA'
  const fmtDate = ts => {
    if (!ts) return '—'
    return new Date(ts).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const waMsg = o => encodeURIComponent(
    `Bonjour ${o.client_name} ! Votre commande Porokhane Shop ✨ est en cours de traitement. Merci !`
  )

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          Commandes
          {orders.length > 0 && (
            <span style={{ fontSize: 14, color: 'var(--gray-mid)', fontFamily: 'var(--font-sans)', fontWeight: 400, marginLeft: 10 }}>
              ({orders.length} total)
            </span>
          )}
        </h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            className="form-input"
            style={{ width: 220 }}
            placeholder="🔍 Client, téléphone, ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="btn btn-outline btn-sm" onClick={fetchOrders}>🔄</button>
        </div>
      </div>

      {/* ALERTE ERREUR */}
      {error && (
        <div className="alert alert-danger">
          ❌ Erreur : {error}
          <br />
          <small>Vérifiez les règles RLS dans Supabase (voir instructions)</small>
        </div>
      )}

      {/* FILTRES STATUT */}
      <div className={styles.statusFilters}>
        {STATUSES.map(s => (
          <button
            key={s}
            className={`${styles.statusBtn} ${filter === s ? styles.active : ''}`}
            onClick={() => setFilter(s)}
          >
            {s}
            <span className={styles.statusCount}>{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="table-wrapper">
          {loading ? (
            <div className="spinner" style={{ margin: '40px auto' }} />
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--gray-mid)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
              <p style={{ fontSize: 16, fontFamily: 'var(--font-serif)' }}>
                {orders.length === 0 ? 'Aucune commande pour l\'instant' : 'Aucune commande trouvée'}
              </p>
              <p style={{ fontSize: 12, marginTop: 6 }}>
                {orders.length === 0 ? 'Les commandes de vos clientes apparaîtront ici' : 'Essayez d\'autres filtres'}
              </p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Réf</th>
                  <th>Client</th>
                  <th>Zone</th>
                  <th>Produits</th>
                  <th>Total</th>
                  <th>Paiement</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--gray-mid)' }}>
                      #{(o.id || '').slice(-6).toUpperCase()}
                    </td>
                    <td>
                      <strong>{o.client_name}</strong>
                      <div style={{ fontSize: 11, color: 'var(--gray-mid)' }}>{o.client_phone}</div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--gray-mid)' }}>{o.client_zone}</td>
                    <td style={{ fontSize: 12, maxWidth: 180 }}>
                      {(o.items || []).map(i => `${i.name} x${i.quantity}`).join(', ').substring(0, 50)}
                      {o.note && <div style={{ fontSize: 11, color: 'var(--orange)', marginTop: 2 }}>📝 {o.note}</div>}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--orange)', whiteSpace: 'nowrap' }}>
                      {fmt(o.total)}
                    </td>
                    <td style={{ fontSize: 12 }}>{o.payment_method}</td>
                    <td>
                      <select
                        className={styles.statusSelect}
                        value={o.status || 'Nouveau'}
                        onChange={e => updateStatus(o.id, e.target.value)}
                      >
                        {['Nouveau', 'En cours', 'Livré', 'Annulé'].map(s => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--gray-mid)', whiteSpace: 'nowrap' }}>
                      {fmtDate(o.created_at)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => setSelected(o)}
                        >Détails</button>
                        <a
                          href={`https://wa.me/221${(o.client_phone || '').replace(/\s/g, '')}?text=${waMsg(o)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-success"
                          style={{ background: '#25D366', color: 'white', border: 'none' }}
                        >💬</a>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteOrder(o.id)}
                        >✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL DÉTAILS */}
      {selected && (
        <div className={styles.modalBg} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>Commande #{(selected.id || '').slice(-6).toUpperCase()}</h2>
              <button onClick={() => setSelected(null)} className={styles.closeBtn}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>🧕 Cliente</h3>
                <p><strong>{selected.client_name}</strong></p>
                <p>📞 {selected.client_phone}</p>
                <p>📍 {selected.client_zone} {selected.client_address ? `— ${selected.client_address}` : ''}</p>
              </div>

              <div className={styles.detailSection}>
                <h3>🛍️ Produits commandés</h3>
                {(selected.items || []).map((item, i) => (
                  <div key={i} className={styles.orderItem}>
                    <span>{item.emoji || '🧕'} {item.name}</span>
                    <span>x{item.quantity}</span>
                    <span style={{ fontWeight: 600, color: 'var(--orange)' }}>
                      {fmt((item.price || 0) * (item.quantity || 1))}
                    </span>
                  </div>
                ))}
                <div className={styles.orderTotal}>
                  <strong>Total : {fmt(selected.total)}</strong>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>💳 Paiement & Livraison</h3>
                <p>💳 {selected.payment_method}</p>
                <p>📦 Statut : <strong>{selected.status}</strong></p>
                {selected.note && <p>📝 {selected.note}</p>}
                <p style={{ fontSize: 11, color: 'var(--gray-mid)', marginTop: 8 }}>
                  Commandé le {fmtDate(selected.created_at)}
                </p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <a
                href={`https://wa.me/221${(selected.client_phone || '').replace(/\s/g, '')}?text=${encodeURIComponent(
                  `Bonjour ${selected.client_name} ! ✨\n\nVotre commande Porokhane Shop est confirmée !\n\n` +
                  (selected.items || []).map(i => `• ${i.name} x${i.quantity}`).join('\n') +
                  `\n\nTotal : ${fmt(selected.total)}\nMode : ${selected.payment_method}\n\nNous vous livrons bientôt ! 🚚`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success"
              >
                💬 Contacter sur WhatsApp
              </a>
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
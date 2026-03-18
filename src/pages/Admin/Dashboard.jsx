import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../supabase/client'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [stats, setStats]   = useState({ revenue:0, orders:0, newOrders:0, lowStock:0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [{ data: orders }, { data: products }] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('products').select('*')
      ])

      const o = orders || []
      const p = products || []

      const delivered  = o.filter(x => x.status === 'Livré')
      const revenue    = delivered.reduce((s, x) => s + (x.total||0), 0)
      const newOrders  = o.filter(x => x.status === 'Nouveau').length
      const lowStock   = p.filter(x => x.stock <= (x.alert_stock||3)).length

      setStats({ revenue, orders: o.length, newOrders, lowStock })
      setRecent(o.slice(0, 6))
    } catch { /* demo */ }
    finally { setLoading(false) }
  }

  // Écoute temps réel des nouvelles commandes
  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' },
        payload => {
          setRecent(prev => [payload.new, ...prev].slice(0, 6))
          setStats(prev => ({ ...prev, orders: prev.orders+1, newOrders: prev.newOrders+1 }))
        }
      ).subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const fmt = n => Number(n).toLocaleString('fr-SN') + ' FCFA'
  const fmtDate = ts => ts ? new Date(ts).toLocaleDateString('fr-FR', {day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '—'
  const STATUS = { Nouveau:'badge-new', 'En cours':'badge-progress', Livré:'badge-promo', Annulé:'badge-cancel' }

  if (loading) return <div className="spinner" style={{marginTop:60}} />

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Tableau de bord</h1>
        <span style={{fontSize:12,color:'var(--gray-mid)'}}>
          {new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
        </span>
      </div>

      {stats.newOrders > 0 && (
        <div className="alert alert-warning">
          📦 <strong>{stats.newOrders} nouvelle(s) commande(s)</strong> en attente.{' '}
          <Link to="/admin/commandes" style={{fontWeight:600,textDecoration:'underline'}}>Traiter →</Link>
        </div>
      )}
      {stats.lowStock > 0 && (
        <div className="alert alert-danger">
          ⚠️ <strong>{stats.lowStock} produit(s)</strong> en stock bas.{' '}
          <Link to="/admin/stock" style={{fontWeight:600,textDecoration:'underline'}}>Gérer →</Link>
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statOrange}`}>
          <div className={styles.statLabel}>Chiffre d'affaires</div>
          <div className={styles.statValue} style={{color:'var(--orange)'}}>{fmt(stats.revenue)}</div>
          <div className={styles.statSub}>Commandes livrées</div>
          <div className={styles.statIcon}>💰</div>
        </div>
        <div className={`${styles.statCard} ${styles.statBlue}`}>
          <div className={styles.statLabel}>Total Commandes</div>
          <div className={styles.statValue}>{stats.orders}</div>
          <div className={styles.statSub}>Toutes commandes</div>
          <div className={styles.statIcon}>📦</div>
        </div>
        <div className={`${styles.statCard} ${styles.statGreen}`}>
          <div className={styles.statLabel}>Nouvelles</div>
          <div className={styles.statValue} style={{color: stats.newOrders>0?'var(--success)':'inherit'}}>{stats.newOrders}</div>
          <div className={styles.statSub}>À traiter</div>
          <div className={styles.statIcon}>🆕</div>
        </div>
        <div className={`${styles.statCard} ${stats.lowStock>0?styles.statRed:styles.statGreen}`}>
          <div className={styles.statLabel}>Alertes stock</div>
          <div className={styles.statValue} style={{color:stats.lowStock>0?'var(--danger)':'var(--success)'}}>{stats.lowStock}</div>
          <div className={styles.statSub}>{stats.lowStock>0?'Stock bas !':'Tout est OK'}</div>
          <div className={styles.statIcon}>⚠️</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Commandes récentes</span>
          <Link to="/admin/commandes" style={{fontSize:12,color:'var(--orange)',fontWeight:500}}>Voir tout →</Link>
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Client</th><th>Produits</th><th>Montant</th><th>Paiement</th><th>Statut</th><th>Date</th></tr></thead>
            <tbody>
              {recent.length === 0 ? (
                <tr><td colSpan={6} style={{textAlign:'center',color:'var(--gray-mid)',padding:32}}>Aucune commande pour l'instant</td></tr>
              ) : recent.map(o => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.client_name}</strong>
                    <div style={{fontSize:11,color:'var(--gray-mid)'}}>{o.client_phone}</div>
                  </td>
                  <td style={{fontSize:12,maxWidth:180}}>
                    {(o.items||[]).map(i=>i.name).join(', ').substring(0,40)}...
                  </td>
                  <td style={{fontWeight:700,color:'var(--orange)'}}>{fmt(o.total)}</td>
                  <td style={{fontSize:12}}>{o.payment_method}</td>
                  <td><span className={`badge ${STATUS[o.status]||'badge-progress'}`}>{o.status}</span></td>
                  <td style={{fontSize:11,color:'var(--gray-mid)'}}>{fmtDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

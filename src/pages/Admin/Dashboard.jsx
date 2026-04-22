import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../supabase/client'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [stats, setStats]   = useState({ revenue:0, orders:0, newOrders:0, lowStock:0 })
  const [recent, setRecent] = useState([])
  const [top, setTop]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    const channel = supabase.channel('orders-live')
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'orders' },
        () => loadData())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const loadData = async () => {
    try {
      const [{ data: orders }, { data: products }] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(30),
        supabase.from('products').select('*')
      ])
      const o = orders || [], p = products || []
      const delivered = o.filter(x => x.status === 'Livré')
      setStats({
        revenue:   delivered.reduce((s,x) => s+(x.total||0), 0),
        orders:    o.length,
        newOrders: o.filter(x => x.status === 'Nouveau').length,
        lowStock:  p.filter(x => x.stock <= (x.alert_stock||3)).length
      })
      setRecent(o.slice(0, 5))
      setTop(p.sort((a,b) => (b.sales_count||0)-(a.sales_count||0)).slice(0, 5))
    } catch {}
    finally { setLoading(false) }
  }

  const fmt = n => Number(n||0).toLocaleString('fr-SN') + ' FCFA'
  const fmtDate = ts => ts ? new Date(ts).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'

  const STATUS_COLOR = { Nouveau:'#F59E0B', 'En cours':'#3B82F6', Livré:'#1DB954', Annulé:'#E74C3C' }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🛍️</div>
        <div style={{ color:'#606060', fontSize:13 }}>Chargement...</div>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      {/* ─── HEADER ─── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Bonjour 👋</h1>
          <p className={styles.subtitle}>
            {new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>
        {stats.newOrders > 0 && (
          <div className={styles.alertPill}>
            🔔 {stats.newOrders} nouvelle{stats.newOrders > 1 ? 's' : ''} commande{stats.newOrders > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* ─── STATS CARDS ─── */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statMain}`}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Chiffre d'affaires</span>
            <span className={styles.statEmoji}>💰</span>
          </div>
          <div className={styles.statValue}>{fmt(stats.revenue)}</div>
          <div className={styles.statBar}>
            <div className={styles.statBarFill} style={{ width:'70%' }} />
          </div>
          <div className={styles.statSub}>Commandes livrées</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Commandes</span>
            <span className={styles.statEmoji}>📦</span>
          </div>
          <div className={`${styles.statValue} ${styles.white}`}>{stats.orders}</div>
          <div className={styles.statSub}>Total</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Nouvelles</span>
            <span className={styles.statEmoji}>🆕</span>
          </div>
          <div className={`${styles.statValue} ${stats.newOrders > 0 ? styles.warn : styles.white}`}>
            {stats.newOrders}
          </div>
          <div className={styles.statSub}>À traiter</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Stock</span>
            <span className={styles.statEmoji}>📋</span>
          </div>
          <div className={`${styles.statValue} ${stats.lowStock > 0 ? styles.danger : styles.success}`}>
            {stats.lowStock > 0 ? `${stats.lowStock} alertes` : 'OK'}
          </div>
          <div className={styles.statSub}>{stats.lowStock > 0 ? 'À réapprovisionner' : 'Tout est bon'}</div>
        </div>
      </div>

      {/* ─── GRID CONTENU ─── */}
      <div className={styles.contentGrid}>

        {/* COMMANDES RÉCENTES */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Commandes récentes</h2>
            <Link to="/admin/commandes" className={styles.seeAll}>Voir tout →</Link>
          </div>
          <div className={styles.orderList}>
            {recent.length === 0 ? (
              <div className={styles.empty}>
                <span style={{ fontSize:32 }}>📦</span>
                <p>Aucune commande pour l'instant</p>
              </div>
            ) : recent.map(o => (
              <div key={o.id} className={styles.orderRow}>
                <div className={styles.orderAvatar}>
                  {o.client_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className={styles.orderInfo}>
                  <div className={styles.orderName}>{o.client_name}</div>
                  <div className={styles.orderMeta}>{o.client_phone} · {fmtDate(o.created_at)}</div>
                </div>
                <div className={styles.orderRight}>
                  <div className={styles.orderAmount}>{fmt(o.total)}</div>
                  <div className={styles.orderStatus} style={{ background: STATUS_COLOR[o.status] + '22', color: STATUS_COLOR[o.status] }}>
                    {o.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOP PRODUITS */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Top produits</h2>
            <Link to="/admin/produits" className={styles.seeAll}>Gérer →</Link>
          </div>
          <div className={styles.productList}>
            {top.map((p, i) => (
              <div key={p.id} className={styles.productRow}>
                <div className={styles.productRank} style={{ color: i < 3 ? '#F5A623' : '#404040' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                </div>
                <div className={styles.productImg}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:6 }} />
                    : <span style={{ fontSize:20 }}>{p.emoji || '🧕'}</span>
                  }
                </div>
                <div className={styles.productInfo}>
                  <div className={styles.productName}>{p.name}</div>
                  <div className={styles.productMeta}>{p.category} · {p.sales_count || 0} vendus</div>
                </div>
                <div className={styles.productPrice}>{fmt(p.price)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
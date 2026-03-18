import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabase/client'
import styles from './AdminSales.module.css'

export default function AdminSales() {
  const [orders, setOrders]     = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [period, setPeriod]     = useState('all')

  useEffect(() => {
    Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*')
    ]).then(([{ data: o }, { data: p }]) => {
      setOrders(o || [])
      setProducts(p || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filterByPeriod = list => {
    if (period === 'all') return list
    const days   = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const cutoff = new Date(Date.now() - days * 86400000)
    return list.filter(o => new Date(o.created_at) >= cutoff)
  }

  const periodOrders   = filterByPeriod(orders)
  const delivered      = periodOrders.filter(o => o.status === 'Livré')
  const revenue        = delivered.reduce((s,o) => s+(o.total||0), 0)
  const avgOrder       = delivered.length ? Math.round(revenue/delivered.length) : 0
  const conversionRate = periodOrders.length ? Math.round(delivered.length/periodOrders.length*100) : 0

  const byCategory = {}
  delivered.forEach(o => (o.items||[]).forEach(item => {
    const p   = products.find(x => x.id === item.product_id)
    const cat = p?.category || 'Autre'
    byCategory[cat] = (byCategory[cat]||0) + (item.price*item.quantity)
  }))

  const topProducts = {}
  delivered.forEach(o => (o.items||[]).forEach(item => {
    topProducts[item.product_id] = {
      name: item.name, emoji: item.emoji||'🧕',
      qty: (topProducts[item.product_id]?.qty||0) + item.quantity,
      rev: (topProducts[item.product_id]?.rev||0) + item.price*item.quantity,
    }
  }))
  const topList = Object.entries(topProducts).sort((a,b)=>b[1].qty-a[1].qty).slice(0,8)

  const byPayment = {}
  periodOrders.forEach(o => { byPayment[o.payment_method] = (byPayment[o.payment_method]||0)+1 })

  const last7 = Array.from({length:7},(_,i) => {
    const d  = new Date(); d.setDate(d.getDate()-(6-i))
    const ds = d.toDateString()
    const dayDel = delivered.filter(o => new Date(o.created_at).toDateString()===ds)
    return { label: d.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric'}), revenue: dayDel.reduce((s,o)=>s+(o.total||0),0), count: dayDel.length }
  })
  const maxDay = Math.max(...last7.map(d=>d.revenue),1)
  const maxCat = Math.max(...Object.values(byCategory),1)

  const fmt     = n => Number(n).toLocaleString('fr-SN')+' FCFA'
  const fmtDate = ts => ts ? new Date(ts).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}) : '—'

  if (loading) return <div className="spinner" style={{marginTop:60}} />

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Statistiques des Ventes</h1>
        <div className={styles.periodBtns}>
          {[['7d','7 jours'],['30d','30 jours'],['90d','3 mois'],['all','Tout']].map(([v,l]) => (
            <button key={v} className={`${styles.periodBtn} ${period===v?styles.active:''}`} onClick={()=>setPeriod(v)}>{l}</button>
          ))}
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <div className={`${styles.kpi} ${styles.kpiOr}`}>
          <div className={styles.kpiLabel}>Chiffre d'affaires</div>
          <div className={styles.kpiValue}>{fmt(revenue)}</div>
          <div className={styles.kpiSub}>{delivered.length} commandes livrées</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>Panier moyen</div>
          <div className={styles.kpiValue}>{fmt(avgOrder)}</div>
          <div className={styles.kpiSub}>Par commande</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>Taux de livraison</div>
          <div className={`${styles.kpiValue} ${styles.green}`}>{conversionRate}%</div>
          <div className={styles.kpiSub}>{periodOrders.length} commandes total</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.kpiLabel}>Annulées</div>
          <div className={`${styles.kpiValue} ${styles.red}`}>{periodOrders.filter(o=>o.status==='Annulé').length}</div>
          <div className={styles.kpiSub}>Sur la période</div>
        </div>
      </div>

      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><span className="card-title">Ventes des 7 derniers jours</span></div>
        <div className={styles.barChart}>
          {last7.map((d,i) => (
            <div key={i} className={styles.barWrap}>
              <span className={styles.barVal}>{d.revenue>0?Math.round(d.revenue/1000)+'k':''}</span>
              <div className={styles.bar} style={{height:`${Math.max(4,Math.round(d.revenue/maxDay*100))}%`}} title={fmt(d.revenue)} />
              <span className={styles.barLabel}>{d.label}</span>
              <span className={styles.barCount}>{d.count>0?`${d.count} cmd`:''}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.twoCol}>
        <div className="card">
          <div className="card-header"><span className="card-title">Ventes par catégorie</span></div>
          <div style={{padding:'16px 20px'}}>
            {Object.entries(byCategory).length===0
              ? <p style={{color:'var(--gray-mid)',fontSize:13}}>Aucune vente livrée.</p>
              : Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).map(([cat,val]) => (
                <div key={cat} className={styles.catRow}>
                  <div className={styles.catInfo}><strong>{cat}</strong><span>{fmt(val)}</span></div>
                  <div className={styles.catBar}><div style={{width:`${Math.round(val/maxCat*100)}%`}} /></div>
                </div>
              ))
            }
          </div>
        </div>
        <div>
          <div className="card">
            <div className="card-header"><span className="card-title">Modes de paiement</span></div>
            <div style={{padding:'8px 0'}}>
              {Object.entries(byPayment).sort((a,b)=>b[1]-a[1]).map(([pay,count]) => (
                <div key={pay} className={styles.payRow}>
                  <span>{pay}</span>
                  <div className={styles.payBar}><div style={{width:`${Math.round(count/periodOrders.length*100)}%`}} /></div>
                  <span className={styles.payCount}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop:20}}>
        <div className="card-header"><span className="card-title">Top Produits Vendus</span></div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>Produit</th><th>Qté vendue</th><th>Chiffre d'affaires</th></tr></thead>
            <tbody>
              {topList.length===0
                ? <tr><td colSpan={4} style={{textAlign:'center',color:'var(--gray-mid)',padding:24}}>Aucune vente livrée</td></tr>
                : topList.map(([id,p],i) => (
                  <tr key={id}>
                    <td style={{fontWeight:700,color:i<3?'var(--orange)':'var(--gray-mid)'}}> #{i+1}</td>
                    <td><span style={{marginRight:8}}>{p.emoji}</span><strong>{p.name}</strong></td>
                    <td style={{fontWeight:600}}>{p.qty} unités</td>
                    <td style={{fontWeight:700,color:'var(--orange)'}}>{fmt(p.rev)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

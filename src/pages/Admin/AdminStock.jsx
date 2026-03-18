import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabase/client'
import styles from './AdminStock.module.css'

export default function AdminStock() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('Tous')

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('stock', { ascending: true })
    setProducts(data || [])
    setLoading(false)
  }

  const filtered = products.filter(p => {
    if (filter === 'Critique')  return p.stock === 0
    if (filter === 'Bas')       return p.stock > 0 && p.stock <= (p.alert_stock||3)
    if (filter === 'Attention') return p.stock > (p.alert_stock||3) && p.stock <= (p.alert_stock||3)*2
    if (filter === 'OK')        return p.stock > (p.alert_stock||3)*2
    return true
  })

  const counts = {
    Tous:      products.length,
    Critique:  products.filter(p => p.stock === 0).length,
    Bas:       products.filter(p => p.stock > 0 && p.stock <= (p.alert_stock||3)).length,
    Attention: products.filter(p => p.stock > (p.alert_stock||3) && p.stock <= (p.alert_stock||3)*2).length,
    OK:        products.filter(p => p.stock > (p.alert_stock||3)*2).length,
  }

  const updateStock = async (id, newStock) => {
    if (newStock < 0) return
    await supabase.from('products').update({ stock: newStock, updated_at: new Date() }).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p))
  }

  const handleDelta    = (p, d) => updateStock(p.id, Math.max(0, p.stock + d))
  const handleSetStock = async p => {
    const val = window.prompt(`Nouveau stock pour "${p.name}" (actuel: ${p.stock}) :`)
    if (val === null) return
    const n = parseInt(val)
    if (isNaN(n) || n < 0) { alert('Valeur invalide'); return }
    await updateStock(p.id, n)
  }
  const updateAlert = async (id, v) => {
    await supabase.from('products').update({ alert_stock: Number(v) }).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, alert_stock: Number(v) } : p))
  }

  const getStatus = p => {
    if (p.stock === 0)                   return { label:'Rupture',   cls: styles.stockCritical }
    if (p.stock <= (p.alert_stock||3))   return { label:'Stock bas', cls: styles.stockLow }
    if (p.stock <= (p.alert_stock||3)*2) return { label:'Attention', cls: styles.stockWarn }
    return { label:'OK', cls: styles.stockOk }
  }

  const fmt        = n => Number(n).toLocaleString('fr-SN') + ' FCFA'
  const totalStock = products.reduce((s,p) => s+p.stock, 0)
  const totalValue = products.reduce((s,p) => s+p.stock*p.price, 0)

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Gestion du Stock</h1>
        <button className="btn btn-outline btn-sm" onClick={fetchProducts}>🔄 Actualiser</button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}><div className={styles.statLabel}>Total unités</div><div className={styles.statValue}>{totalStock}</div></div>
        <div className={styles.statCard}><div className={styles.statLabel}>Valeur du stock</div><div className={`${styles.statValue} ${styles.orange}`}>{fmt(totalValue)}</div></div>
        <div className={styles.statCard}><div className={styles.statLabel}>Ruptures</div><div className={`${styles.statValue} ${counts.Critique>0?styles.red:styles.green}`}>{counts.Critique}</div></div>
        <div className={styles.statCard}><div className={styles.statLabel}>Stock bas</div><div className={`${styles.statValue} ${counts.Bas>0?styles.warn:styles.green}`}>{counts.Bas}</div></div>
      </div>

      {counts.Critique>0 && <div className="alert alert-danger">🚨 <strong>{counts.Critique} produit(s) en rupture !</strong></div>}
      {counts.Bas>0      && <div className="alert alert-warning">⚠️ <strong>{counts.Bas} produit(s)</strong> avec un stock bas.</div>}

      <div className={styles.filterRow}>
        {Object.entries(counts).map(([key,count]) => (
          <button key={key} className={`${styles.filterBtn} ${filter===key?styles.filterActive:''}`} onClick={()=>setFilter(key)}>
            {key} <span className={styles.filterCount}>{count}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? <div className="spinner" /> : (
            <table>
              <thead><tr><th></th><th>Produit</th><th>Catégorie</th><th>Stock</th><th>Seuil</th><th>État</th><th>Valeur</th><th>Ajuster</th></tr></thead>
              <tbody>
                {filtered.map(p => {
                  const st = getStatus(p)
                  return (
                    <tr key={p.id}>
                      <td style={{fontSize:22,textAlign:'center',width:48}}>{p.emoji}</td>
                      <td><strong>{p.name}</strong><div style={{fontSize:11,color:'var(--gray-mid)'}}>{p.material}</div></td>
                      <td><span className="badge badge-progress" style={{fontSize:9}}>{p.category}</span></td>
                      <td><span className={`${styles.stockNum} ${p.stock===0?styles.stockNumCritical:p.stock<=(p.alert_stock||3)?styles.stockNumLow:p.stock<=(p.alert_stock||3)*2?styles.stockNumWarn:styles.stockNumOk}`}>{p.stock}</span></td>
                      <td><input type="number" min="1" max="50" value={p.alert_stock||3} onChange={e=>updateAlert(p.id,e.target.value)} className={styles.alertInput} /></td>
                      <td><span className={`${styles.statusBadge} ${st.cls}`}>{st.label}</span></td>
                      <td style={{fontSize:12,fontWeight:600,color:'var(--orange)'}}>{fmt(p.stock*p.price)}</td>
                      <td>
                        <div className={styles.adjustRow}>
                          <button className={styles.adjBtn} onClick={()=>handleDelta(p,-5)}>-5</button>
                          <button className={styles.adjBtn} onClick={()=>handleDelta(p,-1)}>-1</button>
                          <span className={styles.adjStock}>{p.stock}</span>
                          <button className={`${styles.adjBtn} ${styles.adjBtnPlus}`} onClick={()=>handleDelta(p,1)}>+1</button>
                          <button className={`${styles.adjBtn} ${styles.adjBtnPlus}`} onClick={()=>handleDelta(p,5)}>+5</button>
                          <button className={styles.setBtn} onClick={()=>handleSetStock(p)}>Définir</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

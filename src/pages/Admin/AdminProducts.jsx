import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabase/client'
import styles from './AdminProducts.module.css'

const CATS   = ['Pashmina','Jersey','Cashmere','Crêpe & Soie','Chiffon','Viscose','Accessoires']
const MATS   = ['Pashmina','Jersey','Cashmere','Crêpe','Soie','Chiffon','Viscose','Coton','—']
const BADGES = ['','Nouveau','Promo','Exclusif','Premium','Luxe']
const EMOJIS = ['🧕','🌸','🌺','🌙','🌟','✨','💜','👑','🍂','📿','🎀','💚','🌿','👜']

const emptyForm = { name:'', category:'Pashmina', material:'Pashmina', price:'', old_price:'', stock:'', alert_stock:'3', colors:'', badge:'', emoji:'🧕', description:'', active:true }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm]         = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving]     = useState(false)
  const [search, setSearch]     = useState('')
  const [filterCat, setFilterCat] = useState('Tous')

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  const filtered = products.filter(p => {
    const okSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase())
    const okCat    = filterCat === 'Tous' || p.category === filterCat
    return okSearch && okCat
  })

  const openAdd = () => {
    setEditingId(null); setForm(emptyForm); setImageFile(null); setImagePreview(''); setShowModal(true)
  }

  const openEdit = p => {
    setEditingId(p.id)
    setForm({ name:p.name, category:p.category, material:p.material||'', price:p.price, old_price:p.old_price||0, stock:p.stock, alert_stock:p.alert_stock||3, colors:p.colors||'', badge:p.badge||'', emoji:p.emoji||'🧕', description:p.description||'', active:p.active!==false })
    setImagePreview(p.image_url||'')
    setImageFile(null)
    setShowModal(true)
  }

  const handleImageChange = e => {
    const f = e.target.files[0]
    if (!f) return
    setImageFile(f)
    setImagePreview(URL.createObjectURL(f))
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) { alert('Nom, prix et stock sont obligatoires.'); return }
    setSaving(true)
    try {
      let image_url = imagePreview

      // Upload image dans Supabase Storage
      if (imageFile) {
        const ext  = imageFile.name.split('.').pop()
        const path = `products/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage.from('product-images').upload(path, imageFile)
        if (!uploadError) {
          const { data } = supabase.storage.from('product-images').getPublicUrl(path)
          image_url = data.publicUrl
        }
      }

      const data = {
        name:        form.name.trim(),
        category:    form.category,
        material:    form.material,
        price:       Number(form.price),
        old_price:   Number(form.old_price)||0,
        stock:       Number(form.stock),
        alert_stock: Number(form.alert_stock)||3,
        colors:      form.colors.trim(),
        badge:       form.badge,
        emoji:       form.emoji,
        description: form.description.trim(),
        active:      form.active,
        image_url,
        updated_at: new Date()
      }

      if (editingId) {
        await supabase.from('products').update(data).eq('id', editingId)
      } else {
        await supabase.from('products').insert({ ...data, sales_count: 0 })
      }

      setShowModal(false)
      fetchProducts()
    } catch (err) { alert('Erreur : '+err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async p => {
    if (!window.confirm(`Supprimer "${p.name}" ?`)) return
    await supabase.from('products').delete().eq('id', p.id)
    fetchProducts()
  }

  const toggleActive = async p => {
    await supabase.from('products').update({ active: !p.active }).eq('id', p.id)
    fetchProducts()
  }

  const fmt = n => Number(n).toLocaleString('fr-SN') + ' FCFA'

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Catalogue Produits</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Ajouter un produit</button>
      </div>

      <div className={styles.filters}>
        <input className="form-input" style={{maxWidth:260}} placeholder="🔍 Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} />
        <div className={styles.catFilters}>
          {['Tous',...CATS].map(c => (
            <button key={c} className={`btn btn-sm ${filterCat===c?'btn-dark':'btn-outline'}`} onClick={()=>setFilterCat(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">{filtered.length} produit(s)</span></div>
        <div className="table-wrapper">
          {loading ? <div className="spinner" /> : (
            <table>
              <thead><tr><th></th><th>Produit</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Visible</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{fontSize:24,textAlign:'center',width:50}}>
                      {p.image_url ? <img src={p.image_url} alt={p.name} style={{width:44,height:44,objectFit:'cover',borderRadius:4}} /> : p.emoji}
                    </td>
                    <td>
                      <strong>{p.name}</strong>
                      <div style={{fontSize:11,color:'var(--gray-mid)'}}>{p.material} · {p.colors}</div>
                    </td>
                    <td><span className="badge badge-progress">{p.category}</span></td>
                    <td style={{fontWeight:700,color:'var(--orange)'}}>
                      {fmt(p.price)}
                      {p.old_price>0 && <div style={{fontSize:11,textDecoration:'line-through',color:'var(--gray-mid)',fontWeight:400}}>{fmt(p.old_price)}</div>}
                    </td>
                    <td><span className={`badge ${p.stock<=(p.alert_stock||3)?'badge-cancel':'badge-stock-ok'}`}>{p.stock} unités</span></td>
                    <td>
                      <label className={styles.toggle}>
                        <input type="checkbox" checked={p.active!==false} onChange={()=>toggleActive(p)} />
                        <span className={styles.toggleSlider}></span>
                      </label>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline" onClick={()=>openEdit(p)} style={{marginRight:6}}>Modifier</button>
                      <button className="btn btn-sm btn-danger" onClick={()=>handleDelete(p)}>Suppr.</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className={styles.modalBg} onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>{editingId?'Modifier':'Nouveau produit'}</h2>
              <button onClick={()=>setShowModal(false)} className={styles.closeBtn}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className="form-group">
                <label className="form-label">Photo</label>
                <div className={styles.imageUpload}>
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" className={styles.imagePreview} />
                    : <div className={styles.imagePlaceholder}>{form.emoji}</div>
                  }
                  <label className="btn btn-outline btn-sm" style={{cursor:'pointer'}}>
                    📸 Choisir une photo
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{display:'none'}} />
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Nom *</label>
                <input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ex: Voile Pashmina Brodé" />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Catégorie</label>
                  <select className="form-select" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                    {CATS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Matière</label>
                  <select className="form-select" value={form.material} onChange={e=>setForm({...form,material:e.target.value})}>
                    {MATS.map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Prix (FCFA) *</label>
                  <input className="form-input" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="8500" />
                </div>
                <div className="form-group">
                  <label className="form-label">Prix barré (FCFA)</label>
                  <input className="form-input" type="number" value={form.old_price} onChange={e=>setForm({...form,old_price:e.target.value})} placeholder="0" />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Stock *</label>
                  <input className="form-input" type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} placeholder="10" />
                </div>
                <div className="form-group">
                  <label className="form-label">Alerte stock bas</label>
                  <input className="form-input" type="number" value={form.alert_stock} onChange={e=>setForm({...form,alert_stock:e.target.value})} placeholder="3" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Coloris</label>
                <input className="form-input" value={form.colors} onChange={e=>setForm({...form,colors:e.target.value})} placeholder="Noir · Beige · Bordeaux" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Badge</label>
                  <select className="form-select" value={form.badge} onChange={e=>setForm({...form,badge:e.target.value})}>
                    {BADGES.map(b=><option key={b} value={b}>{b||'— Aucun —'}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Emoji</label>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:4}}>
                    {EMOJIS.map(e=>(
                      <span key={e} onClick={()=>setForm({...form,emoji:e})}
                        style={{fontSize:22,cursor:'pointer',padding:4,borderRadius:4,border:form.emoji===e?'2px solid var(--orange)':'2px solid transparent'}}>
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className="btn btn-outline" onClick={()=>setShowModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving?'Sauvegarde...':editingId?'Enregistrer':'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

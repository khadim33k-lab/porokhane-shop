import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../supabase/client'
import { SHOP_CONFIG } from '../../lib/shopConfig'
import { splitOptionValues } from '../../lib/productOptions'
import styles from './AdminProducts.module.css'

const CATS   = ['Pashmina', 'Jersey', 'Cashmere', 'Crêpe & Soie', 'Chiffon', 'Viscose', 'Accessoires']
const MATS   = ['Pashmina', 'Jersey', 'Cashmere', 'Crêpe', 'Soie', 'Chiffon', 'Viscose', 'Coton', '—']
const BADGES = ['', 'Nouveau', 'Promo', 'Exclusif', 'Premium', 'Luxe']
const emptyForm = {
  name: '', category: 'Pashmina', material: 'Pashmina',
  price: '', old_price: '', stock: '', alert_stock: '3',
  colors: '', option_enabled: false, option_name: 'Taille', option_values: '',
  badge: '', emoji: '🧕', description: '', active: true
}

export default function AdminProducts() {
  const [products, setProducts]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [showModal, setShowModal]     = useState(false)
  const [editingId, setEditingId]     = useState(null)
  const [form, setForm]               = useState(emptyForm)
  const [imageFiles, setImageFiles]   = useState([])       // nouveaux fichiers à uploader
  const [existingImages, setExistingImages] = useState([]) // images déjà uploadées
  const [uploading, setUploading]     = useState(false)
  const [saving, setSaving]           = useState(false)
  const [search, setSearch]           = useState('')
  const [filterCat, setFilterCat]     = useState('Tous')
  const fileInputRef = useRef(null)

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  const filtered = products.filter(p => {
    const okSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase())
    const okCat    = filterCat === 'Tous' || p.category === filterCat
    return okSearch && okCat
  })

  // Ouvrir modal ajout
  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setImageFiles([])
    setExistingImages([])
    setShowModal(true)
  }

  // Ouvrir modal édition
  const openEdit = p => {
    setEditingId(p.id)
    setForm({
      name: p.name || '', category: p.category || 'Pashmina',
      material: p.material || '', price: p.price || '',
      old_price: p.old_price || 0, stock: p.stock || '',
      alert_stock: p.alert_stock || 3, colors: p.colors || '',
      option_enabled: p.option_enabled === true,
      option_name: p.option_name || 'Taille',
      option_values: p.option_values || '',
      badge: p.badge || '', emoji: p.emoji || '🧕',
      description: p.description || '', active: p.active !== false
    })
    // Récupérer toutes les images existantes
    const imgs = []
    if (p.image_url) imgs.push(p.image_url)
    if (p.images && Array.isArray(p.images)) imgs.push(...p.images.filter(i => i && i !== p.image_url))
    setExistingImages(imgs)
    setImageFiles([])
    setShowModal(true)
  }

  // Sélectionner plusieurs images
  const handleImagesChange = e => {
    const files = Array.from(e.target.files)
    setImageFiles(prev => [...prev, ...files].slice(0, 6)) // max 6 images
  }

  // Supprimer une image existante
  const removeExistingImage = idx => {
    setExistingImages(prev => prev.filter((_, i) => i !== idx))
  }

  // Supprimer une nouvelle image avant upload
  const removeNewImage = idx => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx))
  }

  // Upload une image dans Supabase Storage
  const uploadImage = async file => {
    const ext  = file.name.split('.').pop()
    const path = `products/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    return data.publicUrl
  }

  // Sauvegarder le produit
  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) {
      alert('Nom, prix et stock sont obligatoires.')
      return
    }
    const normalizedOptionValues = splitOptionValues(form.option_values)
    if (form.option_enabled && (!form.option_name.trim() || normalizedOptionValues.length === 0)) {
      alert('Indiquez le nom de l’option et au moins une valeur, par exemple : Taille — 18 · 20 · 22.')
      return
    }
    setSaving(true)
    setUploading(imageFiles.length > 0)

    try {
      // Uploader les nouvelles images
      const newUrls = []
      for (const file of imageFiles) {
        const url = await uploadImage(file)
        newUrls.push(url)
      }

      // Combiner images existantes + nouvelles
      const allImages = [...existingImages, ...newUrls]
      const mainImage = allImages[0] || ''

      const data = {
        name:        form.name.trim(),
        category:    form.category,
        material:    form.material,
        price:       Number(form.price),
        old_price:   Number(form.old_price) || 0,
        stock:       Number(form.stock),
        alert_stock: Number(form.alert_stock) || 3,
        colors:      form.colors.trim(),
        option_enabled: form.option_enabled,
        option_name: form.option_enabled ? form.option_name.trim() : null,
        option_values: form.option_enabled ? normalizedOptionValues.join(' · ') : null,
        badge:       form.badge,
        emoji:       form.emoji,
        description: form.description.trim(),
        active:      form.active,
        image_url:   mainImage,   // image principale
        images:      allImages,   // toutes les images
        updated_at:  new Date().toISOString()
      }

      let saveError
      if (editingId) {
        const { error } = await supabase.from('products').update(data).eq('id', editingId)
        saveError = error
      } else {
        const { error } = await supabase.from('products').insert({ ...data, sales_count: 0 })
        saveError = error
      }
      if (saveError) throw saveError

      setShowModal(false)
      fetchProducts()
    } catch (err) {
      alert('Erreur : ' + err.message)
    } finally {
      setSaving(false)
      setUploading(false)
    }
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

  const fmt = n => Number(n || 0).toLocaleString('fr-SN') + ' FCFA'

  // Images d'un produit (toutes)
  const getProductImages = p => {
    const imgs = []
    if (p.images && Array.isArray(p.images) && p.images.length > 0) return p.images.filter(Boolean)
    if (p.image_url) return [p.image_url]
    return imgs
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Catalogue produits</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Ajouter un produit</button>
      </div>

      {/* FILTRES */}
      <div className={styles.filters}>
        <input
          className="form-input"
          style={{ maxWidth: 260 }}
          placeholder="Rechercher un produit…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.catFilters}>
          {['Tous', ...CATS].map(c => (
            <button
              key={c}
              className={`btn btn-sm ${filterCat === c ? 'btn-dark' : 'btn-outline'}`}
              onClick={() => setFilterCat(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">{filtered.length} produit(s)</span>
        </div>
        <div className={`table-wrapper ${styles.desktopTable}`}>
          {loading ? <div className="spinner" /> : (
            <table>
              <thead>
                <tr><th>Photos</th><th>Produit</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Visible</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const imgs = getProductImages(p)
                  return (
                    <tr key={p.id}>
                      <td style={{ width: 100 }}>
                        <div className={styles.tableImageWrap}>
                          <img src={imgs[0] || SHOP_CONFIG.logo} alt={p.name} className={styles.tableImage} />
                          {imgs.length > 1 && <span className={styles.imageCount}>+{imgs.length - 1}</span>}
                        </div>
                      </td>
                      <td>
                        <strong>{p.name}</strong>
                        <div style={{ fontSize: 11, color: 'var(--gray-mid)' }}>
                          {p.material} · {p.colors}
                          {p.option_enabled && p.option_name && ` · ${p.option_name} : ${p.option_values}`}
                        </div>
                      </td>
                      <td><span className="badge badge-progress">{p.category}</span></td>
                      <td style={{ fontWeight: 700, color: 'var(--orange)' }}>
                        {fmt(p.price)}
                        {p.old_price > 0 && (
                          <div style={{ fontSize: 11, textDecoration: 'line-through', color: 'var(--gray-mid)', fontWeight: 400 }}>
                            {fmt(p.old_price)}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${p.stock <= (p.alert_stock || 3) ? 'badge-cancel' : 'badge-stock-ok'}`}>
                          {p.stock} unités
                        </span>
                      </td>
                      <td>
                        <label className={styles.toggle}>
                          <input type="checkbox" checked={p.active !== false} onChange={() => toggleActive(p)} />
                          <span className={styles.toggleSlider}></span>
                        </label>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)} style={{ marginRight: 6 }}>
                          Modifier
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p)}>
                          Suppr.
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
        {!loading && <div className={styles.mobileProducts}>
          {filtered.length===0 ? <div className={styles.mobileEmpty}>Aucun produit trouvé.</div> : filtered.map(p=>{const imgs=getProductImages(p);return <article className={styles.productCard} key={p.id}><div className={styles.productCardMain}><img src={imgs[0]||SHOP_CONFIG.logo} alt={p.name}/><div><span>{p.category}</span><h2>{p.name}</h2><p>{p.material||'Matière non renseignée'}</p><strong>{fmt(p.price)}</strong></div><label className={styles.toggle}><input type="checkbox" checked={p.active!==false} onChange={()=>toggleActive(p)}/><span className={styles.toggleSlider}/></label></div><div className={styles.productCardMeta}><span>{p.stock} en stock</span><span>{imgs.length} photo{imgs.length>1?'s':''}</span><span>{p.active!==false?'Visible':'Masqué'}</span></div><div className={styles.productCardActions}><button className="btn btn-sm btn-outline" onClick={()=>openEdit(p)}>Modifier</button><button className="btn btn-sm btn-danger" onClick={()=>handleDelete(p)}>Supprimer</button></div></article>})}
        </div>}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className={styles.modalBg} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>{editingId ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              <button onClick={() => setShowModal(false)} className={styles.closeBtn}>✕</button>
            </div>
            <div className={styles.modalBody}>

              {/* IMAGES MULTIPLES */}
              <div className="form-group">
                <label className="form-label">
                  Photos du produit
                  <span style={{ fontSize: 10, color: 'var(--gray-mid)', marginLeft: 6 }}>
                    ({existingImages.length + imageFiles.length}/6 max)
                  </span>
                </label>

                {/* Images existantes */}
                {existingImages.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                    {existingImages.map((img, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={img} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: i === 0 ? '2px solid var(--orange)' : '1px solid var(--border)' }} />
                        {i === 0 && (
                          <span style={{ position: 'absolute', top: 2, left: 2, background: 'var(--orange)', color: 'var(--black)', fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 2 }}>
                            PRINCIPALE
                          </span>
                        )}
                        <button
                          onClick={() => removeExistingImage(i)}
                          style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Nouvelles images à uploader */}
                {imageFiles.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                    {imageFiles.map((file, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt=""
                          style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px dashed var(--orange)', opacity: 0.8 }}
                        />
                        <span style={{ position: 'absolute', top: 2, left: 2, background: '#333', color: 'white', fontSize: 8, padding: '1px 4px', borderRadius: 2 }}>
                          NOUVEAU
                        </span>
                        <button
                          onClick={() => removeNewImage(i)}
                          style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '50%', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bouton ajouter images */}
                {(existingImages.length + imageFiles.length) < 6 && (
                  <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', display: 'inline-block' }}>
                    Ajouter des photos
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
                <p style={{ fontSize: 11, color: 'var(--gray-mid)', marginTop: 6 }}>
                  La 1ère photo est l'image principale. Max 6 photos.
                </p>
              </div>

              {/* INFOS PRODUIT */}
              <div className="form-group">
                <label className="form-label">Nom du produit *</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Voile Pashmina Brodé" />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Catégorie *</label>
                  <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Matière</label>
                  <select className="form-select" value={form.material} onChange={e => setForm({ ...form, material: e.target.value })}>
                    {MATS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Prix (FCFA) *</label>
                  <input className="form-input" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="8500" />
                </div>
                <div className="form-group">
                  <label className="form-label">Prix barré (FCFA)</label>
                  <input className="form-input" type="number" value={form.old_price} onChange={e => setForm({ ...form, old_price: e.target.value })} placeholder="0" />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Stock *</label>
                  <input className="form-input" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="10" />
                </div>
                <div className="form-group">
                  <label className="form-label">Alerte stock bas</label>
                  <input className="form-input" type="number" value={form.alert_stock} onChange={e => setForm({ ...form, alert_stock: e.target.value })} placeholder="3" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Coloris disponibles</label>
                <input className="form-input" value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} placeholder="Noir · Beige · Bordeaux · Rose" />
              </div>

              <section className={`${styles.optionPanel} ${form.option_enabled ? styles.optionPanelActive : ''}`}>
                <label className={styles.optionToggleRow}>
                  <span>
                    <strong>Ajouter une option au produit</strong>
                    <small>Activez uniquement si le client doit faire un choix.</small>
                  </span>
                  <span className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={form.option_enabled}
                      onChange={e => setForm({ ...form, option_enabled: e.target.checked })}
                    />
                    <span className={styles.toggleSlider}></span>
                  </span>
                </label>

                {form.option_enabled && (
                  <div className={styles.optionFields}>
                    <div className="form-group">
                      <label className="form-label">Nom de l’option *</label>
                      <input
                        className="form-input"
                        value={form.option_name}
                        onChange={e => setForm({ ...form, option_name: e.target.value })}
                        placeholder="Ex : Taille"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Choix proposés *</label>
                      <input
                        className="form-input"
                        value={form.option_values}
                        onChange={e => setForm({ ...form, option_values: e.target.value })}
                        placeholder="18 · 20 · 22"
                      />
                      <small className={styles.optionHelp}>Séparez les choix avec une virgule ou le signe ·</small>
                    </div>
                  </div>
                )}
              </section>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Décrivez ce voile..." />
              </div>

              <div className="form-group">
                <label className="form-label">Badge</label>
                <select className="form-select" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })}>
                  {BADGES.map(b => <option key={b} value={b}>{b || '— Aucun —'}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {uploading ? 'Importation des images…' : saving ? 'Sauvegarde…' : editingId ? 'Enregistrer' : 'Créer le produit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

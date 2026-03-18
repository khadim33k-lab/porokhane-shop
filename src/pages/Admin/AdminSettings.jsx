import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabase/client'
import styles from './AdminSettings.module.css'

export default function AdminSettings() {
  const { user } = useAuth()
  const [tab, setTab]   = useState('boutique')
  const [saved, setSaved] = useState(false)
  const [shop, setShop] = useState({
    name:'Porokhane Shop ✨', slogan:'Élégance, Pudeur et Classe en parfait symbiose !',
    phone:'78 536 34 25', whatsapp:'221785363425',
    address:'Guediawaye, Hamo4, Dakar', twitter:'@porokhaneshop',
    zones:'Dakar, Pikine, Guediawaye, Parcelles, Thiaroye',
  })
  const [pwd, setPwd]   = useState({ current:'', next:'', confirm:'' })
  const [pwdMsg, setPwdMsg] = useState({ type:'', text:'' })

  const saveShop = async () => {
    // Sauvegarde dans Supabase (table settings)
    await supabase.from('settings').upsert({ key:'shop', value: shop })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const changePassword = async () => {
    setPwdMsg({ type:'', text:'' })
    if (!pwd.next || !pwd.confirm) { setPwdMsg({ type:'error', text:'Remplissez tous les champs.' }); return }
    if (pwd.next !== pwd.confirm) { setPwdMsg({ type:'error', text:'Les mots de passe ne correspondent pas.' }); return }
    if (pwd.next.length < 6) { setPwdMsg({ type:'error', text:'Minimum 6 caractères.' }); return }
    const { error } = await supabase.auth.updateUser({ password: pwd.next })
    if (error) { setPwdMsg({ type:'error', text: error.message }); return }
    setPwdMsg({ type:'success', text:'✅ Mot de passe modifié !' })
    setPwd({ current:'', next:'', confirm:'' })
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}><h1 className={styles.pageTitle}>Paramètres</h1></div>

      <div className={styles.tabs}>
        {[['boutique','🛍️ Boutique'],['compte','🔐 Compte'],['livraison','🚚 Livraison'],['paiement','💳 Paiement']].map(([id,label]) => (
          <button key={id} className={`${styles.tab} ${tab===id?styles.tabActive:''}`} onClick={()=>setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'boutique' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Informations de la boutique</span></div>
          <div className="card-body">
            {saved && <div className="alert alert-success">✅ Informations sauvegardées !</div>}
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Nom</label><input className="form-input" value={shop.name} onChange={e=>setShop({...shop,name:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Slogan</label><input className="form-input" value={shop.slogan} onChange={e=>setShop({...shop,slogan:e.target.value})} /></div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Téléphone</label><input className="form-input" value={shop.phone} onChange={e=>setShop({...shop,phone:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">WhatsApp</label><input className="form-input" value={shop.whatsapp} onChange={e=>setShop({...shop,whatsapp:e.target.value})} /></div>
            </div>
            <div className="form-group"><label className="form-label">Adresse</label><input className="form-input" value={shop.address} onChange={e=>setShop({...shop,address:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Compte X (Twitter)</label><input className="form-input" value={shop.twitter} onChange={e=>setShop({...shop,twitter:e.target.value})} /></div>
            <button className="btn btn-primary" onClick={saveShop}>Enregistrer</button>
          </div>
        </div>
      )}

      {tab === 'compte' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Compte Admin</span></div>
          <div className="card-body">
            <div className={styles.accountInfo}>
              <div className={styles.accountAvatar}>👤</div>
              <div><strong>Administrateur</strong><p>{user?.email}</p></div>
            </div>
            <hr style={{border:'none',borderTop:'1px solid var(--border)',margin:'20px 0'}} />
            <h3 style={{fontFamily:'var(--font-serif)',marginBottom:16}}>Changer le mot de passe</h3>
            {pwdMsg.text && <div className={`alert ${pwdMsg.type==='success'?'alert-success':'alert-danger'}`}>{pwdMsg.text}</div>}
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Nouveau mot de passe</label><input className="form-input" type="password" value={pwd.next} onChange={e=>setPwd({...pwd,next:e.target.value})} placeholder="Min. 6 caractères" /></div>
              <div className="form-group"><label className="form-label">Confirmer</label><input className="form-input" type="password" value={pwd.confirm} onChange={e=>setPwd({...pwd,confirm:e.target.value})} placeholder="Répéter" /></div>
            </div>
            <button className="btn btn-dark" onClick={changePassword}>Modifier le mot de passe</button>
          </div>
        </div>
      )}

      {tab === 'livraison' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Zones de livraison</span></div>
          <div className="card-body">
            <div className="form-group"><label className="form-label">Zones desservies</label><textarea className="form-textarea" value={shop.zones} onChange={e=>setShop({...shop,zones:e.target.value})} rows={4} /></div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Frais de livraison (FCFA)</label><input className="form-input" type="number" defaultValue="1000" /></div>
              <div className="form-group"><label className="form-label">Livraison gratuite dès</label><input className="form-input" type="number" defaultValue="20000" /></div>
            </div>
            <button className="btn btn-primary" onClick={saveShop}>Enregistrer</button>
          </div>
        </div>
      )}

      {tab === 'paiement' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Modes de paiement</span></div>
          <div className="card-body">
            {[{name:'Wave',emoji:'💙'},{name:'Orange Money',emoji:'🟠'},{name:'Free Money',emoji:'🟢'},{name:'Espèces',emoji:'💵'}].map(pm => (
              <div key={pm.name} className={styles.paymentRow}>
                <div className={styles.paymentInfo}><span style={{fontSize:22}}>{pm.emoji}</span><strong>{pm.name}</strong></div>
                <input className="form-input" style={{maxWidth:180}} defaultValue={shop.phone} placeholder="Numéro de réception" />
                <label className={styles.toggleSwitch}><input type="checkbox" defaultChecked /><span className={styles.toggleSlider}></span><span style={{fontSize:12,marginLeft:8}}>Actif</span></label>
              </div>
            ))}
            <button className="btn btn-primary" style={{marginTop:20}} onClick={saveShop}>Enregistrer</button>
          </div>
        </div>
      )}
    </div>
  )
}

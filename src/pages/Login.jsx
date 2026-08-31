import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SHOP_CONFIG } from '../lib/shopConfig'
import styles from './Login.module.css'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/admin')
    } catch (err) {
      if (err?.message?.includes('Délai')) setError('La connexion prend trop de temps. Vérifiez Internet puis réessayez.')
      else if (err?.message?.includes('Accès refusé')) setError('Ce compte n’est pas autorisé à accéder à l’administration.')
      else setError('Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogo}>
          <div className={styles.logoIcon}><img src={SHOP_CONFIG.logo} alt="Logo Porokhane Shop" /></div>
          <h1 className={styles.logoName}>Porokhane Shop</h1>
          <p className={styles.logoSub}>Panneau Administrateur</p>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@porokhaneshop.sn" required />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input className="form-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className={styles.backLink}><a href="/" className={styles.link}>← Retour à la boutique</a></p>
      </div>
    </div>
  )
}

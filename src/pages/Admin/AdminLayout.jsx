import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './AdminLayout.module.css'

const NAV_ITEMS = [
  { path:'/admin',            label:'Accueil',       icon:'🏠', end:true },
  { path:'/admin/commandes',  label:'Commandes',     icon:'📦' },
  { path:'/admin/produits',   label:'Produits',      icon:'🧕' },
  { path:'/admin/stock',      label:'Stock',         icon:'📋' },
  { path:'/admin/ventes',     label:'Statistiques',  icon:'📈' },
  { path:'/admin/parametres', label:'Paramètres',    icon:'⚙️' },
]

const LOGO = 'https://fedznkkxobzgzsbybozb.supabase.co/storage/v1/object/public/product-images/Porokhane%20SHOP.png'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = async () => { await logout(); navigate('/login') }

  const SidebarContent = ({ onClose = () => {} }) => (
    <>
      {/* Logo */}
      <div className={styles.logoWrap}>
        <img src={LOGO} alt="Porokhane" className={styles.logoImg}
          onError={e => { e.target.style.display='none' }} />
        <div>
          <div className={styles.logoName}>Porokhane</div>
          <div className={styles.logoBadge}>ADMIN</div>
        </div>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        <p className={styles.navLabel}>Menu</p>
        {NAV_ITEMS.map(item => (
          <NavLink key={item.path} to={item.path} end={item.end}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={onClose}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className={styles.userSection}>
        <div className={styles.userAvatar}>
          {user?.email?.[0]?.toUpperCase() || 'A'}
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>Admin</div>
          <div className={styles.userEmail}>{user?.email}</div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout} title="Déconnexion">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </div>
    </>
  )

  return (
    <div className={styles.layout}>

      {/* ─── SIDEBAR DESKTOP ─── */}
      <aside className={styles.sidebar}>
        <SidebarContent />
      </aside>

      {/* ─── TOPBAR MOBILE ─── */}
      <div className={styles.mobileTopbar}>
        <div className={styles.mobileLeft}>
          <button className={styles.menuBtn} onClick={() => setDrawerOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <img src={LOGO} alt="" className={styles.mobileLogoImg}
            onError={e => e.target.style.display='none'} />
          <span className={styles.mobileTitle}>Admin</span>
        </div>
        <button className={styles.mobileLogout} onClick={handleLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </div>

      {/* ─── DRAWER MOBILE ─── */}
      {drawerOpen && <div className={styles.overlay} onClick={() => setDrawerOpen(false)} />}
      <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}>
        <SidebarContent onClose={() => setDrawerOpen(false)} />
      </div>

      {/* ─── CONTENU ─── */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
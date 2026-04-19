import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './AdminLayout.module.css'

const NAV_ITEMS = [
  { path:'/admin',            label:'Tableau de bord', icon:'📊', end:true },
  { path:'/admin/commandes',  label:'Commandes',       icon:'📦' },
  { path:'/admin/produits',   label:'Produits',        icon:'🧕' },
  { path:'/admin/stock',      label:'Stock',           icon:'📋' },
  { path:'/admin/ventes',     label:'Statistiques',    icon:'📈' },
  { path:'/admin/parametres', label:'Paramètres',      icon:'⚙️' },
]

export default function AdminLayout() {
  const { user, logout }         = useAuth()
  const navigate                 = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const NavContent = ({ onClose }) => (
    <>
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          onClick={onClose}
        >
          <span className={styles.navIcon}>{item.icon}</span>
          <span className={styles.navLabel}>{item.label}</span>
        </NavLink>
      ))}
    </>
  )

  return (
    <div className={styles.layout}>

      {/* ─── SIDEBAR DESKTOP ─── */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>🛍️</div>
            {!collapsed && (
              <div>
                <div className={styles.logoName}>Porokhane</div>
                <div className={styles.logoSub}>Admin Panel</div>
              </div>
            )}
          </div>
          <button className={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        <nav className={styles.nav}>
          {!collapsed && <div className={styles.navSection}>MENU</div>}
          <NavContent onClose={() => {}} />
        </nav>

        <div className={styles.sidebarFooter}>
          {!collapsed && (
            <div>
              <div className={styles.userEmail}>{user?.email}</div>
              <div className={styles.userRole}>Administrateur</div>
            </div>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            🚪{!collapsed && ' Déconnexion'}
          </button>
        </div>
      </aside>

      {/* ─── TOPBAR MOBILE ─── */}
      <div className={styles.mobileTopbar}>
        <div className={styles.mobileLogoWrap}>
          <div className={styles.mobileLogoIcon}>🛍️</div>
          <span className={styles.mobileLogoName}>Admin</span>
        </div>
        <button className={styles.hamburger} onClick={() => setDrawerOpen(true)}>☰</button>
      </div>

      {/* OVERLAY */}
      <div
        className={`${styles.mobileOverlay} ${drawerOpen ? styles.open : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* DRAWER MOBILE */}
      <div className={`${styles.mobileDrawer} ${drawerOpen ? styles.open : ''}`}>
        <div className={styles.drawerHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>🛍️</div>
            <div>
              <div className={styles.logoName}>Porokhane</div>
              <div className={styles.logoSub}>Admin Panel</div>
            </div>
          </div>
          <button className={styles.closeDrawer} onClick={() => setDrawerOpen(false)}>✕</button>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>MENU</div>
          <NavContent onClose={() => setDrawerOpen(false)} />
        </nav>

        <div className={styles.sidebarFooter}>
          <div>
            <div className={styles.userEmail}>{user?.email}</div>
            <div className={styles.userRole}>Administrateur</div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            🚪 Déconnexion
          </button>
        </div>
      </div>

      {/* ─── CONTENU PRINCIPAL ─── */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './AdminLayout.module.css'

const NAV_ITEMS = [
  { path: '/admin', label: 'Tableau de bord', icon: '📊', end: true },
  { path: '/admin/commandes', label: 'Commandes', icon: '📦' },
  { path: '/admin/produits', label: 'Produits', icon: '🧕' },
  { path: '/admin/stock', label: 'Stock', icon: '📋' },
  { path: '/admin/ventes', label: 'Statistiques', icon: '📈' },
  { path: '/admin/parametres', label: 'Paramètres', icon: '⚙️' },
]

function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className={styles.layout}>
      {/* SIDEBAR */}
      <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>🛍️</div>
            {sidebarOpen && (
              <div>
                <div className={styles.logoName}>Porokhane</div>
                <div className={styles.logoSub}>Admin Panel</div>
              </div>
            )}
          </div>
          <button className={styles.toggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>{sidebarOpen && 'MENU'}</div>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {sidebarOpen && <span className={styles.navLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          {sidebarOpen && (
            <div className={styles.userInfo}>
              <div className={styles.userEmail}>{user?.email}</div>
              <div className={styles.userRole}>Administrateur</div>
            </div>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout} title="Déconnexion">
            🚪{sidebarOpen && ' Déconnexion'}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout

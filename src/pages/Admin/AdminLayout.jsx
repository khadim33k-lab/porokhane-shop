import React, { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { SHOP_CONFIG } from '../../lib/shopConfig'
import { CloseIcon } from '../../components/icons/StoreIcons'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DashboardIcon,
  LogoutIcon,
  MenuIcon,
  OrdersIcon,
  ProductsIcon,
  SettingsIcon,
  StatsIcon,
  StockIcon
} from '../../components/icons/AdminIcons'
import styles from './AdminLayout.module.css'

const NAV_ITEMS = [
  { path:'/admin',            label:'Tableau de bord', icon:DashboardIcon, end:true },
  { path:'/admin/commandes',  label:'Commandes',       icon:OrdersIcon },
  { path:'/admin/produits',   label:'Produits',        icon:ProductsIcon },
  { path:'/admin/stock',      label:'Stock',           icon:StockIcon },
  { path:'/admin/ventes',     label:'Statistiques',    icon:StatsIcon },
  { path:'/admin/parametres', label:'Paramètres',      icon:SettingsIcon },
]

export default function AdminLayout() {
  const { user, logout }         = useAuth()
  const navigate                 = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    document.body.classList.add('admin-page')
    return () => document.body.classList.remove('admin-page')
  }, [])

  useEffect(() => {
    if (!drawerOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [drawerOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const NavContent = ({ onClose }) => (
    <>
      {NAV_ITEMS.map(item => {
        const ItemIcon = item.icon
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={onClose}
          >
            <span className={styles.navIcon}><ItemIcon size={19} /></span>
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        )
      })}
    </>
  )

  return (
    <div className={styles.layout}>

      {/* ─── SIDEBAR DESKTOP ─── */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <img className={styles.logoIcon} src={SHOP_CONFIG.logo} alt="Porokhane Shop" />
            {!collapsed && (
              <div>
                <div className={styles.logoName}>Porokhane Shop</div>
                <div className={styles.logoSub}>Espace administrateur</div>
              </div>
            )}
          </div>
          <button className={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Déployer le menu' : 'Réduire le menu'}>
            {collapsed ? <ChevronRightIcon size={16} /> : <ChevronLeftIcon size={16} />}
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
            <LogoutIcon size={17} />{!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ─── TOPBAR MOBILE ─── */}
      <div className={styles.mobileTopbar}>
        <div className={styles.mobileLogoWrap}>
          <img className={styles.mobileLogoIcon} src={SHOP_CONFIG.logo} alt="Porokhane Shop" />
          <div><span className={styles.mobileLogoName}>Porokhane Shop</span><small>Espace administrateur</small></div>
        </div>
        <button className={styles.hamburger} onClick={() => setDrawerOpen(true)} aria-label="Ouvrir le menu"><MenuIcon size={23} /></button>
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
            <img className={styles.logoIcon} src={SHOP_CONFIG.logo} alt="Porokhane Shop" />
            <div>
              <div className={styles.logoName}>Porokhane Shop</div>
              <div className={styles.logoSub}>Espace administrateur</div>
            </div>
          </div>
          <button className={styles.closeDrawer} onClick={() => setDrawerOpen(false)} aria-label="Fermer le menu"><CloseIcon size={22} /></button>
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
            <LogoutIcon size={17} /><span>Déconnexion</span>
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

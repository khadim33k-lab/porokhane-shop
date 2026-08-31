import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider }  from './context/CartContext'
import { AuthProvider, useAuth } from './context/AuthContext'

import Home           from './pages/Home'

const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const CartPage = lazy(() => import('./pages/CartPage'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Login = lazy(() => import('./pages/Login'))
const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout'))
const Dashboard = lazy(() => import('./pages/Admin/Dashboard'))
const AdminProducts = lazy(() => import('./pages/Admin/AdminProducts'))
const AdminOrders = lazy(() => import('./pages/Admin/AdminOrders'))
const AdminStock = lazy(() => import('./pages/Admin/AdminStock'))
const AdminSales = lazy(() => import('./pages/Admin/AdminSales'))
const AdminSettings = lazy(() => import('./pages/Admin/AdminSettings'))

function PageLoader({ compact = false }) {
  return (
    <div className={`page-loader ${compact ? 'page-loader-compact' : ''}`} role="status" aria-live="polite">
      <img src="/images/porokhane-logo.webp" alt="" aria-hidden="true" />
      <div><span>Porokhane Shop</span><small>Chargement en cours…</small></div>
    </div>
  )
}

// ✅ Fix #1 : vérifie user ET isAdmin
function ProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <PageLoader compact />
  if (!user || !isAdmin) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* ─── PUBLIC ─── */}
      <Route path="/"             element={<Home />} />
      <Route path="/produits"     element={<Products />} />
      <Route path="/produits/:id" element={<ProductDetail />} />
      <Route path="/panier"       element={<CartPage />} />
      <Route path="/commande"     element={<Checkout />} />
      <Route path="/login"        element={<Login />} />

      {/* ─── ADMIN PROTÉGÉ ─── */}
      <Route path="/admin" element={
        <ProtectedRoute><AdminLayout /></ProtectedRoute>
      }>
        <Route index          element={<Dashboard />} />
        <Route path="produits"   element={<AdminProducts />} />
        <Route path="commandes"  element={<AdminOrders />} />
        <Route path="stock"      element={<AdminStock />} />
        <Route path="ventes"     element={<AdminSales />} />
        <Route path="parametres" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

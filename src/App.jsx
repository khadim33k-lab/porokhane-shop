import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider }  from './context/CartContext'
import { AuthProvider, useAuth } from './context/AuthContext'

import Home           from './pages/Home'
import Products       from './pages/Products'
import ProductDetail  from './pages/ProductDetail'
import CartPage       from './pages/CartPage'
import Checkout       from './pages/Checkout'
import Login          from './pages/Login'

import AdminLayout    from './pages/Admin/AdminLayout'
import Dashboard      from './pages/Admin/Dashboard'
import AdminProducts  from './pages/Admin/AdminProducts'
import AdminOrders    from './pages/Admin/AdminOrders'
import AdminStock     from './pages/Admin/AdminStock'
import AdminSales     from './pages/Admin/AdminSales'
import AdminSettings  from './pages/Admin/AdminSettings'

// ✅ Fix #1 : vérifie user ET isAdmin
function ProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />
  if (!user || !isAdmin) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
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
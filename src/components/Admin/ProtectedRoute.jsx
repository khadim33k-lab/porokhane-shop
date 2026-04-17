import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// ✅ Fix #1 : vérifie isAdmin et pas seulement user
export default function ProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />

  // Pas connecté → page login
  if (!user) return <Navigate to="/login" replace />

  // Connecté mais pas admin → page d'accueil (sans message d'erreur visible)
  if (!isAdmin) return <Navigate to="/" replace />

  return children
}
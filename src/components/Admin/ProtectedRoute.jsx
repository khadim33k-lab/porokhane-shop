import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Vérifie user ET isAdmin — double sécurité
export default function ProtectedRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />

  // Pas connecté → login
  if (!user) return <Navigate to="/login" replace />

  // Connecté mais pas admin → accueil (sans message visible)
  if (!isAdmin) return <Navigate to="/" replace />

  return children
}
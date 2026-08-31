import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase/client'
import { withTimeout } from '../lib/async'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  // Vérifier si l'utilisateur est dans la table admins
  const checkAdmin = async (userId) => {
    if (!userId) { setIsAdmin(false); return false }
    let timeout
    try {
      const controller = new AbortController()
      timeout = window.setTimeout(() => controller.abort(), 6500)
      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', userId)
        .single()
        .abortSignal(controller.signal)
      const allowed = !error && !!data
      setIsAdmin(allowed)
      return allowed
    } catch {
      setIsAdmin(false)
      return false
    } finally {
      window.clearTimeout(timeout)
    }
  }

  useEffect(() => {
    let mounted = true
    const restoreSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        setUser(session?.user ?? null)
        if (session?.user?.id) await checkAdmin(session.user.id)
        else setIsAdmin(false)
      } catch {
        if (mounted) { setUser(null); setIsAdmin(false) }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    restoreSession()

    // Écouter les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return
        setUser(session?.user ?? null)
        setLoading(false)
        if (!session?.user?.id) {
          setIsAdmin(false)
          return
        }

        // Ne jamais attendre une requête Supabase dans onAuthStateChange :
        // cela peut bloquer signInWithPassword. La vérification est différée.
        window.setTimeout(() => {
          if (mounted) checkAdmin(session.user.id)
        }, 0)
      }
    )
    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  const login = async (email, password) => {
    const { data, error } = await withTimeout(
      supabase.auth.signInWithPassword({ email: email.trim(), password }),
      12000
    )
    if (error) throw error

    const adminAllowed = await checkAdmin(data.user.id)

    if (!adminAllowed) {
      await supabase.auth.signOut()
      throw new Error('Accès refusé. Compte non autorisé.')
    }

    setUser(data.user)
    setIsAdmin(true)
    return data
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être dans AuthProvider')
  return ctx
}

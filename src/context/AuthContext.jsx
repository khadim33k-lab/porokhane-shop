import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  // Vérifier si l'utilisateur est dans la table admins
  const checkAdmin = async (userId) => {
    if (!userId) { setIsAdmin(false); return }
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', userId)
        .single()
      setIsAdmin(!error && !!data)
    } catch {
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    // Vérifier la session au démarrage
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      await checkAdmin(session?.user?.id)
      setLoading(false)
    }).catch(() => setLoading(false))

    // Écouter les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        await checkAdmin(session?.user?.id)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    // Vérifier que c'est bien un admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', data.user.id)
      .single()

    if (!adminData) {
      await supabase.auth.signOut()
      throw new Error('Accès refusé. Compte non autorisé.')
    }

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
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être dans AuthProvider')
  return ctx
}
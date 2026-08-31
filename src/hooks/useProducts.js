import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase/client'

const CACHE_KEY = 'porokhane:products:v1'

export const getCachedProducts = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
    return Array.isArray(cached?.products) ? cached.products : []
  } catch { return [] }
}

export const cacheProducts = products => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ products, savedAt: Date.now() })) } catch {}
}

export function useProducts(filters = {}) {
  const initialProducts = getCachedProducts()
  const [products, setProducts] = useState(initialProducts)
  const [loading, setLoading] = useState(initialProducts.length === 0)
  const [error, setError] = useState(null)

  const fetchProducts = async () => {
    if (products.length === 0) setLoading(true)
    setError(null)
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 8000)
    try {
      const { data, error: requestError } = await supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false }).abortSignal(controller.signal)
      if (requestError) throw requestError
      const next = Array.isArray(data) ? data : []
      setProducts(next)
      cacheProducts(next)
    } catch (requestError) {
      setError(requestError?.name === 'AbortError' ? 'La connexion prend trop de temps. Les derniers produits restent affichés.' : 'Impossible d’actualiser les produits pour le moment.')
    } finally {
      window.clearTimeout(timeout)
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const visible = useMemo(() => products.filter(product => {
    if (filters.category && product.category !== filters.category) return false
    if (filters.material && product.material !== filters.material) return false
    return true
  }), [products, filters.category, filters.material])

  return { products: visible, loading, error, refetch: fetchProducts }
}

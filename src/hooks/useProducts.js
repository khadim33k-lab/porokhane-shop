import { useState, useEffect } from 'react'
import { supabase } from '../supabase/client'

// Données de démo si Supabase pas encore configuré
const DEMO = [
  { id:'1', name:'Voile Pashmina Uni',     category:'Pashmina',    material:'Pashmina', price:8500,  old_price:0,     stock:12, colors:'Beige · Noir · Bordeaux · Rose', badge:'Nouveau',  emoji:'🧕', bg_color:'#FFF6E8', active:true },
  { id:'2', name:'Pashmina Brodé Floral',  category:'Pashmina',    material:'Pashmina', price:11000, old_price:0,     stock:8,  colors:'Rose · Ivoire · Vert Amande',    badge:'Exclusif', emoji:'🌸', bg_color:'#FFF0F5', active:true },
  { id:'3', name:'Pashmina Long Premium',  category:'Pashmina',    material:'Pashmina', price:9000,  old_price:13000, stock:5,  colors:'Camel · Gris · Marine · Noir',   badge:'Promo',    emoji:'🌺', bg_color:'#FFF4EC', active:true },
  { id:'4', name:'Voile Jersey Léger',     category:'Jersey',      material:'Jersey',   price:5500,  old_price:0,     stock:20, colors:'Blanc · Noir · Gris · Nude',     badge:'',         emoji:'✨', bg_color:'#F8FFF0', active:true },
  { id:'5', name:'Jersey Stretch Doux',    category:'Jersey',      material:'Jersey',   price:6000,  old_price:0,     stock:15, colors:'Vert Sage · Bleu Ciel · Taupe',  badge:'Nouveau',  emoji:'💚', bg_color:'#F0FFF4', active:true },
  { id:'6', name:'Voile Cashmere Doux',    category:'Cashmere',    material:'Cashmere', price:15000, old_price:0,     stock:6,  colors:'Camel · Noir · Crème',           badge:'Premium',  emoji:'👑', bg_color:'#FFFAEF', active:true },
  { id:'7', name:'Cashmere Oversize',      category:'Cashmere',    material:'Cashmere', price:13000, old_price:18000, stock:4,  colors:'Rouille · Beige · Gris Perle',   badge:'Promo',    emoji:'🍂', bg_color:'#FFF5E8', active:true },
  { id:'8', name:'Voile Crêpe Satiné',     category:'Crêpe & Soie',material:'Crêpe',   price:9500,  old_price:0,     stock:10, colors:'Mauve · Or · Ivoire · Blush',    badge:'',         emoji:'🌙', bg_color:'#F5F0FF', active:true },
  { id:'9', name:'Hijab Soie Naturelle',   category:'Crêpe & Soie',material:'Soie',    price:12000, old_price:0,     stock:7,  colors:'Champagne · Bleu Nuit · Rose',   badge:'Luxe',     emoji:'🌟', bg_color:'#FFFFF0', active:true },
  { id:'10',name:'Voile Chiffon Floral',   category:'Crêpe & Soie',material:'Chiffon', price:7500,  old_price:0,     stock:12, colors:'Jaune · Blanc · Corail · Vert',  badge:'Nouveau',  emoji:'🌻', bg_color:'#FFFBF0', active:true },
  { id:'11',name:'Épingles Hijab (lot 6)', category:'Accessoires', material:'—',        price:2500,  old_price:0,     stock:30, colors:'Doré · Argenté · Rosé',         badge:'',         emoji:'📿', bg_color:'#F0F5FF', active:true },
  { id:'12',name:'Bonnet Sous-Hijab',      category:'Accessoires', material:'Coton',    price:3000,  old_price:0,     stock:18, colors:'Noir · Blanc · Gris · Nude',     badge:'',         emoji:'🎀', bg_color:'#FFF0F8', active:true },
]

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [filters.category, filters.material])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (filters.category) query = query.eq('category', filters.category)
      if (filters.material)  query = query.eq('material',  filters.material)

      const { data, error } = await query
      if (error) throw error
      setProducts(data?.length > 0 ? data : DEMO)
    } catch {
      // Supabase pas configuré → données demo
      setProducts(DEMO)
    } finally {
      setLoading(false)
    }
  }

  return { products, loading, error, refetch: fetchProducts }
}

export { DEMO }

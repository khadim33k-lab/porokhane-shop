import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { productMatchesUniverse, SHOP_UNIVERSES } from '../lib/catalog'
import { SHOP_CONFIG } from '../lib/shopConfig'
import Navbar from '../components/Navbar/Navbar'
import ProductCard from '../components/Product/ProductCard'
import { FilterIcon, SearchIcon } from '../components/icons/StoreIcons'
import Footer from '../components/Footer'
import styles from './Products.module.css'

const MATERIALS  = ['Toutes','Pashmina','Cashmere','Jersey','Crêpe','Soie','Chiffon','Viscose','Coton']
const SORTS      = [{value:'new',label:'Nouveautés'},{value:'price-asc',label:'Prix croissant'},{value:'price-desc',label:'Prix décroissant'},{value:'promo',label:'Promotions'}]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtered, setFiltered] = useState([])
  const { products, loading, error, refetch } = useProducts()
  const requestedCategory = searchParams.get('cat')
  const [activeCat, setActiveCat] = useState(SHOP_UNIVERSES.includes(requestedCategory) ? requestedCategory : 'Tous')
  const [activeMat, setActiveMat] = useState('Toutes')
  const [sort, setSort]           = useState('new')
  const [priceMin, setPriceMin]   = useState('')
  const [priceMax, setPriceMax]   = useState('')
  const [search, setSearch]       = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setActiveCat(SHOP_UNIVERSES.includes(requestedCategory) ? requestedCategory : 'Tous')
  }, [requestedCategory])

  useEffect(() => {
    let res = [...products]
    if (activeCat !== 'Tous')    res = res.filter(p => productMatchesUniverse(p, activeCat))
    if (activeMat !== 'Toutes')  res = res.filter(p => p.material === activeMat)
    if (search.trim())           res = res.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.material?.toLowerCase().includes(search.toLowerCase()))
    if (priceMin) res = res.filter(p => p.price >= Number(priceMin))
    if (priceMax) res = res.filter(p => p.price <= Number(priceMax))
    if (sort === 'price-asc')  res.sort((a,b) => a.price-b.price)
    if (sort === 'price-desc') res.sort((a,b) => b.price-a.price)
    if (sort === 'promo')      res = res.filter(p=>p.old_price>0).concat(res.filter(p=>!p.old_price))
    setFiltered(res)
  }, [products, activeCat, activeMat, sort, priceMin, priceMax, search])

  const handleCat = cat => { setActiveCat(cat); setSearchParams(cat !== 'Tous' ? { cat } : {}) }
  const resetFilters = () => { setActiveCat('Tous'); setActiveMat('Toutes'); setSort('new'); setPriceMin(''); setPriceMax(''); setSearch(''); setSearchParams({}) }

  return (
    <>
      <Navbar />
      <div className={styles.pageHeader}>
        <div className="container">
          <p className={styles.pageEyebrow}>Porokhane Shop</p>
          <h1 className={styles.pageTitle}>La boutique</h1>
          <p className={styles.pageSlogan}>{SHOP_CONFIG.slogan}</p>
        </div>
      </div>
      <div className={`container ${styles.layout}`}>
        <aside className={`${styles.sidebar} ${showFilters ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHead}>
            <span className={styles.sidebarTitle}>Filtres</span>
            <button className={styles.resetBtn} onClick={resetFilters}>Réinitialiser</button>
          </div>
          <div className={styles.filterBlock}>
            <p className={styles.filterLabel}>Recherche</p>
            <input className="form-input" placeholder="Nom, matière..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div className={styles.filterBlock}>
            <p className={styles.filterLabel}>Catégorie</p>
            {SHOP_UNIVERSES.map(cat => (
              <label key={cat} className={styles.radioRow}>
                <input type="radio" name="cat" checked={activeCat===cat} onChange={()=>handleCat(cat)} />
                <span>{cat}</span>
                <span className={styles.filterCount}>{cat==='Tous'?products.length:products.filter(p=>productMatchesUniverse(p,cat)).length}</span>
              </label>
            ))}
          </div>
          <div className={styles.filterBlock}>
            <p className={styles.filterLabel}>Matière</p>
            {MATERIALS.map(mat => (
              <label key={mat} className={styles.radioRow}>
                <input type="radio" name="mat" checked={activeMat===mat} onChange={()=>setActiveMat(mat)} />
                <span>{mat}</span>
              </label>
            ))}
          </div>
          <div className={styles.filterBlock}>
            <p className={styles.filterLabel}>Prix (FCFA)</p>
            <div className={styles.priceInputs}>
              <input className="form-input" type="number" placeholder="Min" value={priceMin} onChange={e=>setPriceMin(e.target.value)} />
              <span>—</span>
              <input className="form-input" type="number" placeholder="Max" value={priceMax} onChange={e=>setPriceMax(e.target.value)} />
            </div>
          </div>
        </aside>
        <div className={styles.main}>
          <div className={styles.topBar}>
            <div className={styles.catPills}>
              {SHOP_UNIVERSES.map(cat => (
                <button key={cat} className={`${styles.catPill} ${activeCat===cat?styles.active:''}`} onClick={()=>handleCat(cat)}>{cat}</button>
              ))}
            </div>
            <div className={styles.topBarRight}>
              <span className={styles.resultCount}>{filtered.length} article{filtered.length>1?'s':''}</span>
              <select className="form-select" style={{width:160}} value={sort} onChange={e=>setSort(e.target.value)}>
                {SORTS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <button className={`btn btn-outline btn-sm ${styles.filterToggle}`} onClick={()=>setShowFilters(!showFilters)}>
                {showFilters ? 'Fermer' : <><FilterIcon size={15} /> Filtres</>}
              </button>
            </div>
          </div>
          {error && products.length > 0 && <div className="alert alert-warning">{error} <button className={styles.retryLink} onClick={refetch}>Réessayer</button></div>}
          {loading ? <div className="spinner" style={{marginTop:60}} /> : (
            filtered.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}><SearchIcon size={30} /></div>
                <h3>{error && products.length === 0 ? 'Connexion momentanément indisponible' : 'Aucun produit trouvé'}</h3>
                <p>{error && products.length === 0 ? <button className={styles.resetLink} onClick={refetch}>Actualiser la boutique</button> : <>Essayez d'autres filtres ou <button className={styles.resetLink} onClick={resetFilters}>réinitialisez</button></>}</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

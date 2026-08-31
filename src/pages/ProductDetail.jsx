import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { cacheProducts, getCachedProducts } from '../hooks/useProducts'
import { useCart } from '../context/CartContext'
import { getProductUniverse } from '../lib/catalog'
import { getProductOption } from '../lib/productOptions'
import { SHOP_CONFIG } from '../lib/shopConfig'
import Navbar from '../components/Navbar/Navbar'
import ProductCard from '../components/Product/ProductCard'
import WhatsAppIcon from '../components/icons/WhatsAppIcon'
import { CashIcon, PhoneIcon, TruckIcon } from '../components/icons/StoreIcons'
import Footer from '../components/Footer'
import styles from './ProductDetail.module.css'

export default function ProductDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()

  const [product, setProduct]     = useState(null)
  const [related, setRelated]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [currentImg, setCurrentImg] = useState(0)
  const [added, setAdded]         = useState(false)
  const [colorError, setColorError] = useState(false)
  const universe = getProductUniverse(product || {})

  // Chaque ligne conserve sa quantité, son coloris et son option éventuelle.
  const [colorLines, setColorLines] = useState([{ qty: 1, color: '', optionValue: '' }])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    const cachedProducts = getCachedProducts()
    const cachedProduct = cachedProducts.find(p => String(p.id) === String(id))
    if (cachedProduct) {
      setProduct(cachedProduct)
      setRelated(cachedProducts.filter(p => p.category === cachedProduct.category && p.id !== cachedProduct.id).slice(0, 4))
      setLoading(false)
    } else {
      setProduct(null)
      setRelated([])
      setLoading(true)
    }
    setLoadError(false)
    setColorLines([{ qty: 1, color: '', optionValue: '' }])
    setColorError(false)
    setCurrentImg(0)
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 8000)
    try {
      const { data, error } = await supabase
        .from('products').select('*').eq('id', id).single().abortSignal(controller.signal)
      if (error || !data) throw error || new Error('Produit introuvable')
      setProduct(data)
      cacheProducts([data, ...cachedProducts.filter(p => p.id !== data.id)])
      setLoading(false)
      const { data: rel } = await supabase.from('products').select('*').eq('category', data.category).eq('active', true).neq('id', id).limit(4)
      setRelated(rel || [])
    } catch {
      if (!cachedProduct) setLoadError(true)
    } finally {
      window.clearTimeout(timeout)
      setLoading(false)
    }
  }

  const getAllImages = () => {
    if (!product) return []
    const imgs = []
    if (product.images && Array.isArray(product.images)) imgs.push(...product.images.filter(Boolean))
    if (product.image_url && !imgs.includes(product.image_url)) imgs.unshift(product.image_url)
    return imgs
  }

  const allImages = getAllImages()
  const colors = product?.colors
    ? product.colors.split(/[·,;]+/).map(c => c.trim()).filter(Boolean)
    : []
  const hasColors  = colors.length > 0
  const productOption = getProductOption(product || {})
  const hasOption = productOption.enabled
  const totalQty   = colorLines.reduce((s, l) => s + l.qty, 0)

  const fmt = n => Number(n || 0).toLocaleString('fr-SN') + ' FCFA'
  const discount = product?.old_price > 0
    ? Math.round((1 - product.price / product.old_price) * 100) : 0

  // ─── Gérer les lignes de couleur ───
  const addColorLine = () => {
    if (totalQty >= (product?.stock || 99)) return
    setColorLines(prev => [...prev, { qty: 1, color: '', optionValue: '' }])
  }

  const removeColorLine = idx => {
    if (colorLines.length === 1) return
    setColorLines(prev => prev.filter((_, i) => i !== idx))
  }

  const updateLineColor = (idx, color) => {
    setColorLines(prev => prev.map((l, i) => i === idx ? { ...l, color } : l))
    setColorError(false)
  }

  const updateLineOption = (idx, optionValue) => {
    setColorLines(prev => prev.map((line, i) => i === idx ? { ...line, optionValue } : line))
    setColorError(false)
  }

  const updateLineQty = (idx, delta) => {
    setColorLines(prev => prev.map((l, i) => {
      if (i !== idx) return l
      const newQty = Math.max(1, l.qty + delta)
      return { ...l, qty: newQty }
    }))
  }

  // ─── Validation ───
  const validate = () => {
    if (!hasColors && !hasOption) return true
    return colorLines.every(line =>
      (!hasColors || line.color !== '') &&
      (!hasOption || line.optionValue !== '')
    )
  }

  // ─── Ajouter au panier ───
  const handleAddToCart = () => {
    if (!validate()) {
      setColorError(true)
      document.getElementById('color-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    // Ajouter chaque ligne séparément dans le panier
    colorLines.forEach(line => {
      addToCart(
        product,
        line.qty,
        line.color,
        hasOption ? { name: productOption.name, value: line.optionValue } : null
      )
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  // ─── WhatsApp ───
  const handleWhatsApp = () => {
    if (!validate()) {
      setColorError(true)
      document.getElementById('color-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    const detail = colorLines
      .map(line => {
        const choices = [
          line.color && `Coloris : ${line.color}`,
          hasOption && `${productOption.name} : ${line.optionValue}`
        ].filter(Boolean).join(' · ')
        return `• ${product.name} x${line.qty}${choices ? ` — ${choices}` : ''}`
      })
      .join('\n')
    const total = fmt(product.price * totalQty)
    const msg = `Bonjour Porokhane Shop ✨ !\n\nJe voudrais commander :\n${detail}\n\nTotal : ${total} (${totalQty} pièce${totalQty > 1 ? 's' : ''})\n\nMerci !`
    window.open(`https://wa.me/221785363425?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (loading) return <><Navbar /><div className="spinner" style={{ marginTop: 80 }} /></>
  if (loadError && !product) return <><Navbar /><main className={styles.loadError}><img src={SHOP_CONFIG.logo} alt="" /><h1>Produit momentanément indisponible</h1><p>La connexion n'a pas permis de charger cet article.</p><button className="btn btn-primary" onClick={fetchProduct}>Réessayer</button><Link to="/produits">Retour à la boutique</Link></main><Footer /></>
  if (!product) return null

  return (
    <>
      <Navbar />

      <div className={`container ${styles.breadcrumb}`}>
        <Link to="/">Accueil</Link><span>›</span>
        <Link to="/produits">Collection</Link><span>›</span>
        <Link to={`/produits?cat=${encodeURIComponent(universe)}`}>{universe}</Link><span>›</span>
        <span>{product.name}</span>
      </div>

      <div className={`container ${styles.productSection}`}>

        {/* ─── GALERIE ─── */}
        <div className={styles.imageBlock}>
          <div className={styles.mainImage} style={{ background: allImages.length === 0 ? (product.bg_color || '#FFF6E8') : '#F5F5F5' }}>
            {allImages.length > 0 ? (
              <img src={allImages[currentImg]} alt={product.name} className={styles.productImage} />
            ) : (
              <img src={SHOP_CONFIG.logo} alt="Logo Porokhane Shop" className={styles.productLogo} />
            )}
            {discount > 0 && <span className={styles.discountBadge}>-{discount}%</span>}
            {allImages.length > 1 && (
              <>
                <button className={styles.imgPrev} onClick={() => setCurrentImg(i => (i - 1 + allImages.length) % allImages.length)}>‹</button>
                <button className={styles.imgNext} onClick={() => setCurrentImg(i => (i + 1) % allImages.length)}>›</button>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className={styles.thumbs}>
              {allImages.map((img, i) => (
                <div key={i} className={`${styles.thumb} ${currentImg === i ? styles.thumbActive : ''}`} onClick={() => setCurrentImg(i)}>
                  <img src={img} alt={`vue ${i + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── INFOS ─── */}
        <div className={styles.infoBlock}>
          <div className={styles.productHeader}>
            <span className={styles.category}>{universe}</span>
            {product.badge && <span className={`badge badge-${product.badge === 'Promo' ? 'promo' : 'new'}`}>{product.badge}</span>}
          </div>

          <h1 className={styles.productName}>{product.name}</h1>
          <p className={styles.productMaterial}>{product.material} · {product.colors}</p>

          <div className={styles.priceBlock}>
            <span className={styles.price}>{fmt(product.price)}</span>
            {product.old_price > 0 && (
              <>
                <span className={styles.oldPrice}>{fmt(product.old_price)}</span>
                <span className={styles.savings}>Économisez {fmt(product.old_price - product.price)}</span>
              </>
            )}
          </div>

          {product.description && <p className={styles.description}>{product.description}</p>}

          {/* ─── SÉLECTION DES CARACTÉRISTIQUES PAR PIÈCE ─── */}
          {(hasColors || hasOption) && (
            <div id="color-section" className={`${styles.colorsBlock} ${colorError ? styles.colorsError : ''}`}>
              <div className={styles.colorsHeader}>
                <p className={styles.colorsTitle}>
                  {hasColors && hasOption
                    ? 'Personnalisez votre sélection'
                    : hasColors
                      ? 'Choisissez vos coloris'
                      : `Choisissez : ${productOption.name}`}
                  <span className={styles.required}>*</span>
                </p>
                <span className={styles.totalPieces}>
                  {totalQty} pièce{totalQty > 1 ? 's' : ''} — {fmt(product.price * totalQty)}
                </span>
              </div>

              {colorError && (
                <div className={styles.colorErrorMsg}>
                  Veuillez compléter chaque choix obligatoire avant de continuer.
                </div>
              )}

              {/* LIGNES DE COULEUR */}
              <div className={styles.colorLines}>
                {colorLines.map((line, idx) => {
                  const lineComplete = (!hasColors || line.color) && (!hasOption || line.optionValue)
                  return (
                  <div key={idx} className={`${styles.colorLine} ${lineComplete ? styles.colorLineDone : ''}`}>
                    {/* Numéro de ligne */}
                    <div className={styles.lineNum}>
                      {lineComplete ? '✓' : idx + 1}
                    </div>

                    {/* Sélecteurs de caractéristiques */}
                    <div className={styles.lineColors}>
                      {hasColors && (
                        <div className={styles.choiceGroup}>
                          <p className={styles.lineLabel}>
                            {line.color
                              ? <span style={{ color: 'var(--success)', fontWeight: 700 }}>Coloris : {line.color}</span>
                              : <span style={{ color: 'var(--danger)' }}>Choisir un coloris</span>
                            }
                          </p>
                          <div className={styles.colorBtns}>
                            {colors.map(color => (
                              <button
                                type="button"
                                key={color}
                                className={`${styles.colorBtn} ${line.color === color ? styles.colorSelected : ''}`}
                                onClick={() => updateLineColor(idx, color)}
                              >
                                {line.color === color && '✓ '}{color}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {hasOption && (
                        <div className={styles.choiceGroup}>
                          <p className={styles.lineLabel}>
                            {line.optionValue
                              ? <span style={{ color: 'var(--success)', fontWeight: 700 }}>{productOption.name} : {line.optionValue}</span>
                              : <span style={{ color: 'var(--danger)' }}>Choisir : {productOption.name}</span>
                            }
                          </p>
                          <div className={styles.colorBtns}>
                            {productOption.values.map(value => (
                              <button
                                type="button"
                                key={value}
                                className={`${styles.colorBtn} ${line.optionValue === value ? styles.colorSelected : ''}`}
                                onClick={() => updateLineOption(idx, value)}
                              >
                                {line.optionValue === value && '✓ '}{value}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quantité pour cette couleur */}
                    <div className={styles.lineQty}>
                      <button type="button" className={styles.qtyBtn} onClick={() => updateLineQty(idx, -1)}>−</button>
                      <span className={styles.qtyNum}>{line.qty}</span>
                      <button type="button" className={styles.qtyBtn} onClick={() => updateLineQty(idx, 1)}>+</button>
                    </div>

                    {/* Supprimer la ligne */}
                    {colorLines.length > 1 && (
                      <button type="button" className={styles.removeLine} onClick={() => removeColorLine(idx)} title="Supprimer">✕</button>
                    )}
                  </div>
                  )
                })}
              </div>

              {/* AJOUTER UNE AUTRE COULEUR */}
              {totalQty < (product.stock || 99) && (
                <button type="button" className={styles.addColorLine} onClick={addColorLine}>
                  + Ajouter une autre variante
                </button>
              )}

              {/* RÉCAPITULATIF */}
              {colorLines.some(line => line.color || line.optionValue) && (
                <div className={styles.recap}>
                  <p className={styles.recapTitle}>Récapitulatif de votre commande</p>
                  {colorLines.map((line, i) => (line.color || line.optionValue) && (
                    <div key={i} className={styles.recapLine}>
                      <span>• {[line.color, line.optionValue && `${productOption.name} ${line.optionValue}`].filter(Boolean).join(' · ')}</span>
                      <span>x{line.qty} pièce{line.qty > 1 ? 's' : ''}</span>
                      <span style={{ color: 'var(--orange)', fontWeight: 600 }}>{fmt(product.price * line.qty)}</span>
                    </div>
                  ))}
                  <div className={styles.recapTotal}>
                    <span>Total</span>
                    <span>{fmt(product.price * totalQty)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STOCK */}
          <div className={styles.stockRow}>
            {(product.stock || 0) > 0
              ? <span className={styles.inStock}>✓ {product.stock} en stock</span>
              : <span className={styles.outStock}>✗ Rupture de stock</span>
            }
          </div>

          {/* BOUTONS */}
          <div className={styles.actions}>
            <button
              className={`btn btn-primary btn-lg ${styles.addBtn} ${added ? styles.addedBtn : ''}`}
              onClick={handleAddToCart}
              disabled={(product.stock || 0) === 0}
            >
              {added
                ? `✓ ${totalQty} pièce${totalQty > 1 ? 's' : ''} ajoutée${totalQty > 1 ? 's' : ''} !`
                : `+ Ajouter au panier (${totalQty} pièce${totalQty > 1 ? 's' : ''})`
              }
            </button>
            <button className={`btn btn-lg ${styles.waBtn}`} onClick={handleWhatsApp}>
              <WhatsAppIcon size={20} /> Commander sur WhatsApp
            </button>
          </div>

          {/* INFOS LIVRAISON */}
          <div className={styles.deliveryInfo}>
            <div className={styles.deliveryItem}>
              <div className={styles.deliveryIcon}><TruckIcon size={22} /></div>
              <div><strong>Livraison rapide</strong><p>Dakar, Pikine, Guédiawaye, Parcelles et Thiaroye</p></div>
            </div>
            <div className={styles.deliveryItem}>
              <div className={styles.deliveryIcon}><CashIcon size={22} /></div>
              <div><strong>Paiement à la livraison</strong><p>Réglez votre commande lors de sa réception</p></div>
            </div>
            <div className={styles.deliveryItem}>
              <div className={styles.deliveryIcon}><PhoneIcon size={22} /></div>
              <div><strong>Contact direct</strong><p>78 536 34 25 · @porokhaneshop</p></div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className={`container ${styles.related}`}>
          <h2 className={styles.relatedTitle}>Vous aimerez aussi</h2>
          <div className={styles.relatedGrid}>
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <Footer />
    </>
  )
}

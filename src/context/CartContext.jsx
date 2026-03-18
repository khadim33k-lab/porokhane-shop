import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('porokhane_cart') || '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('porokhane_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product, quantity = 1, color = '') => {
    setCartItems(prev => {
      const key = `${product.id}_${color}`
      const existing = prev.find(i => i.key === key)
      if (existing) return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + quantity } : i)
      return [...prev, { ...product, quantity, color, key }]
    })
  }

  const removeFromCart = (key) => setCartItems(prev => prev.filter(i => i.key !== key))

  const updateQuantity = (key, quantity) => {
    if (quantity <= 0) { removeFromCart(key); return }
    setCartItems(prev => prev.map(i => i.key === key ? { ...i, quantity } : i))
  }

  const clearCart = () => setCartItems([])

  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)

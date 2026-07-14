import { createContext, useContext, useState, useMemo } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ecommerce_cart') || '[]')
    } catch {
      return []
    }
  })

  const saveCart = (items) => {
    setCartItems(items)
    localStorage.setItem('ecommerce_cart', JSON.stringify(items))
  }

  const addToCart = (product, qty = 1) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i._id === product._id)
      let updated
      if (exists) {
        updated = prev.map((i) =>
          i._id === product._id
            ? { ...i, qty: Math.min(i.qty + qty, product.countInStock) }
            : i
        )
      } else {
        updated = [
          ...prev,
          {
            _id: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            countInStock: product.countInStock,
            qty,
          },
        ]
      }
      localStorage.setItem('ecommerce_cart', JSON.stringify(updated))
      return updated
    })
  }

  const removeFromCart = (id) => {
    setCartItems((prev) => {
      const updated = prev.filter((i) => i._id !== id)
      localStorage.setItem('ecommerce_cart', JSON.stringify(updated))
      return updated
    })
  }

  const updateQty = (id, qty) => {
    setCartItems((prev) => {
      const updated = prev.map((i) => (i._id === id ? { ...i, qty } : i))
      localStorage.setItem('ecommerce_cart', JSON.stringify(updated))
      return updated
    })
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('ecommerce_cart')
  }

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.price * i.qty, 0),
    [cartItems]
  )

  const cartCount = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.qty, 0),
    [cartItems]
  )

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

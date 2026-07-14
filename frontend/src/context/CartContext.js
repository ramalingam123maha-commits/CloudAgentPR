import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) { setItems([]); return; }
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setItems(data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    const { data } = await api.post('/cart', { productId, quantity });
    setItems(data.items || []);
    return data;
  }, []);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity < 1) return;
    const { data } = await api.put(`/cart/${productId}`, { quantity });
    setItems(data.items || []);
    return data;
  }, []);

  const removeFromCart = useCallback(async (productId) => {
    const { data } = await api.delete(`/cart/${productId}`);
    setItems(data.items || []);
    return data;
  }, []);

  const clearCart = useCallback(async () => {
    await api.delete('/cart');
    setItems([]);
  }, []);

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [items]
  );

  const cartTotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (item.product?.price || item.price || 0) * (item.quantity || 0),
        0
      ),
    [items]
  );

  const value = {
    items,
    loading,
    cartCount,
    cartTotal,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}

export default CartContext;

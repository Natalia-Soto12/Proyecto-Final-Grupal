import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({});

  const fetchCart = async () => {
    // Optionally implement fetching cart from backend if persisted
  };

  const addToCart = async (codigo, cantidad) => {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, cantidad }),
      });
      const data = await response.json();
      if (response.ok) {
        setCart(prev => ({ ...prev, [codigo]: { producto: codigo, cantidad } }));
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const removeFromCart = async (codigo) => {
    try {
      const response = await fetch(`/api/cart/${codigo}`, { method: 'DELETE' });
      const data = await response.json();
      if (response.ok) {
        setCart(prev => {
          const newCart = { ...prev };
          delete newCart[codigo];
          return newCart;
        });
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart', { method: 'DELETE' });
      const data = await response.json();
      if (response.ok) {
        setCart({});
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

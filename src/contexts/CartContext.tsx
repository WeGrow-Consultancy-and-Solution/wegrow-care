import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  serviceId: string;
  title: string;
  price: number; // in cents
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (serviceId: string, title: string, price: number) => void;
  removeFromCart: (serviceId: string) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  isInCart: (serviceId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('careatease-cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('careatease-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (serviceId: string, title: string, price: number) => {
    setItems(prev => {
      const existing = prev.find(item => item.serviceId === serviceId);
      if (existing) {
        return prev.map(item =>
          item.serviceId === serviceId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { serviceId, title, price, quantity: 1 }];
    });
  };

  const removeFromCart = (serviceId: string) => {
    setItems(prev => prev.filter(item => item.serviceId !== serviceId));
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(serviceId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.serviceId === serviceId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const getTotal = () => items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getItemCount = () => items.reduce((sum, item) => sum + item.quantity, 0);

  const isInCart = (serviceId: string) => items.some(item => item.serviceId === serviceId);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, getTotal, getItemCount, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

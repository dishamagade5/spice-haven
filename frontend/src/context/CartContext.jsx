import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'spicehaven_cart';

function readStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => readStoredCart());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // storage unavailable — keep in-memory cart only
    }
  }, [cartItems]);

  const addToCart = (item) => {
    if (!item || item.available === false) return;
    const id = item.id ?? item.name;
    setCartItems((prev) => {
      const existing = prev.find((row) => String(row.id) === String(id));
      if (existing) {
        return prev.map((row) =>
          String(row.id) === String(id)
            ? { ...row, quantity: row.quantity + 1, subtotal: (row.quantity + 1) * row.price }
            : row
        );
      }
      const price = Number(item.price) || 0;
      return [
        ...prev,
        {
          id,
          name: item.name,
          description: item.description || '',
          category: item.category || '',
          subcategory: item.subcategory || '',
          price,
          image: item.image || '',
          quantity: 1,
          subtotal: price,
        },
      ];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((row) => String(row.id) !== String(itemId)));
  };

  const increaseQuantity = (itemId) => {
    setCartItems((prev) =>
      prev.map((row) =>
        String(row.id) === String(itemId)
          ? { ...row, quantity: row.quantity + 1, subtotal: (row.quantity + 1) * row.price }
          : row
      )
    );
  };

  const decreaseQuantity = (itemId) => {
    setCartItems((prev) =>
      prev.map((row) => {
        if (String(row.id) !== String(itemId)) return row;
        const nextQty = Math.max(1, row.quantity - 1);
        return { ...row, quantity: nextQty, subtotal: nextQty * row.price };
      })
    );
  };

  const clearCart = () => setCartItems([]);

  const value = useMemo(() => {
    const cartCount = cartItems.reduce((sum, row) => sum + (row.quantity || 0), 0);
    const cartTotal = cartItems.reduce((sum, row) => sum + (row.subtotal ?? row.price * row.quantity), 0);
    return {
      cartItems,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      cartCount,
      cartTotal,
    };
  }, [cartItems]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

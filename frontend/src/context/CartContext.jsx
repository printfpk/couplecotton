import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('couplecotton_cart');
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse cart from local storage', e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('couplecotton_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const toggleCart = (open) => {
    setIsCartOpen(open !== undefined ? open : !isCartOpen);
  };

  const addToCart = (product, quantity = 1, size = null, color = null) => {
    setCartItems(prev => {
      // Find if same item (id + size + color) already in cart
      const existingIndex = prev.findIndex(item => 
        item.productId === (product._id || product.slug) &&
        item.size === size &&
        item.color?.name === color?.name
      );

      if (existingIndex >= 0) {
        const newItems = [...prev];
        newItems[existingIndex].quantity += quantity;
        return newItems;
      }

      // Add new item
      return [...prev, {
        id: Math.random().toString(36).substring(2, 9), // unique cart item id
        productId: product._id || product.slug,
        title: product.title,
        slug: product.slug,
        price: product.price?.finalPrice ?? product.price?.amount ?? 0,
        originalPrice: product.price?.discountPercentage > 0 ? product.price?.amount : null,
        image: product.images?.[0]?.url || product.images?.[0] || '',
        quantity,
        size,
        color
      }];
    });
    
    setIsCartOpen(true); // Open drawer on add
  };

  const updateQuantity = (cartItemId, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === cartItemId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      toggleCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([
    { id: '1', name: 'Milano Slim Blazer', category: 'jackets', price: 890000, sizes: ["S","M","L","XL"], emoji: '🕴️', description: 'Classic slim fit blazer for a sharp look.', sale: 0 },
    { id: '2', name: 'Navy Structured Jacket', category: 'jackets', price: 750000, sizes: ["S","M","L","XL"], emoji: '🧥', description: 'Comfortable structured jacket for everyday elegance.', sale: 15 },
    { id: '3', name: 'Signature Polo White', category: 'polos', price: 320000, sizes: ["S","M","L","XL"], emoji: '👕', description: 'Premium white polo with signature detailing.', sale: 0 },
    { id: '4', name: 'Chocolate Trim Polo', category: 'polos', price: 340000, sizes: ["S","M","L","XL"], emoji: '👕', description: 'Rich chocolate colored polo with contrast trim.', sale: 0 },
    { id: '5', name: 'Classic Knit Polo', category: 'polos', price: 290000, sizes: ["S","M","L","XL"], emoji: '🧶', description: 'Comfortable knit polo perfect for smart casual.', sale: 10 },
    { id: '6', name: 'Tailored Chino Navy', category: 'pants', price: 480000, sizes: ["S","M","L","XL"], emoji: '👖', description: 'Classic navy chinos tailored for a perfect fit.', sale: 0 },
    { id: '7', name: 'Smart Casual Trousers', category: 'pants', price: 520000, sizes: ["S","M","L","XL"], emoji: '👖', description: 'Versatile trousers that can be dressed up or down.', sale: 0 },
    { id: '8', name: 'Linen Blend Pants', category: 'pants', price: 440000, sizes: ["S","M","L","XL"], emoji: '🌴', description: 'Lightweight linen blend pants for warm weather.', sale: 20 },
  ]);

  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [saleActive, setSaleActive] = useState(false);
  const [salePercent, setSalePercent] = useState(15);
  const [saleMessage, setSaleMessage] = useState('Flash Sale');
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  const getProductPrice = (product) => {
    if (saleActive) {
      return product.price * (1 - salePercent / 100);
    }
    if (product.sale > 0) {
      return product.price * (1 - product.sale / 100);
    }
    return product.price;
  };

  const addToCart = (product, size) => {
    setCart([...cart, { cartId: Date.now().toString(), product, selectedSize: size, finalPrice: getProductPrice(product) }]);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const clearCart = () => setCart([]);

  const addOrder = (order) => setOrders([order, ...orders]); // prepend new orders

  return (
    <AppContext.Provider value={{
      products, setProducts,
      cart, addToCart, removeFromCart, clearCart,
      orders, addOrder, setOrders,
      saleActive, setSaleActive,
      salePercent, setSalePercent,
      saleMessage, setSaleMessage,
      adminLoggedIn, setAdminLoggedIn,
      getProductPrice
    }}>
      {children}
    </AppContext.Provider>
  );
};

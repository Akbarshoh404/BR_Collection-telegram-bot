import React, { createContext, useState, useEffect } from 'react';
import productsData from '../data/products.json';
import categoriesData from '../data/categories.json';
import usersData from '../data/users.json';
import { telegram } from '../utils/telegram';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState(productsData);
  const [categories, setCategories] = useState(categoriesData);
  const [users, setUsers] = useState(usersData);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  
  const [saleActive, setSaleActive] = useState(false);
  const [salePercent, setSalePercent] = useState(15);
  const [saleMessage, setSaleMessage] = useState('Flash Sale: 15% Off everything!');
  
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const tgUser = telegram?.initDataUnsafe?.user;
    if (tgUser) {
      const existingUser = users.find(u => u.telegramId === tgUser.username || u.telegramId === tgUser.id?.toString());
      if (existingUser) {
        setCurrentUser(existingUser);
      } else {
        const newUser = {
          id: 'u_' + Date.now(),
          telegramId: tgUser.username || tgUser.id?.toString() || 'guest',
          firstName: tgUser.first_name || 'Guest',
          lastName: tgUser.last_name || '',
          joinedAt: new Date().toISOString(),
          totalSpent: 0,
          isAdmin: false
        };
        setCurrentUser(newUser);
        setUsers([...users, newUser]);
      }
    } else {
      setCurrentUser(users[0]);
    }
  }, []);

  const getProductPrice = (product) => {
    if (saleActive) return product.price * (1 - salePercent / 100);
    if (product.sale > 0) return product.price * (1 - product.sale / 100);
    return product.price;
  };

  const addToCart = (product, size, qty = 1) => {
    setCart([...cart, { cartId: Date.now().toString(), product, selectedSize: size, qty, finalPrice: getProductPrice(product) * qty }]);
  };

  const removeFromCart = (cartId) => setCart(cart.filter(item => item.cartId !== cartId));
  const clearCart = () => setCart([]);

  const toggleFavorite = (productId) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId));
    } else {
      setFavorites([...favorites, productId]);
    }
  };

  const addOrder = (order) => {
    setOrders([order, ...orders]);
    
    const newProducts = [...products];
    order.items.forEach(item => {
      const pIndex = newProducts.findIndex(p => p.id === item.product.id);
      if (pIndex > -1) {
        newProducts[pIndex] = { ...newProducts[pIndex], stock: Math.max(0, newProducts[pIndex].stock - item.qty) };
      }
    });
    setProducts(newProducts);
    
    if(currentUser) {
      const updatedUser = {...currentUser, totalSpent: currentUser.totalSpent + order.total};
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    }
  };

  const becomeAdmin = () => {
    if(currentUser) {
      const updatedUser = {...currentUser, isAdmin: true};
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    }
  };

  return (
    <AppContext.Provider value={{
      products, setProducts,
      categories, setCategories,
      users, setUsers, currentUser, setCurrentUser, becomeAdmin,
      cart, addToCart, removeFromCart, clearCart,
      orders, addOrder, setOrders,
      favorites, toggleFavorite,
      saleActive, setSaleActive,
      salePercent, setSalePercent,
      saleMessage, setSaleMessage,
      hasSeenOnboarding, setHasSeenOnboarding,
      getProductPrice
    }}>
      {children}
    </AppContext.Provider>
  );
};

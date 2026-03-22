import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { telegram } from './utils/telegram';

import HomeScreen from './screens/HomeScreen';
import DetailScreen from './screens/DetailScreen';
import CartScreen from './screens/CartScreen';
import ConfirmScreen from './screens/ConfirmScreen';
import AdminScreen from './screens/AdminScreen';
import OrdersScreen from './screens/OrdersScreen';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/product/:id" element={<DetailScreen />} />
        <Route path="/cart" element={<CartScreen />} />
        <Route path="/confirm/:id" element={<ConfirmScreen />} />
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="/admin/orders" element={<OrdersScreen />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  useEffect(() => {
    // Initialize telegram web app
    if (telegram) {
      telegram.ready?.();
      telegram.expand?.();
    }
  }, []);

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-background relative shadow-[0_0_20px_rgba(0,0,0,0.05)] border-x border-border overflow-hidden">
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;

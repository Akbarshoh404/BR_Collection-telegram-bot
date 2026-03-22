import React, { useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { telegram } from './utils/telegram';
import { AppContext } from './context/AppContext';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import OnboardingScreen from './screens/OnboardingScreen';
import MainLayout from './screens/MainLayout';
import HomeScreen from './screens/HomeScreen';
import DetailScreen from './screens/DetailScreen';
import CartScreen from './screens/CartScreen';
import ConfirmScreen from './screens/ConfirmScreen';
import AdminScreen from './screens/AdminScreen';
import OrdersScreen from './screens/OrdersScreen';
import ProfileScreen from './screens/ProfileScreen';
import WishlistScreen from './screens/WishlistScreen';
import UserOrdersScreen from './screens/UserOrdersScreen';

const AnimatedRoutes = () => {
  const location = useLocation();
  const { hasSeenOnboarding } = useContext(AppContext);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={hasSeenOnboarding ? <Navigate to="/home" /> : <OnboardingScreen />} />
        
        {/* Main layout with bottom nav */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/wishlist" element={<WishlistScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/product/:id" element={<DetailScreen />} />
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/user-orders" element={<UserOrdersScreen />} />
        </Route>

        {/* Routes without bottom nav */}
        <Route path="/confirm/:id" element={<ConfirmScreen />} />
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="/admin/orders" element={<OrdersScreen />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  useEffect(() => {
    if (telegram) {
      telegram.ready?.();
      telegram.expand?.();
    }
  }, []);

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-background relative shadow-[0_0_30px_rgba(0,0,0,0.1)] border-x border-border overflow-x-hidden">
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;

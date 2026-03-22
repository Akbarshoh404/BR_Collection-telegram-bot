import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';
import { telegram } from '../utils/telegram';

const categories = ['All', 'Jackets', 'Polos', 'Pants'];

const HomeScreen = () => {
  const { products, saleActive, saleMessage, salePercent, adminLoggedIn, setAdminLoggedIn } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('All');
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (telegram?.BackButton) telegram.BackButton.hide();
  }, []);

  const handleAdminAuthOptions = () => {
    if (adminLoggedIn) {
      navigate('/admin');
    } else {
      setShowAdminPin(true);
      setPin('');
      setPinError(false);
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === '1234') {
      setAdminLoggedIn(true);
      setShowAdminPin(false);
      navigate('/admin');
    } else {
      setPinError(true);
    }
  };

  const filteredProducts = activeTab === 'All' 
    ? products 
    : products.filter(p => p.category.toLowerCase() === activeTab.toLowerCase());

  return (
    <motion.div 
      initial={{ x: '-30%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-30%', opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="pb-10 min-h-screen bg-background"
    >
      <Header onOpenAdminAuth={handleAdminAuthOptions} />
      
      {saleActive && (
        <div className="bg-accent-gold-light border-b border-accent-gold/20 py-2 px-4 text-center">
          <span className="text-accent-gold font-semibold text-sm">
            {saleMessage} (-{salePercent}%)
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 py-4 border-b border-border overflow-x-auto no-scrollbar">
        <div className="flex space-x-6 min-w-max">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`relative pb-1 text-sm font-medium transition-colors ${activeTab === cat ? 'text-text-primary' : 'text-text-secondary'}`}
            >
              {cat}
              {activeTab === cat && (
                <motion.div 
                  layoutId="tabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-gold"
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Basic Bottom Sheet for PIN */}
      <AnimatePresence>
        {showAdminPin && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowAdminPin(false)}
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[430px] bg-surface rounded-t-2xl p-6 pb-12 shadow-xl border-t border-border"
            >
              <h2 className="text-xl font-serif font-bold mb-4">Admin Access</h2>
              <p className="text-sm text-text-secondary mb-4">Enter PIN to access the admin panel.</p>
              <form onSubmit={handlePinSubmit}>
                <input 
                  type="password" 
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="PIN"
                  className={`w-full border ${pinError ? 'border-error text-error' : 'border-border'} rounded-lg px-4 py-3 bg-background focus:outline-none focus:border-accent-gold text-center tracking-[0.5em] font-mono mb-6 transition-colors`}
                  autoFocus
                />
                <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-black transition-colors">
                  Login
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
export default HomeScreen;

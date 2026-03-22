import React, { useContext } from 'react';
import { Home, Heart, ShoppingBag, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useContext(AppContext);

  const tabs = [
    { name: 'Home', path: '/', icon: <Home size={22} strokeWidth={2} /> },
    { name: 'Wishlist', path: '/wishlist', icon: <Heart size={22} strokeWidth={2} /> },
    { name: 'Cart', path: '/cart', icon: <div className="relative"><ShoppingBag size={22} strokeWidth={2} />{cart.length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-accent-gold text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm">{cart.length}</span>}</div> },
    { name: 'Profile', path: '/profile', icon: <User size={22} strokeWidth={2} /> }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-surface/95 backdrop-blur-xl border-t border-border flex justify-around items-center pb-6 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] px-2 pt-3">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path || (tab.path === '/profile' && location.pathname.includes('/profile'));
        return (
          <button 
            key={tab.name}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center p-2 pt-0 pb-4 relative transition-colors duration-300 w-16 ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-secondary'}`}
          >
            {isActive && (
              <motion.div 
                layoutId="navTab"
                className="absolute -top-3 w-10 h-1 bg-accent-gold rounded-b-full shadow-[0_2px_8px_rgba(184,149,42,0.4)]" 
              />
            )}
            <div className={`transition-transform duration-300 ${isActive ? '-translate-y-1 text-accent-gold' : ''}`}>
              {tab.icon}
            </div>
            <span className={`text-[10px] mt-1.5 font-bold transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 -translate-y-2 absolute'}`}>{tab.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;

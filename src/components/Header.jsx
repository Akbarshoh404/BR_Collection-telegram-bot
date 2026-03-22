import React, { useContext } from 'react';
import { ShoppingBag, Settings } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ onOpenAdminAuth }) => {
  const { cart } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
      <h1 className="font-serif text-2xl font-bold tracking-tight">BR Collection</h1>
      <div className="flex items-center space-x-4">
        <button onClick={onOpenAdminAuth} className="text-text-secondary hover:text-text-primary transition-colors">
          <Settings size={22} strokeWidth={1.5} />
        </button>
        <button onClick={() => navigate('/cart')} className="relative text-text-primary transition-colors">
          <ShoppingBag size={24} strokeWidth={1.5} />
          {cart.length > 0 && (
            <motion-badge className="absolute -top-1 -right-1 bg-accent-gold text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cart.length}
            </motion-badge>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;

import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { Heart } from 'lucide-react';

const WishlistScreen = () => {
  const { products, favorites, t } = useContext(AppContext);

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="pb-safe bg-background min-h-screen"
    >
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-border/50 px-5 py-5 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <h1 className="font-serif text-[26px] font-bold leading-none tracking-tight">{t('wishlist')}</h1>
        <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error">
          <Heart size={20} fill="currentColor" />
        </div>
      </header>

      {favoriteProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
          <div className="w-24 h-24 bg-muted/10 rounded-full flex items-center justify-center mb-6 border border-border/30 shadow-inner">
            <Heart size={40} className="text-border" strokeWidth={1} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-text-primary mb-2">Nothing here yet</h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-[80%]">
            Tap the heart icon on any product to save it to your wishlist.
          </p>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-2 gap-3.5 pb-6">
          <AnimatePresence>
            {favoriteProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default WishlistScreen;

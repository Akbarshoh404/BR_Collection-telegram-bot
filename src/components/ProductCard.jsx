import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { formatPrice } from '../utils/formatPrice';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { getProductPrice, saleActive, salePercent, categories, favorites, toggleFavorite } = useContext(AppContext);

  const price = getProductPrice(product);
  const hasDiscount = saleActive || product.sale > 0;
  const isGlobalSale = saleActive;
  const discountLabel = isGlobalSale ? `-${salePercent}%` : `-${product.sale}%`;
  const isFavorite = favorites.includes(product.id);
  const categoryName = categories.find(c => c.id === product.category)?.name || product.category;

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-surface rounded-[20px] overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.03)] border border-border/50 cursor-pointer relative group flex flex-col"
    >
      <div className="relative aspect-[3/4] bg-muted/10 w-full">
        <img 
          src={`https://picsum.photos/seed/${product.id}BR/400/533`} 
          alt={product.name} 
          className="w-full h-full object-cover select-none transition-transform duration-700 group-hover:scale-105" 
          loading="lazy"
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-3 w-full px-3 flex justify-between items-start z-10 pointer-events-none">
          <div className="flex flex-col gap-1.5">
            {hasDiscount && (
              <div className="bg-error/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm max-w-fit pointer-events-auto">
                {discountLabel}
              </div>
            )}
            {product.stock === 0 && (
              <div className="bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm max-w-fit pointer-events-auto">
                Sold Out
              </div>
            )}
          </div>
          <button 
            onClick={handleFavoriteClick}
            className="w-8 h-8 rounded-full bg-white/70 backdrop-blur flex items-center justify-center text-text-primary shadow-sm hover:scale-110 active:scale-90 transition-all pointer-events-auto"
          >
            <Heart size={16} fill={isFavorite ? '#D94F3D' : 'none'} color={isFavorite ? '#D94F3D' : 'currentColor'} strokeWidth={isFavorite ? 0 : 2} />
          </button>
        </div>
      </div>
      
      <div className="p-3.5 relative flex-1 flex flex-col">
        <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary mb-1 block">
          {categoryName}
        </span>
        <h3 className="text-sm font-serif font-bold leading-tight truncate pr-8 mb-1.5">{product.name}</h3>
        
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[10px] text-text-muted line-through mb-0.5">
                {formatPrice(product.price)}
              </span>
            )}
            <span className={`text-[14px] font-bold tracking-tight ${hasDiscount ? 'text-accent-gold' : 'text-text-primary'}`}>
              {formatPrice(price)}
            </span>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all z-20 active:scale-95 ${product.stock === 0 ? 'bg-muted text-surface' : 'bg-[#1A1A1A] text-white hover:bg-black'}`}
          >
            <ShoppingBag size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

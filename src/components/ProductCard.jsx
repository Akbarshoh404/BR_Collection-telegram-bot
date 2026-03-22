import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { formatPrice } from '../utils/formatPrice';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { getProductPrice, saleActive, salePercent } = useContext(AppContext);

  const price = getProductPrice(product);
  const hasDiscount = saleActive || product.sale > 0;
  const isGlobalSale = saleActive;
  const discountLabel = isGlobalSale ? `-${salePercent}%` : `-${product.sale}%`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-surface rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-border cursor-pointer relative"
    >
      <div className="relative aspect-[3/4] bg-muted/20">
        <img src={`https://picsum.photos/seed/${product.id}BR/400/533`} alt={product.name} className="w-full h-full object-cover" />
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
            {discountLabel}
          </div>
        )}
      </div>
      <div className="p-3 relative">
        <span className="text-[10px] uppercase tracking-wider text-text-secondary font-medium">{product.category}</span>
        <h3 className="text-sm font-serif font-semibold mt-0.5 leading-tight truncate pr-8">{product.name}</h3>
        <div className="mt-1 flex items-baseline space-x-1.5 truncate">
          <span className={`text-[13px] font-semibold ${hasDiscount ? 'text-accent-gold' : 'text-text-primary'}`}>
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className="text-[10px] text-text-muted line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
          className="absolute bottom-3 right-2 w-7 h-7 bg-surface border border-border rounded-full flex items-center justify-center text-text-primary shadow-sm hover:bg-accent-gold hover:text-white hover:border-accent-gold transition-colors z-20"
        >
          <Plus size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;

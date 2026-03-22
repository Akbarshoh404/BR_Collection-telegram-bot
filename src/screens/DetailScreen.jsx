import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Heart, Star, ShoppingBag, AlertCircle } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { formatPrice } from '../utils/formatPrice';
import { telegram } from '../utils/telegram';

const DetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, categories, getProductPrice, saleActive, salePercent, addToCart, favorites, toggleFavorite } = useContext(AppContext);
  const [selectedSize, setSelectedSize] = useState(null);

  const product = products.find(p => p.id === id);

  useEffect(() => {
    if (telegram?.BackButton) {
      telegram.BackButton.show();
      const handleBack = () => navigate(-1);
      telegram.BackButton.onClick(handleBack);
      return () => {
        telegram.BackButton.offClick(handleBack);
      };
    }
  }, [navigate]);

  if (!product) return <div className="p-4 flex h-screen items-center justify-center text-lg font-serif">Product not found.</div>;

  const price = getProductPrice(product);
  const hasDiscount = saleActive || product.sale > 0;
  const isGlobalSale = saleActive;
  const discountLabel = isGlobalSale ? `-${salePercent}%` : `-${product.sale}%`;
  const isFavorite = favorites.includes(product.id);
  const categoryName = categories.find(c => c.id === product.category)?.name || product.category;
  
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock || !selectedSize) return;
    addToCart(product, selectedSize);
    navigate(-1);
  };

  const handleOrderNow = () => {
    if (isOutOfStock || !selectedSize) return;
    addToCart(product, selectedSize);
    navigate('/cart');
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-20%', opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 350 }}
      className="min-h-screen bg-surface pb-32"
    >
      <div className="relative h-[65vh] w-full bg-muted/10 rounded-b-[40px] overflow-hidden shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-20 w-11 h-11 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
        >
          <ChevronLeft size={26} strokeWidth={2} />
        </button>
        <button 
          onClick={() => toggleFavorite(product.id)}
          className="absolute top-4 right-4 z-20 w-11 h-11 bg-white/90 backdrop-blur-md border border-border/50 rounded-full flex items-center justify-center text-primary shadow-lg active:scale-90 transition-transform"
        >
          <Heart size={22} fill={isFavorite ? '#D94F3D' : 'none'} color={isFavorite ? '#D94F3D' : 'currentColor'} strokeWidth={isFavorite ? 0 : 2} />
        </button>
        
        <img src={`https://picsum.photos/seed/${product.id}BR/800/1200`} alt={product.name} className="w-full h-full object-cover" />
        
        {hasDiscount && (
          <div className="absolute bottom-6 left-6 bg-error text-white text-[11px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full shadow-[0_4px_12px_rgba(217,79,61,0.4)]">
            Sale {discountLabel}
          </div>
        )}
      </div>

      <div className="px-6 py-6 border-t border-transparent relative -mt-6 bg-surface rounded-t-[40px] z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
        <div className="flex justify-between items-start mb-2 mt-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-accent-gold">{categoryName}</span>
          <div className="flex items-center space-x-1 text-text-primary">
            <Star size={14} fill="#B8952A" color="#B8952A" />
            <span className="text-xs font-bold">{product.rating}</span>
            <span className="text-xs text-text-muted">({product.reviews})</span>
          </div>
        </div>

        <h1 className="text-3xl font-serif font-bold leading-[1.1] mb-3 text-text-primary tracking-tight">{product.name}</h1>
        
        <div className="flex items-end space-x-3 mb-6">
          <span className="text-[26px] font-bold text-text-primary tracking-tight">
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className="text-sm font-semibold text-text-muted line-through mb-1.5">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        <p className="text-text-secondary leading-relaxed text-[15px] mb-8">
          {product.description}
        </p>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[13px] uppercase tracking-widest font-bold text-text-primary">Select Size</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary underline decoration-border underline-offset-4">Size Guide</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-[52px] h-[52px] rounded-2xl border-2 transition-all flex items-center justify-center font-bold text-[15px] ${selectedSize === size ? 'border-primary bg-primary text-white shadow-lg' : 'border-border/60 bg-transparent text-text-primary hover:border-text-muted'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-surface/95 backdrop-blur-xl border-t border-border/50 p-5 px-6 pb-safe flex flex-col gap-3 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        {isOutOfStock ? (
          <div className="w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 bg-muted/20 text-text-muted border border-border">
            <AlertCircle size={20} />
            <span>Out of Stock</span>
          </div>
        ) : product.stock < 5 ? (
          <div className="text-center w-full absolute -top-10 left-0">
             <span className="bg-error text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
               Only {product.stock} left in stock!
             </span>
          </div>
        ) : null}

        {!isOutOfStock && (
          <div className="flex space-x-3">
            <button 
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className={`flex-1 py-4.5 h-[56px] rounded-2xl font-bold flex items-center justify-center transition-all border-2 ${selectedSize ? 'border-border text-primary hover:bg-muted/10 active:scale-95' : 'border-border/50 text-text-muted cursor-not-allowed'}`}
            >
              <ShoppingBag size={20} className="mr-2" strokeWidth={2.5} /> Add
            </button>
            <button 
              onClick={handleOrderNow}
              disabled={!selectedSize}
              className={`flex-[1.5] py-4.5 h-[56px] rounded-2xl font-bold flex items-center justify-center transition-all relative overflow-hidden ${selectedSize ? 'bg-accent-gold text-white shadow-[0_8px_20px_rgba(184,149,42,0.3)] active:scale-95' : 'bg-muted text-surface cursor-not-allowed'}`}
            >
              Order Now
            </button>
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default DetailScreen;

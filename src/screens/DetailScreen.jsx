import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { formatPrice } from '../utils/formatPrice';
import { telegram } from '../utils/telegram';

const DetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, getProductPrice, saleActive, salePercent, addToCart } = useContext(AppContext);
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

  if (!product) return <div className="p-4">Product not found.</div>;

  const price = getProductPrice(product);
  const hasDiscount = saleActive || product.sale > 0;
  const isGlobalSale = saleActive;
  const discountLabel = isGlobalSale ? `-${salePercent}%` : `-${product.sale}%`;

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart(product, selectedSize);
    navigate(-1);
  };

  const handleOrderNow = () => {
    if (!selectedSize) return;
    addToCart(product, selectedSize);
    navigate('/cart');
  };

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-30%', opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-background pb-40"
    >
      <div className="relative">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-surface/80 backdrop-blur border border-border rounded-full flex items-center justify-center text-text-primary shadow-sm"
        >
          <ChevronLeft size={24} strokeWidth={1.5} />
        </button>
        <div className="aspect-[3/4] w-full bg-muted/20 relative">
          <img src={`https://picsum.photos/seed/${product.id}BR/800/1066`} alt={product.name} className="w-full h-full object-cover" />
          {hasDiscount && (
            <div className="absolute bottom-4 right-4 bg-error text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
              {discountLabel} OFF
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-6">
        <span className="text-xs uppercase tracking-widest text-text-secondary font-medium">{product.category}</span>
        <h1 className="text-2xl font-serif font-bold mt-2 leading-tight">{product.name}</h1>
        
        <div className="mt-4 flex items-baseline space-x-3">
          <span className="text-xl font-bold text-accent-gold">
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-text-muted line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        <p className="mt-6 text-text-secondary leading-relaxed text-sm">
          {product.description}
        </p>

        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-3">Select Size</h3>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-12 h-12 rounded-full border transition-colors flex items-center justify-center font-medium ${selectedSize === size ? 'border-accent-gold bg-accent-gold text-white shadow-md' : 'border-border bg-surface text-text-primary hover:border-text-secondary'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-surface/90 backdrop-blur-md border-t border-border p-4 flex flex-col gap-3 z-30">
        <button 
          onClick={handleOrderNow}
          disabled={!selectedSize}
          className={`w-full py-3.5 rounded-lg font-bold text-center transition-all ${selectedSize ? 'bg-accent-gold text-white shadow-lg focus:scale-[0.98]' : 'bg-muted text-surface cursor-not-allowed'}`}
        >
          Order Now
        </button>
        <button 
          onClick={handleAddToCart}
          disabled={!selectedSize}
          className={`w-full py-3.5 rounded-lg font-bold text-center transition-all border ${selectedSize ? 'border-accent-gold text-accent-gold hover:bg-accent-gold-light focus:scale-[0.98]' : 'border-border text-text-muted cursor-not-allowed'}`}
        >
          Add to Cart
        </button>
      </div>

    </motion.div>
  );
};

export default DetailScreen;

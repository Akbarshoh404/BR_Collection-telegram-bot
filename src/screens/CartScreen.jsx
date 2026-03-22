import React, { useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { formatPrice } from '../utils/formatPrice';
import { telegram } from '../utils/telegram';

const CartScreen = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart } = useContext(AppContext);

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

  const total = cart.reduce((sum, item) => sum + item.finalPrice, 0);

  const handlePlaceOrder = () => {
    if (cart.length > 0) {
      navigate('/confirm/new');
    }
  };

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-30%', opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-background pb-32 flex flex-col"
    >
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-text-primary p-1 -ml-1">
          <ChevronLeft size={24} strokeWidth={1.5} />
        </button>
        <h1 className="font-serif text-xl font-bold">Shopping Cart</h1>
        <div className="w-6"></div> {/* Spacer for centering */}
      </header>

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-4 text-3xl">
            🛒
          </div>
          <h2 className="text-xl font-serif font-bold mb-2">Your Cart is Empty</h2>
          <p className="text-text-secondary text-sm mb-8">Looks like you haven't added anything to your cart yet.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium shadow-lg active:scale-95 transition-transform"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="p-4 flex-1">
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.cartId} className="bg-surface rounded-xl p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-border flex items-center space-x-4">
                <img src={`https://picsum.photos/seed/${item.id}BR/200/266`} alt={item.name} className="w-20 h-24 object-cover rounded-lg bg-muted/20" />
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-sm font-semibold truncate leading-tight">{item.name}</h3>
                  <p className="text-xs text-text-secondary mt-1">Size: <span className="font-semibold text-text-primary">{item.selectedSize}</span></p>
                  <p className="text-sm font-bold text-accent-gold mt-2">{formatPrice(item.finalPrice)}</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.cartId)}
                  className="p-2 text-text-muted hover:text-error transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-surface rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-border">
            <h3 className="font-serif font-bold text-lg mb-4">Order Summary</h3>
            <div className="flex justify-between items-center mb-3">
              <span className="text-text-secondary text-sm">Items ({cart.length})</span>
              <span className="text-sm font-medium">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-text-secondary text-sm">Shipping</span>
              <span className="text-sm font-medium text-success">Free</span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between items-center">
              <span className="font-bold">Total</span>
              <span className="font-bold text-lg text-accent-gold">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-surface border-t border-border p-4 z-30">
          <button 
            onClick={handlePlaceOrder}
            className="w-full bg-accent-gold text-white py-3.5 rounded-lg font-bold text-center shadow-lg hover:bg-accent-gold/90 transition-all active:scale-[0.98]"
          >
            Place Order
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default CartScreen;

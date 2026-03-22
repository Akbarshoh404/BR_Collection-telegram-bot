import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { telegram } from '../utils/telegram';
import { formatPrice } from '../utils/formatPrice';

const ConfirmScreen = () => {
  const { cart, clearCart, addOrder, currentUser } = useContext(AppContext);
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    if (telegram?.BackButton) {
      telegram.BackButton.hide();
    }

    const generatedId = '#BR' + Math.floor(1000 + Math.random() * 9000);
    setOrderId(generatedId);

    if (cart && cart.length > 0) {
      const orderItems = cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        qty: item.qty,
        selectedSize: item.selectedSize,
        finalPrice: item.finalPrice,
        product: item.product
      }));

      const newOrder = {
        id: generatedId,
        items: orderItems,
        status: 'New',
        username: telegram?.initDataUnsafe?.user?.username || currentUser?.telegramId || 'Guest',
        date: new Date().toISOString()
      };

      setPlacedOrder(newOrder);
      addOrder(newOrder);

      if (telegram?.sendData) {
        try {
          telegram.sendData(JSON.stringify(newOrder));
        } catch (e) {
          console.error('Error sending data to telegram', e);
        }
      }

      clearCart();
    } else {
      if (!placedOrder) {
        setTimeout(() => navigate('/home'), 3000);
      }
    }
  }, []);

  const totalAmount = placedOrder?.items.reduce((s, i) => s + i.finalPrice, 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center overflow-hidden relative"
    >
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-success/5 to-transparent pointer-events-none" />

      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
        className="w-24 h-24 bg-success rounded-full flex items-center justify-center text-white mb-8 shadow-[0_15px_40px_rgba(45,122,79,0.3)] border-4 border-white"
      >
        <Check size={48} strokeWidth={4} />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h1 className="text-[32px] font-serif font-bold mb-3 tracking-tight text-primary leading-tight">Order Received!</h1>
        <p className="text-text-secondary text-[15px] max-w-[280px] mx-auto leading-relaxed mb-10">
          Success! Your order <span className="font-mono text-primary font-bold">{orderId}</span> has been processed with priority.
        </p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-surface border border-border/60 rounded-[28px] p-6 mb-10 shadow-[0_4px_25px_rgba(0,0,0,0.03)] w-full max-w-[340px] text-left"
        >
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Summary</span>
            <span className="text-[14px] font-bold text-success">PAID</span>
          </div>

          <div className="space-y-3">
            {placedOrder?.items.map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + idx * 0.1 }}
                className="flex justify-between items-center text-[13px]"
              >
                <span className="text-text-secondary font-medium">{item.qty}x {item.name}</span>
                <span className="font-bold text-primary">{formatPrice(item.finalPrice)}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-border flex justify-between items-center">
            <span className="font-bold text-primary">Total Amount</span>
            <span className="font-bold text-xl text-accent-gold">{formatPrice(totalAmount)}</span>
          </div>
        </motion.div>

        <motion.button
          onClick={() => navigate('/home')}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-[280px] bg-[#1A1A1A] text-white h-[60px] rounded-2xl font-bold shadow-[0_10px_25px_rgba(0,0,0,0.15)] active:scale-95 transition-all flex items-center justify-center space-x-3 tracking-wide hover:bg-black"
        >
          <span>Continue Shopping</span>
          <ArrowRight size={18} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmScreen;

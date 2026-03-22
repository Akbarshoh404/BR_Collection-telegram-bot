import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { telegram } from '../utils/telegram';

const ConfirmScreen = () => {
  const { cart, clearCart, addOrder } = useContext(AppContext);
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (telegram?.BackButton) {
      telegram.BackButton.hide();
    }

    const generatedId = '#BR' + Math.floor(1000 + Math.random() * 9000);
    setOrderId(generatedId);

    if (cart.length > 0) {
      const newOrder = {
        id: generatedId,
        items: [...cart],
        status: 'New',
        username: telegram?.initDataUnsafe?.user?.username || 'Guest',
        date: new Date().toISOString()
      };
      
      addOrder(newOrder);
      
      if (telegram?.sendData) {
        try {
          telegram.sendData(JSON.stringify(newOrder));
        } catch (e) {
          console.error('Error sending data to telegram', e);
        }
      }

      clearCart();
    }
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center"
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
        className="w-24 h-24 bg-success rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-success/20"
      >
        <Check size={48} strokeWidth={3} />
      </motion.div>
      
      <h1 className="text-3xl font-serif font-bold mb-2">Order Confirmed!</h1>
      <p className="text-text-secondary mb-8">
        Your order <span className="font-mono text-text-primary px-1 font-semibold">{orderId}</span> has been successfully placed. We'll be in touch soon.
      </p>

      <button 
        onClick={() => navigate('/')}
        className="w-full max-w-[300px] bg-primary text-white py-3.5 rounded-lg font-medium shadow-md hover:bg-black transition-all active:scale-95"
      >
        Continue Shopping
      </button>
    </motion.div>
  );
};

export default ConfirmScreen;

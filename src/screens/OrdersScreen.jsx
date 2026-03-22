import React, { useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Check, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { formatPrice } from '../utils/formatPrice';
import { telegram } from '../utils/telegram';

const OrdersScreen = () => {
  const { orders, setOrders, currentUser } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for context to check admin if loading
    if (currentUser && !currentUser.isAdmin) {
      navigate('/');
    }
    
    if (telegram?.BackButton) {
      telegram.BackButton.show();
      const handleBack = () => navigate(-1);
      telegram.BackButton.onClick(handleBack);
      return () => {
        telegram.BackButton.offClick(handleBack);
      };
    }
  }, [navigate, currentUser]);

  const markAsDone = (orderId) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Done' } : o));
  };

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-30%', opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-background pb-10"
    >
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-[#1A1A1A] p-2 -ml-2 rounded-full hover:bg-muted/10 transition-colors">
          <ChevronLeft size={24} strokeWidth={2} />
        </button>
        <h1 className="font-serif text-xl font-bold">All Orders</h1>
        <div className="w-6"></div>
      </header>

      <div className="p-4 space-y-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-text-secondary">
            <Package size={48} className="mb-4 text-border" />
            <p>No orders placed yet.</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-surface border border-border rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-mono font-bold text-text-primary text-[15px]">{order.id}</h3>
                  <p className="text-xs text-text-secondary mt-0.5 font-bold uppercase tracking-wider">@{order.username}</p>
                </div>
                <div className={`px-2.5 py-1 rounded text-[10px] uppercase font-black tracking-widest ${order.status === 'New' ? 'bg-error text-white' : 'bg-success text-white'}`}>
                  {order.status}
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-3 space-y-2.5">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-[14px]">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="truncate font-bold text-primary">{item.product.name}</span>
                      <span className="text-[10px] font-bold text-text-secondary bg-muted/10 px-1.5 py-0.5 rounded uppercase">{item.selectedSize}</span>
                    </div>
                    <span className="font-bold text-accent-gold whitespace-nowrap ml-3">{formatPrice(item.finalPrice)}</span>
                  </div>
                ))}
              </div>

              {order.status === 'New' && (
                <div className="mt-5 pt-4 border-t border-border">
                  <button 
                    onClick={() => markAsDone(order.id)}
                    className="w-full flex items-center justify-center space-x-2 bg-[#1A1A1A] text-white py-3 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all"
                  >
                    <Check size={16} strokeWidth={3} />
                    <span>Complete Order</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default OrdersScreen;

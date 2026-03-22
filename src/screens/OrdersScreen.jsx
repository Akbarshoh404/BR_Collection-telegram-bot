import React, { useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Check, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { formatPrice } from '../utils/formatPrice';
import { telegram } from '../utils/telegram';

const OrdersScreen = () => {
  const { orders, setOrders, adminLoggedIn } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!adminLoggedIn) {
      navigate('/');
    }
    if (telegram?.BackButton) {
      telegram.BackButton.show();
      const handleBack = () => navigate(-1);
      telegram.BackButton.onClick(handleBack);
      return () => telegram.BackButton.offClick(handleBack);
    }
  }, [navigate, adminLoggedIn]);

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
        <button onClick={() => navigate(-1)} className="text-text-primary p-1 -ml-1">
          <ChevronLeft size={24} strokeWidth={1.5} />
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
                  <h3 className="font-mono font-bold text-text-primary">{order.id}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">@{order.username}</p>
                </div>
                <div className={`px-2 py-0.5 rounded text-xs font-bold ${order.status === 'New' ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                  {order.status}
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="truncate">{item.name}</span>
                      <span className="text-xs text-text-secondary bg-muted/20 px-1 rounded">{item.selectedSize}</span>
                    </div>
                    <span className="font-medium whitespace-nowrap ml-3">{formatPrice(item.finalPrice)}</span>
                  </div>
                ))}
              </div>

              {order.status === 'New' && (
                <div className="mt-4 pt-4 border-t border-border">
                  <button 
                    onClick={() => markAsDone(order.id)}
                    className="w-full flex items-center justify-center space-x-2 bg-text-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors"
                  >
                    <Check size={16} />
                    <span>Mark as Done</span>
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

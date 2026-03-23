import React, { useContext, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Package, Truck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { formatPrice } from '../utils/formatPrice'
import { telegram } from '../utils/telegram'
import { getProductGlyph } from '../utils/iconMaps'

const UserOrdersScreen = () => {
  const { orders, currentUser } = useContext(AppContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (telegram?.BackButton) {
      telegram.BackButton.show()
      const handleBack = () => navigate(-1)
      telegram.BackButton.onClick(handleBack)
      return () => telegram.BackButton.offClick(handleBack)
    }

    return undefined
  }, [navigate])

  const userOrders = orders.filter((order) => order.username === currentUser?.telegramId)

  return (
    <motion.div initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '-30%', opacity: 0 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }} className="min-h-screen bg-background pb-10">
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => navigate(-1)} className="text-text-primary p-2 -ml-2 rounded-full hover:bg-muted/10 transition-colors">
          <ChevronLeft size={24} strokeWidth={2} />
        </button>
        <h1 className="font-serif text-[22px] font-bold">My Orders</h1>
        <div className="w-8"></div>
      </header>

      <div className="p-4 space-y-4">
        {userOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <Package size={48} className="mb-4 text-border" strokeWidth={1} />
            <p className="text-text-secondary font-medium">No orders found.</p>
          </div>
        ) : (
          userOrders.map((order) => (
            <div key={order.id} className="bg-surface border border-border/60 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
              <div className="flex justify-between items-start mb-4 gap-3">
                <div>
                  <h3 className="font-mono text-sm font-bold text-text-primary bg-muted/10 px-2 py-0.5 rounded-md border border-border/50">{order.id}</h3>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary mt-2">
                    {new Date(order.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-[11px] text-text-secondary mt-1">{order.paymentMethod}</p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm ${order.status === 'New' ? 'bg-error/10 text-error border border-error/20' : 'bg-success/10 text-success border border-success/20'}`}>
                  {order.status === 'New' ? 'Processing' : 'Completed'}
                </div>
              </div>

              <div className="border-t border-border/50 pt-4 space-y-3">
                {order.items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex justify-between items-center">
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-10 h-10 bg-muted/10 rounded-lg flex items-center justify-center text-xl">{getProductGlyph(item.product)}</div>
                      <div className="flex flex-col truncate">
                        <span className="text-[13px] font-bold text-text-primary truncate">{item.name || item.product.name}</span>
                        <span className="text-[11px] font-bold text-text-secondary mt-0.5 uppercase tracking-wide">Size: {item.selectedSize} • Qty: {item.qty}</span>
                      </div>
                    </div>
                    <span className="text-[13px] font-bold text-text-primary whitespace-nowrap ml-3">{formatPrice(item.finalPrice)}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-[18px] bg-background border border-border/60 px-4 py-3 mt-4 flex items-center gap-2 text-[12px] text-text-secondary">
                <Truck size={14} className="text-accent-gold" />
                {order.customer?.shippingAddress}
              </div>

              <div className="border-t border-border/50 mt-4 pt-4 flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-widest text-text-secondary">Total</span>
                <span className="text-base font-bold text-accent-gold">{formatPrice(order.totalAmount || order.items.reduce((sum, item) => sum + item.finalPrice, 0))}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}

export default UserOrdersScreen


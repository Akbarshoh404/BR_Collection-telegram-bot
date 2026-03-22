import React, { useContext, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ChevronLeft, Package, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { formatPrice } from '../utils/formatPrice'
import { telegram } from '../utils/telegram'

const OrdersScreen = () => {
  const { orders, updateOrderStatus, currentUser } = useContext(AppContext)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  useEffect(() => {
    if (currentUser && !currentUser.isAdmin) {
      navigate('/')
    }

    if (telegram?.BackButton) {
      telegram.BackButton.show()
      const handleBack = () => navigate(-1)
      telegram.BackButton.onClick(handleBack)
      return () => {
        telegram.BackButton.offClick(handleBack)
      }
    }

    return undefined
  }, [navigate, currentUser])

  const filteredOrders = useMemo(() => {
    const now = Date.now()

    return orders.filter((order) => {
      const matchesQuery = !query || [order.id, order.username, order.customer?.phone, order.customer?.shippingAddress]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesPayment = paymentFilter === 'all' || order.paymentMethod === paymentFilter

      let matchesDate = true
      if (dateFilter === '7d') {
        matchesDate = now - new Date(order.date).getTime() <= 7 * 24 * 60 * 60 * 1000
      } else if (dateFilter === '30d') {
        matchesDate = now - new Date(order.date).getTime() <= 30 * 24 * 60 * 60 * 1000
      }

      return matchesQuery && matchesStatus && matchesPayment && matchesDate
    })
  }, [dateFilter, orders, paymentFilter, query, statusFilter])

  return (
    <motion.div initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '-30%', opacity: 0 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }} className="min-h-screen bg-background pb-10">
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-[#1A1A1A] p-2 -ml-2 rounded-full hover:bg-muted/10 transition-colors">
          <ChevronLeft size={24} strokeWidth={2} />
        </button>
        <h1 className="font-serif text-xl font-bold">All Orders</h1>
        <div className="w-6"></div>
      </header>

      <div className="p-4 space-y-4">
        <div className="rounded-[24px] border border-border/60 bg-surface p-4 shadow-[0_8px_20px_rgba(0,0,0,0.03)] space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by order ID, user, phone, or address" className="input-luxury pl-10 text-[14px]" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="input-luxury appearance-none text-[13px]">
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Done">Done</option>
            </select>
            <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} className="input-luxury appearance-none text-[13px]">
              <option value="all">All Payments</option>
              <option value="Cash on Delivery">Cash</option>
              <option value="Click">Click</option>
              <option value="Payme">Payme</option>
              <option value="Card Transfer">Card</option>
            </select>
            <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="input-luxury appearance-none text-[13px]">
              <option value="all">All Dates</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-text-secondary">
            <Package size={48} className="mb-4 text-border" />
            <p>No orders match these filters yet.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-surface border border-border rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] relative overflow-hidden">
              <div className="flex justify-between items-start mb-3 gap-3">
                <div>
                  <h3 className="font-mono font-bold text-text-primary text-[15px]">{order.id}</h3>
                  <p className="text-xs text-text-secondary mt-0.5 font-bold uppercase tracking-wider">@{order.username}</p>
                  <p className="text-[11px] text-text-secondary mt-1">{order.customer?.phone}</p>
                  <p className="text-[11px] text-text-secondary mt-1 max-w-[240px] leading-relaxed">{order.customer?.shippingAddress}</p>
                </div>
                <div className="text-right">
                  <div className={`px-2.5 py-1 rounded text-[10px] uppercase font-black tracking-widest ${order.status === 'New' ? 'bg-error text-white' : 'bg-success text-white'}`}>{order.status}</div>
                  <p className="text-[11px] text-text-secondary mt-2">{order.paymentMethod}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-3 space-y-2.5">
                {order.items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex justify-between items-center text-[14px]">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="truncate font-bold text-primary">{item.product.name}</span>
                      <span className="text-[10px] font-bold text-text-secondary bg-muted/10 px-1.5 py-0.5 rounded uppercase">{item.selectedSize}</span>
                    </div>
                    <span className="font-bold text-accent-gold whitespace-nowrap ml-3">{formatPrice(item.finalPrice)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-text-secondary font-bold">Total</p>
                  <p className="text-[16px] font-bold text-primary mt-1">{formatPrice(order.totalAmount || 0)}</p>
                </div>
                {order.status === 'New' && (
                  <button onClick={() => updateOrderStatus(order.id, 'Done')} className="flex items-center justify-center space-x-2 bg-[#1A1A1A] text-white py-3 px-5 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all">
                    <Check size={16} strokeWidth={3} />
                    <span>Complete Order</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}

export default OrdersScreen


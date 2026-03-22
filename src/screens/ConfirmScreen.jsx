import React, { useContext, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, CreditCard, MapPin, MessageSquareText, Phone, TicketPercent } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { telegram } from '../utils/telegram'
import { formatPrice } from '../utils/formatPrice'

const regions = [
  'Toshkent shahri',
  'Toshkent viloyati',
  'Samarqand viloyati',
  'Buxoro viloyati',
  "Andijon viloyati",
  "Farg'ona viloyati",
  'Namangan viloyati',
  'Qashqadaryo viloyati',
  'Surxondaryo viloyati',
  'Navoiy viloyati',
  'Jizzax viloyati',
  'Sirdaryo viloyati',
  'Xorazm viloyati',
  "Qoraqalpog'iston Respublikasi",
]

const paymentMethods = ['Online Card', 'Cash', 'Card on Delivery']

const ConfirmScreen = () => {
  const { cart, clearCart, addOrder, currentUser, checkoutDraft, updateCheckoutDraft, applyPromoCode, updateCurrentUserProfile } = useContext(AppContext)
  const navigate = useNavigate()
  const [orderId, setOrderId] = useState('')
  const [placedOrder, setPlacedOrder] = useState(null)

  useEffect(() => {
    telegram?.BackButton?.hide?.()
  }, [])

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.finalPrice, 0), [cart])
  const promoState = useMemo(() => applyPromoCode(checkoutDraft.promoCode || '', subtotal), [applyPromoCode, checkoutDraft.promoCode, subtotal])
  const discountAmount = promoState.valid ? promoState.discountAmount : 0
  const totalAmount = Math.max(0, subtotal - discountAmount)

  const formIsValid = Boolean(
    cart.length &&
      checkoutDraft.fullName.trim() &&
      checkoutDraft.region.trim() &&
      checkoutDraft.district.trim() &&
      checkoutDraft.specification.trim() &&
      checkoutDraft.phone.trim() &&
      checkoutDraft.paymentMethod,
  )

  const handlePlaceOrder = () => {
    if (!formIsValid) {
      return
    }

    const generatedId = `#BR${Math.floor(1000 + Math.random() * 9000)}`
    const createdAt = new Date().toISOString()
    setOrderId(generatedId)

    const orderItems = cart.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      qty: item.qty,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      finalPrice: item.finalPrice,
      product: item.product,
    }))

    const newOrder = addOrder({
      id: generatedId,
      items: orderItems,
      status: 'New',
      username: telegram?.initDataUnsafe?.user?.username || currentUser?.telegramId || 'Guest',
      date: createdAt,
      promoCode: promoState.valid ? promoState.code : '',
      discountAmount,
      subtotal,
      totalAmount,
      paymentMethod: checkoutDraft.paymentMethod,
      customer: {
        telegramId: currentUser?.telegramId || 'guest',
        firstName: checkoutDraft.fullName || currentUser?.firstName || 'Guest',
        lastName: '',
        fullName: checkoutDraft.fullName,
        phone: checkoutDraft.phone,
        region: checkoutDraft.region,
        district: checkoutDraft.district,
        specification: checkoutDraft.specification,
        shippingAddress: `${checkoutDraft.region}, ${checkoutDraft.district}, ${checkoutDraft.specification}`,
        estimatedDelivery: '3 days',
      },
      orderNotes: checkoutDraft.orderNotes,
    })

    updateCurrentUserProfile({ phone: checkoutDraft.phone })
    setPlacedOrder(newOrder)
    clearCart()
    updateCheckoutDraft({ promoCode: '', orderNotes: '' })
  }

  if (cart.length === 0 && !placedOrder) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-[30px] font-serif font-bold text-primary mb-3">No items ready for checkout</h1>
        <p className="text-text-secondary mb-6 max-w-[280px]">Add a few pieces to your bag before opening the checkout flow.</p>
        <button onClick={() => navigate('/home')} className="btn-primary">Back to Store</button>
      </div>
    )
  }

  if (placedOrder) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-success/5 to-transparent pointer-events-none" />

        <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }} className="w-24 h-24 bg-success rounded-full flex items-center justify-center text-white mb-8 shadow-[0_15px_40px_rgba(45,122,79,0.3)] border-4 border-white">
          <Check size={48} strokeWidth={4} />
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="w-full max-w-[360px]">
          <h1 className="text-[32px] font-serif font-bold mb-3 tracking-tight text-primary leading-tight">Order Received</h1>
          <p className="text-text-secondary text-[15px] mx-auto leading-relaxed mb-8">
            Your order <span className="font-mono text-primary font-bold">{orderId}</span> is in the queue. We have also sent a Telegram update payload for order tracking.
          </p>

          <div className="bg-surface border border-border/60 rounded-[28px] p-6 mb-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] text-left">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Checkout Summary</span>
              <span className="text-[14px] font-bold text-success">{placedOrder.paymentMethod}</span>
            </div>
            <div className="mb-4 rounded-[18px] bg-background border border-border/60 p-4 text-[13px] text-text-secondary leading-relaxed">
              <p><span className="font-bold text-primary">Customer:</span> {placedOrder.customer?.fullName}</p>
              <p className="mt-1"><span className="font-bold text-primary">Phone:</span> {placedOrder.customer?.phone}</p>
              <p className="mt-1"><span className="font-bold text-primary">Address:</span> {placedOrder.customer?.shippingAddress}</p>
              <p className="mt-1"><span className="font-bold text-primary">Estimated delivery:</span> {placedOrder.customer?.estimatedDelivery}</p>
            </div>
            <div className="space-y-3">
              {placedOrder.items.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex justify-between items-center text-[13px]">
                  <span className="text-text-secondary font-medium">{item.qty}x {item.name}</span>
                  <span className="font-bold text-primary">{formatPrice(item.finalPrice)}</span>
                </div>
              ))}
            </div>
            {placedOrder.discountAmount > 0 && (
              <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center text-[13px]">
                <span className="text-text-secondary">Promo discount</span>
                <span className="font-bold text-success">-{formatPrice(placedOrder.discountAmount)}</span>
              </div>
            )}
            <div className="mt-5 pt-4 border-t border-border flex justify-between items-center">
              <span className="font-bold text-primary">Total Amount</span>
              <span className="font-bold text-xl text-accent-gold">{formatPrice(placedOrder.totalAmount)}</span>
            </div>
          </div>

          <motion.button onClick={() => navigate('/home')} whileTap={{ scale: 0.95 }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="w-full bg-[#1A1A1A] text-white h-[60px] rounded-2xl font-bold shadow-[0_10px_25px_rgba(0,0,0,0.15)] active:scale-95 transition-all flex items-center justify-center space-x-3 tracking-wide hover:bg-black">
            <span>Continue Shopping</span>
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-background px-5 py-6 pb-10 space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-accent-gold">Checkout</p>
        <h1 className="text-[30px] font-serif font-bold text-primary mt-2">Confirm your order details</h1>
        <p className="text-[14px] text-text-secondary mt-2 leading-relaxed">Fill in delivery details for Uzbekistan, choose a payment type, and we will show an estimated delivery time of 3 days.</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-[26px] border border-border/60 bg-surface p-5 space-y-4 shadow-[0_10px_24px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2"><MapPin size={18} className="text-accent-gold" /><h2 className="font-serif text-[22px] font-bold text-primary">Delivery</h2></div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Full Name</label>
            <input value={checkoutDraft.fullName} onChange={(event) => updateCheckoutDraft({ fullName: event.target.value })} className="input-luxury font-medium" placeholder="Akbarshoh Aliyev" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Region</label>
            <select value={checkoutDraft.region} onChange={(event) => updateCheckoutDraft({ region: event.target.value })} className="input-luxury appearance-none font-medium">
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Tuman Nomi</label>
            <input value={checkoutDraft.district} onChange={(event) => updateCheckoutDraft({ district: event.target.value })} className="input-luxury font-medium" placeholder="Yunusobod tumani" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Specification</label>
            <textarea value={checkoutDraft.specification} onChange={(event) => updateCheckoutDraft({ specification: event.target.value })} rows={3} className="input-luxury resize-none font-medium" placeholder="Mavze, uy raqami, ko'cha nomi, mo'ljal" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Phone Confirmation</label>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input value={checkoutDraft.phone} onChange={(event) => updateCheckoutDraft({ phone: event.target.value })} className="input-luxury pl-11 font-medium" placeholder="+998 90 123 45 67" />
            </div>
          </div>
          <div className="rounded-[18px] bg-background border border-border/60 p-4 text-[13px] text-text-secondary leading-relaxed">
            <span className="font-bold text-primary">Estimated delivery:</span> 3 days
          </div>
        </div>

        <div className="rounded-[26px] border border-border/60 bg-surface p-5 space-y-4 shadow-[0_10px_24px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2"><CreditCard size={18} className="text-accent-gold" /><h2 className="font-serif text-[22px] font-bold text-primary">Payment & Notes</h2></div>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => (
              <button key={method} onClick={() => updateCheckoutDraft({ paymentMethod: method })} className={`rounded-[20px] border px-4 py-3 text-left transition-colors ${checkoutDraft.paymentMethod === method ? 'border-primary bg-primary text-white' : 'border-border/60 bg-background text-primary'}`}>
                <p className="text-[12px] font-bold">{method}</p>
              </button>
            ))}
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Promo Code</label>
            <div className="relative">
              <TicketPercent size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input value={checkoutDraft.promoCode} onChange={(event) => updateCheckoutDraft({ promoCode: event.target.value.toUpperCase() })} className="input-luxury pl-11 font-medium" placeholder="BRVIP or WELCOME5" />
            </div>
            {checkoutDraft.promoCode && (
              <p className={`text-[12px] mt-2 ${promoState.valid ? 'text-success' : 'text-error'}`}>{promoState.description}</p>
            )}
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Order Notes</label>
            <div className="relative">
              <MessageSquareText size={16} className="absolute left-4 top-4 text-text-secondary" />
              <textarea value={checkoutDraft.orderNotes} onChange={(event) => updateCheckoutDraft({ orderNotes: event.target.value })} rows={3} className="input-luxury pl-11 resize-none font-medium" placeholder="Tailoring preference, call before delivery, gift wrapping, and so on" />
            </div>
          </div>
        </div>

        <div className="rounded-[26px] border border-border/60 bg-surface p-5 shadow-[0_10px_24px_rgba(0,0,0,0.03)] space-y-4">
          <h2 className="font-serif text-[22px] font-bold text-primary">Order Review</h2>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.cartId} className="flex justify-between items-center text-[13px]">
                <div>
                  <p className="font-bold text-primary">{item.product.name}</p>
                  <p className="text-text-secondary">{item.selectedSize} • Qty {item.qty}</p>
                </div>
                <span className="font-bold text-primary">{formatPrice(item.finalPrice)}</span>
              </div>
            ))}
          </div>
          <div className="rounded-[18px] bg-background border border-border/60 p-4 text-[13px] text-text-secondary leading-relaxed">
            <p><span className="font-bold text-primary">Receiver:</span> {checkoutDraft.fullName || 'Not entered yet'}</p>
            <p className="mt-1"><span className="font-bold text-primary">Address:</span> {[checkoutDraft.region, checkoutDraft.district, checkoutDraft.specification].filter(Boolean).join(', ') || 'Not entered yet'}</p>
            <p className="mt-1"><span className="font-bold text-primary">Delivery estimate:</span> 3 days</p>
          </div>
          <div className="border-t border-border/50 pt-4 space-y-2">
            <div className="flex justify-between text-[13px]"><span className="text-text-secondary">Subtotal</span><span className="font-bold text-primary">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-[13px]"><span className="text-text-secondary">Discount</span><span className="font-bold text-success">-{formatPrice(discountAmount)}</span></div>
            <div className="flex justify-between text-[16px]"><span className="font-bold text-primary">Total</span><span className="font-bold text-accent-gold">{formatPrice(totalAmount)}</span></div>
          </div>
        </div>
      </div>

      <button disabled={!formIsValid} onClick={handlePlaceOrder} className={`w-full h-[58px] rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${formIsValid ? 'bg-accent-gold text-white shadow-[0_8px_20px_rgba(184,149,42,0.3)]' : 'bg-muted text-surface cursor-not-allowed'}`}>
        <Check size={18} />
        Place Order Securely
      </button>
    </motion.div>
  )
}

export default ConfirmScreen


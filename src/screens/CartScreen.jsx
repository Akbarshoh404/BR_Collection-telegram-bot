import React, { useContext, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { formatPrice } from '../utils/formatPrice'
import { telegram } from '../utils/telegram'
import { getProductImage } from '../utils/productMedia'

const CartScreen = () => {
  const navigate = useNavigate()
  const { cart, removeFromCart, updateCartItemQty } = useContext(AppContext)

  useEffect(() => {
    if (telegram?.BackButton) {
      telegram.BackButton.show()
      const handleBack = () => navigate(-1)
      telegram.BackButton.onClick(handleBack)
      return () => {
        telegram.BackButton.offClick(handleBack)
      }
    }

    return undefined
  }, [navigate])

  const total = cart.reduce((sum, item) => sum + item.finalPrice, 0)

  const handlePlaceOrder = () => {
    if (cart.length > 0) {
      navigate('/confirm/new')
    }
  }

  return (
    <motion.div initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '-30%', opacity: 0 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }} className="min-h-screen bg-background pb-32 flex flex-col">
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => navigate(-1)} className="text-text-primary p-2 -ml-2 rounded-full hover:bg-muted/10 transition-colors">
          <ChevronLeft size={24} strokeWidth={2} />
        </button>
        <h1 className="font-serif text-[22px] font-bold tracking-tight">Shopping Bag</h1>
        <div className="w-8"></div>
      </header>

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-muted/10 rounded-full flex items-center justify-center mb-6 shadow-inner border border-border/40">
            <ShoppingBag size={36} className="text-text-muted opacity-60" />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-2">Your Bag is Empty</h2>
          <p className="text-text-secondary text-sm mb-10 max-w-[80%]">Looks like you have not added anything yet. Your selected pieces will live here before checkout.</p>
          <button onClick={() => navigate('/home')} className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:scale-95 transition-transform tracking-wide">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="p-4 flex-1 space-y-6">
          <div className="space-y-4">
            <AnimatePresence>
              {cart.map((item) => {
                const selectedColor = item.product.colors?.find((color) => color.id === item.selectedColor)
                const maxQty = item.product.sizeStock?.[item.selectedSize] ?? item.product.stock

                return (
                  <motion.div key={item.cartId} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, height: 0 }} className="bg-surface rounded-[22px] p-3 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-border/60 flex items-stretch space-x-4">
                    <img src={getProductImage(item.product, item.selectedColor)} alt={item.product.name} className="w-24 h-[114px] object-cover rounded-xl bg-muted/20" />
                    <div className="flex-1 flex flex-col justify-between py-1 overflow-hidden relative">
                      <button onClick={() => removeFromCart(item.cartId)} className="absolute top-0 right-0 p-1.5 text-text-muted hover:text-error bg-background rounded-full border border-border/50 transition-colors active:scale-90">
                        <Trash2 size={14} />
                      </button>
                      <div>
                        <h3 className="text-[15px] font-bold truncate leading-tight pr-8 text-primary">{item.product.name}</h3>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mt-1.5">Size: <span className="text-primary">{item.selectedSize}</span></p>
                        {selectedColor && <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mt-1">Color: <span className="text-primary">{selectedColor.name}</span></p>}
                        <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mt-1">Stock limit: <span className="text-primary">{maxQty}</span></p>
                      </div>
                      <div className="flex items-center justify-between gap-3 mt-3">
                        <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-2 py-1">
                          <button onClick={() => updateCartItemQty(item.cartId, item.qty - 1)} className="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-muted/10">
                            <Minus size={15} />
                          </button>
                          <span className="text-[14px] font-bold text-primary min-w-[20px] text-center">{item.qty}</span>
                          <button onClick={() => updateCartItemQty(item.cartId, item.qty + 1)} disabled={item.qty >= maxQty} className={`w-8 h-8 rounded-full flex items-center justify-center ${item.qty >= maxQty ? 'text-text-muted cursor-not-allowed' : 'text-primary hover:bg-muted/10'}`}>
                            <Plus size={15} />
                          </button>
                        </div>
                        <div className="text-[15px] font-bold text-accent-gold tracking-tight">{formatPrice(item.finalPrice)}</div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          <div className="bg-surface rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-border/50 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-accent-gold" />
              <h3 className="font-serif font-bold text-[22px] tracking-tight">Order Summary</h3>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-[14px] font-medium tracking-wide">Subtotal ({cart.length} styles)</span>
              <span className="text-[15px] font-bold text-primary">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-[14px] font-medium tracking-wide">Shipping</span>
              <span className="text-[12px] font-bold uppercase tracking-wider text-success px-2 py-0.5 bg-success/10 rounded-md">Free</span>
            </div>
            <div className="rounded-[18px] bg-background border border-border/60 p-4 text-[13px] text-text-secondary leading-relaxed">
              You can adjust quantity here before checkout. Shipping address, phone confirmation, payment method, promo code, and notes are added in the next step.
            </div>
            <div className="border-t border-border/50 pt-5 mt-2 flex justify-between items-center">
              <span className="font-bold text-[15px] tracking-wide text-primary">Estimated Total</span>
              <span className="font-bold text-xl text-accent-gold tracking-tight">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-surface/95 backdrop-blur-md border-t border-border/50 p-5 px-6 pb-safe z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <button onClick={handlePlaceOrder} className="w-full bg-accent-gold text-white py-4 h-[56px] rounded-2xl font-bold text-center shadow-[0_8px_20px_rgba(184,149,42,0.3)] hover:bg-accent-gold/90 transition-all active:scale-[0.98] text-[15px] tracking-wide flex items-center justify-center gap-2">
            <ShoppingBag size={18} />
            Continue to Checkout
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default CartScreen



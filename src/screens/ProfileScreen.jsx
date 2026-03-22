import React, { useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Globe, HeadphonesIcon, Heart, Package, Settings, ShieldCheck, ChevronRight, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { formatPrice } from '../utils/formatPrice'

const ProfileScreen = () => {
  const { currentUser, becomeAdmin, orders, contactInfo, backendMode } = useContext(AppContext)
  const navigate = useNavigate()
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminUser, setAdminUser] = useState('')
  const [adminPass, setAdminPass] = useState('')
  const [loginError, setLoginError] = useState(false)

  const userOrders = orders.filter((order) => order.username === currentUser?.telegramId)

  const handleAdminLogin = (event) => {
    event.preventDefault()
    if (adminUser === 'admin' && adminPass === '1234') {
      becomeAdmin()
      setShowAdminLogin(false)
      setAdminUser('')
      setAdminPass('')
      setLoginError(false)
    } else {
      setLoginError(true)
    }
  }

  const openSupport = () => {
    window.open(`https://t.me/${contactInfo.telegram.replace('@', '')}`, '_blank')
  }

  const openPhone = () => {
    window.open(`tel:${contactInfo.phone.replace(/\s+/g, '')}`, '_self')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-40 bg-background min-h-screen">
      <header className="pt-6 pb-6 px-6 bg-surface border-b border-border/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-gold/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

        <div className="flex items-center space-x-5 relative z-10">
          <motion.button whileTap={{ scale: 0.95 }} className="w-[84px] h-[84px] bg-[#1A1A1A] text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-[0_8px_20px_rgba(0,0,0,0.15)] relative cursor-pointer active:scale-95 transition-transform border-[3px] border-surface overflow-hidden">
            {currentUser?.photoUrl ? (
              <img src={currentUser.photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1A1A1A] to-[#333] flex items-center justify-center">{currentUser?.firstName?.charAt(0) || 'U'}</div>
            )}
            {currentUser?.isAdmin && (
              <div className="absolute bottom-0 right-0 bg-accent-gold text-white p-1.5 rounded-full border-[3px] border-surface shadow-sm">
                <ShieldCheck size={14} strokeWidth={3} />
              </div>
            )}
          </motion.button>

          <div>
            <h2 className="text-[26px] font-serif font-bold text-[#1A1A1A] leading-tight tracking-tight">{currentUser?.firstName || 'Guest'} {currentUser?.lastName}</h2>
            <p className="text-[13px] font-bold uppercase tracking-widest text-text-secondary mt-1 px-2 py-0.5 bg-muted/10 rounded-md w-fit">@{currentUser?.telegramId}</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-gold mt-2">Backend: {backendMode}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-10 relative z-10 px-1">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-surface rounded-2xl p-5 border border-border/60 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex flex-col items-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-text-secondary mb-2">Total Spent</p>
            <p className="text-[16px] font-bold text-accent-gold tracking-tight">{formatPrice(currentUser?.totalSpent || 0)}</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="bg-surface rounded-2xl p-5 border border-border/60 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex flex-col items-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-text-secondary mb-2">Total Orders</p>
            <p className="text-[20px] font-bold text-[#1A1A1A] leading-none">{userOrders.length}</p>
          </motion.div>
        </div>
      </header>

      <div className="p-5 space-y-7 mt-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-3 pl-2">Account</h3>
          <div className="bg-surface rounded-[24px] border border-border/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
            <motion.button onClick={() => navigate('/user-orders')} whileHover={{ backgroundColor: 'rgba(192, 187, 181, 0.1)' }} whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-between p-4 px-5 bg-transparent transition-colors border-b border-border/50">
              <div className="flex items-center space-x-3 text-primary">
                <Package size={22} className="text-text-secondary" strokeWidth={1.5} />
                <span className="font-bold text-[15px]">My Orders</span>
              </div>
              <ChevronRight size={18} className="text-border" />
            </motion.button>

            <motion.button onClick={() => navigate('/wishlist')} whileHover={{ backgroundColor: 'rgba(192, 187, 181, 0.1)' }} whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-between p-4 px-5 bg-transparent transition-colors">
              <div className="flex items-center space-x-3 text-primary">
                <Heart size={22} className="text-text-secondary" strokeWidth={1.5} />
                <span className="font-bold text-[15px]">Wishlist</span>
              </div>
              <ChevronRight size={18} className="text-border" />
            </motion.button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-3 pl-2">Support & Settings</h3>
          <div className="bg-surface rounded-[24px] border border-border/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
            <motion.button onClick={openSupport} whileHover={{ backgroundColor: 'rgba(192, 187, 181, 0.1)' }} whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-between p-4 px-5 bg-transparent transition-colors border-b border-border/50">
              <div className="flex items-center space-x-3 text-primary">
                <HeadphonesIcon size={22} className="text-text-secondary" strokeWidth={1.5} />
                <div className="text-left">
                  <span className="font-bold text-[15px] block">Contact Support</span>
                  <span className="text-[12px] text-text-secondary">Telegram {contactInfo.telegram}</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-border" />
            </motion.button>

            <motion.button onClick={openPhone} whileHover={{ backgroundColor: 'rgba(192, 187, 181, 0.1)' }} whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-between p-4 px-5 bg-transparent transition-colors border-b border-border/50">
              <div className="flex items-center space-x-3 text-primary">
                <Globe size={22} className="text-text-secondary" strokeWidth={1.5} />
                <div className="text-left">
                  <span className="font-bold text-[15px] block">Call Boutique</span>
                  <span className="text-[12px] text-text-secondary">{contactInfo.phone}</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-border" />
            </motion.button>

            <motion.button whileHover={{ backgroundColor: 'rgba(192, 187, 181, 0.1)' }} whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-between p-4 px-5 bg-transparent transition-colors">
              <div className="flex items-center space-x-3 text-primary">
                <Settings size={22} className="text-text-secondary" strokeWidth={1.5} />
                <div className="text-left">
                  <span className="font-bold text-[15px] block">Realtime Sync</span>
                  <span className="text-[12px] text-text-secondary">Your bag, favorites, and checkout draft persist automatically.</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-border" />
            </motion.button>
          </div>
        </motion.div>

        {currentUser?.isAdmin && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-3 pl-2">Administration</h3>
            <motion.button onClick={() => navigate('/admin')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(184,149,42,0.26),_transparent_42%),linear-gradient(135deg,_#171717,_#0F0F0F)] px-5 py-4 text-white shadow-[0_14px_32px_rgba(0,0,0,0.22)] active:scale-95 transition-all outline-none">
              <div className="flex items-center space-x-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent-gold/30 bg-accent-gold/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <ShieldCheck size={22} className="text-accent-gold" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-accent-gold/90">Control Center</p>
                  <p className="text-[17px] font-bold tracking-wide text-white">Open Admin Studio</p>
                  <p className="mt-1 text-[12px] text-white/60">Manage orders, products, stock and live promotions.</p>
                </div>
              </div>
              <ChevronRight size={20} className="shrink-0 text-white/50" />
            </motion.button>
          </motion.div>
        )}

        {!currentUser?.isAdmin && (
          <motion.button onClick={() => setShowAdminLogin(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full bg-muted/10 text-text-secondary p-4 rounded-[20px] font-bold text-[14px] transition-all hover:bg-muted/20 border border-border/50">
            <ShieldCheck size={18} className="inline mr-2" />
            Admin Access
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAdminLogin(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="relative w-full max-w-[430px] bg-background rounded-t-[32px] p-6 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.2)] border-t border-border/50 min-h-[50vh]">
              <div className="flex justify-between items-center mb-6 pt-2">
                <h2 className="font-serif font-bold text-[26px] text-[#1A1A1A] tracking-tight">Access Control</h2>
                <motion.button onClick={() => setShowAdminLogin(false)} whileTap={{ scale: 0.9 }} className="w-9 h-9 flex items-center justify-center bg-muted/20 text-[#1A1A1A] rounded-full hover:bg-muted/40 transition-colors shadow-sm">
                  <X size={18} strokeWidth={2.5} />
                </motion.button>
              </div>

              <div className="bg-muted/5 border border-border/40 p-5 rounded-2xl mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-accent-gold/10 rounded-full flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} className="text-accent-gold" />
                  </div>
                  <p className="text-[13px] font-medium text-text-secondary leading-relaxed">Administrative access allows inventory management and order oversight. Demo credentials: <span className="text-primary font-bold">admin / 1234</span></p>
                </div>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 pl-1">Sign-in ID</label>
                  <input type="text" value={adminUser} onChange={(event) => setAdminUser(event.target.value)} className={`w-full border-2 ${loginError ? 'border-error/50 bg-error/5' : 'border-border/50 bg-surface'} rounded-2xl px-4 py-4 focus:border-accent-gold focus:outline-none text-[15px] font-bold text-[#1A1A1A] shadow-inner transition-colors`} placeholder="E.g., admin" required />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 pl-1">Passcode</label>
                  <input type="password" value={adminPass} onChange={(event) => setAdminPass(event.target.value)} className={`w-full border-2 ${loginError ? 'border-error/50 bg-error/5 text-error' : 'border-border/50 bg-surface text-[#1A1A1A]'} rounded-2xl px-4 py-4 focus:border-accent-gold focus:outline-none text-[15px] font-bold shadow-inner tracking-widest font-mono transition-colors`} placeholder="••••" required />
                </div>

                {loginError && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="pl-1 pt-1 flex items-center space-x-2">
                    <X size={14} className="text-error" />
                    <p className="text-[11px] font-bold text-error uppercase tracking-widest">Invalid credentials. Try admin / 1234</p>
                  </motion.div>
                )}

                <div className="pt-6 pb-2">
                  <motion.button type="submit" whileTap={{ scale: 0.95 }} className="w-full py-4 h-[56px] rounded-2xl font-bold bg-[#1A1A1A] text-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:scale-95 transition-transform text-[15px] tracking-wide relative overflow-hidden group hover:bg-black">
                    <span className="relative z-10 transition-colors group-hover:text-accent-gold">Authenticate & Enter</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ProfileScreen


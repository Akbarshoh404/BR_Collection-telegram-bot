import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Heart, History, HeadphonesIcon, Settings, ShieldCheck, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { formatPrice } from '../utils/formatPrice';

const ProfileScreen = () => {
  const { currentUser, becomeAdmin, orders } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState(false);

  const userOrders = orders.filter(o => o.username === currentUser?.telegramId);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminUser === 'admin' && adminPass === '1234') {
      becomeAdmin();
      setShowAdminLogin(false);
    } else {
      setLoginError(true);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="pb-32 bg-background min-h-screen"
    >
      <header className="pt-8 pb-8 px-6 bg-surface border-b border-border/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-gold/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <div className="flex items-center space-x-5 relative z-10">
          <button className="w-[84px] h-[84px] bg-[#1A1A1A] text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-[0_8px_20px_rgba(0,0,0,0.15)] bg-gradient-to-br from-[#1A1A1A] to-[#333] relative cursor-pointer active:scale-95 transition-transform border-[3px] border-surface">
            {currentUser?.firstName?.charAt(0) || 'U'}
            {currentUser?.isAdmin && (
              <div className="absolute bottom-0 right-0 bg-accent-gold text-white p-1.5 rounded-full border-[3px] border-surface shadow-sm">
                <ShieldCheck size={14} strokeWidth={3} />
              </div>
            )}
          </button>
          <div>
            <h2 className="text-[26px] font-serif font-bold text-[#1A1A1A] leading-tight tracking-tight">{currentUser?.firstName || 'Guest'} {currentUser?.lastName}</h2>
            <p className="text-[13px] font-bold uppercase tracking-widest text-text-secondary mt-1 px-2 py-0.5 bg-muted/10 rounded-md w-fit">
              @{currentUser?.telegramId}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
          <div className="bg-background rounded-2xl p-4.5 border border-border/50 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Total Spent</p>
            <p className="text-xl font-bold text-accent-gold tracking-tight">{formatPrice(currentUser?.totalSpent || 0)}</p>
          </div>
          <div className="bg-background rounded-2xl p-4.5 border border-border/50 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Total Orders</p>
            <p className="text-xl font-bold text-[#1A1A1A]">{userOrders.length}</p>
          </div>
        </div>
      </header>

      <div className="p-5 space-y-7 mt-2">
        {/* Account Section */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-3 pl-2">Account</h3>
          <div className="bg-surface rounded-[24px] border border-border/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
            <button onClick={() => navigate('/user-orders')} className="w-full flex items-center justify-between p-4 px-5 bg-transparent hover:bg-muted/10 active:bg-muted/20 transition-colors border-b border-border/50">
              <div className="flex items-center space-x-3 text-primary">
                <Package size={22} className="text-text-secondary" strokeWidth={1.5} />
                <span className="font-bold text-[15px]">My Orders</span>
              </div>
              <ChevronRight size={18} className="text-border" />
            </button>
            <button onClick={() => navigate('/wishlist')} className="w-full flex items-center justify-between p-4 px-5 bg-transparent hover:bg-muted/10 active:bg-muted/20 transition-colors border-b border-border/50">
              <div className="flex items-center space-x-3 text-primary">
                <Heart size={22} className="text-text-secondary" strokeWidth={1.5} />
                <span className="font-bold text-[15px]">Wishlist</span>
              </div>
              <ChevronRight size={18} className="text-border" />
            </button>
            <button className="w-full flex items-center justify-between p-4 px-5 bg-transparent hover:bg-muted/10 active:bg-muted/20 transition-colors">
              <div className="flex items-center space-x-3 text-primary">
                <History size={22} className="text-text-secondary" strokeWidth={1.5} />
                <span className="font-bold text-[15px]">Recently Viewed</span>
              </div>
              <ChevronRight size={18} className="text-border" />
            </button>
          </div>
        </div>

        {/* System Options */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-3 pl-2">Support & Admin</h3>
          <div className="bg-surface rounded-[24px] border border-border/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 px-5 bg-transparent hover:bg-muted/10 active:bg-muted/20 transition-colors border-b border-border/50">
              <div className="flex items-center space-x-3 text-primary">
                <HeadphonesIcon size={22} className="text-text-secondary" strokeWidth={1.5} />
                <span className="font-bold text-[15px]">Contact Support</span>
              </div>
              <ChevronRight size={18} className="text-border" />
            </button>
            
            {!currentUser?.isAdmin && (
              <button 
                onClick={() => setShowAdminLogin(true)} 
                className="w-full flex items-center justify-between p-4 px-5 bg-transparent hover:bg-muted/10 active:bg-muted/20 transition-colors"
              >
                <div className="flex items-center space-x-3 text-primary">
                  <ShieldCheck size={22} className="text-text-secondary" strokeWidth={1.5} />
                  <span className="font-bold text-[15px]">Admin Authentication</span>
                </div>
                <ChevronRight size={18} className="text-border" />
              </button>
            )}
            
            {currentUser?.isAdmin && (
              <button 
                onClick={() => navigate('/admin')}
                className="w-full flex items-center justify-between p-4 px-5 bg-transparent hover:bg-muted/10 active:bg-muted/20 transition-colors"
              >
                <div className="flex items-center space-x-3 text-primary">
                  <Settings size={22} className="text-text-secondary" strokeWidth={1.5} />
                  <span className="font-bold text-[15px]">Open Store Builder</span>
                </div>
                <ChevronRight size={18} className="text-border" />
              </button>
            )}
          </div>
        </div>

        {/* Direct Admin Access Button (if already admin) */}
        {currentUser?.isAdmin && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
            <button 
              onClick={() => navigate('/admin')}
              className="w-full bg-[#1A1A1A] text-white p-4.5 h-[64px] rounded-[20px] flex items-center justify-between shadow-[0_8px_20px_rgba(0,0,0,0.2)] active:scale-95 transition-all outline-none"
            >
              <div className="flex items-center space-x-3">
                <ShieldCheck size={22} className="text-accent-gold" />
                <span className="font-bold text-[16px] tracking-wide text-white">Administrator Dashboard</span>
              </div>
              <ChevronRight size={18} className="text-white/50" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAdminLogin(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="relative w-full max-w-[430px] bg-background rounded-t-[32px] p-6 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.2)] border-t border-border/50 min-h-[50vh]">
              <div className="flex justify-between items-center mb-6 pt-2">
                <h2 className="font-serif font-bold text-[26px] text-[#1A1A1A] tracking-tight">Access Control</h2>
                <button onClick={() => setShowAdminLogin(false)} className="w-9 h-9 flex items-center justify-center bg-muted/20 text-[#1A1A1A] rounded-full hover:bg-muted/40 transition-colors shadow-sm">
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>
              
              <div className="bg-surface border border-border/60 p-4 rounded-2xl mb-6 shadow-sm">
                <p className="text-[13px] font-medium text-text-secondary leading-relaxed flex items-start space-x-3">
                  <ShieldCheck size={24} className="text-accent-gold shrink-0 mt-0.5" />
                  <span>Administrative credentials are required to modify the store catalog, review ledger orders, and manage global sales events.</span>
                </p>
              </div>
              
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 pl-1">Sign-in ID</label>
                  <input type="text" value={adminUser} onChange={e => setAdminUser(e.target.value)} className={`w-full border-2 ${loginError ? 'border-error/50 bg-error/5' : 'border-border/50 bg-surface'} rounded-2xl px-4 py-4 focus:border-accent-gold focus:outline-none text-[15px] font-bold text-[#1A1A1A] shadow-inner transition-colors`} placeholder="E.g., admin" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 pl-1">Passcode</label>
                  <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} className={`w-full border-2 ${loginError ? 'border-error/50 bg-error/5 text-error' : 'border-border/50 bg-surface text-[#1A1A1A]'} rounded-2xl px-4 py-4 focus:border-accent-gold focus:outline-none text-[15px] font-bold shadow-inner tracking-widest font-mono transition-colors`} placeholder="••••" required />
                </div>
                
                {loginError && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="pl-1 pt-1 flex items-center space-x-2">
                    <X size={14} className="text-error" />
                    <p className="text-[11px] font-bold text-error uppercase tracking-widest">Invalid credentials. Default: admin / 1234</p>
                  </motion.div>
                )}

                <div className="pt-6 pb-2">
                  <button type="submit" className="w-full py-4 h-[56px] rounded-2xl font-bold bg-[#1A1A1A] text-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:scale-95 transition-transform text-[15px] tracking-wide relative overflow-hidden group">
                    <span className="relative z-10 transition-colors group-hover:text-accent-gold">Authenticate & Enter</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </motion.div>
  );
};
export default ProfileScreen;

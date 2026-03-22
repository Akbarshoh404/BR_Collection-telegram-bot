import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';
import { telegram } from '../utils/telegram';
import { Search, X } from 'lucide-react';

const HomeScreen = () => {
  const { products, categories, saleActive, saleMessage, salePercent, currentUser } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (telegram?.BackButton) telegram.BackButton.hide();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeTab === 'all' || p.category === activeTab;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="pb-24 bg-background"
    >
      {/* Sleek Custom Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-border/50 px-5 py-4 pb-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-0.5">Welcome, {currentUser?.firstName}</span>
            <h1 className="font-serif text-[26px] font-bold leading-none tracking-tight text-[#1A1A1A]">BR Collection</h1>
          </div>
          <div onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-border/40 flex items-center justify-center text-[#1A1A1A] shadow-sm hover:bg-border/60 transition-colors cursor-pointer overflow-hidden">
            {currentUser?.photoUrl ? (
              <img src={currentUser.photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="font-serif font-bold text-lg">B&R</span>
            )}
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search size={18} className="text-text-muted" strokeWidth={2.5} />
          </div>
          <input 
            type="text" 
            placeholder="Search premium menswear..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/10 border border-transparent rounded-[16px] py-3 pl-10 pr-10 text-[14px] font-bold text-[#1A1A1A] placeholder-text-muted focus:bg-white focus:border-accent-gold focus:ring-[3px] focus:ring-accent-gold/20 outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-[#1A1A1A] transition-colors">
              <X size={18} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </header>
      
      {saleActive && !searchQuery && (
        <motion.div 
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="bg-accent-gold/10 border-b border-accent-gold/20 py-2.5 px-4 text-center overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/20 to-transparent w-1/2 -skew-x-12 translate-x-[-150%] animate-[shimmer_3s_infinite]" />
          <span className="text-accent-gold font-extrabold text-[11px] uppercase tracking-widest">
            {saleMessage} (-{salePercent}%)
          </span>
        </motion.div>
      )}

      {/* Discovery / Banner Area (Hide if searching) */}
      {!searchQuery && (
        <div className="px-5 pt-6 pb-2">
          <div className="bg-[#1A1A1A] text-white rounded-[24px] p-6 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.15)] h-[170px] flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent-gold/20 rounded-full blur-3xl -mr-20 -mt-20" />
            <img src="https://picsum.photos/seed/BannersBR/600/400" alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" />
            
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent-gold mb-2 block relative z-10 drop-shadow-sm">New Season</span>
            <h2 className="font-serif text-[26px] font-bold leading-[1.1] mb-5 w-[75%] relative z-10 text-white drop-shadow-md">The Summer Tailoring Collection</h2>
            <button onClick={() => setActiveTab('cat_1')} className="bg-white text-[#1A1A1A] px-5 py-2.5 rounded-xl font-bold text-[12px] uppercase tracking-wider shadow-md active:scale-95 transition-transform relative z-10 w-fit">
              Shop Now
            </button>
          </div>
        </div>
      )}

      {/* Categories Horizontal Scroll */}
      <div className="px-5 py-6">
        <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 min-w-max -mx-5 px-5 pt-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex flex-col items-center justify-center space-y-2 px-6 py-4 rounded-2xl min-w-[95px] transition-all duration-300 ${activeTab === 'all' ? 'bg-[#1A1A1A] text-white shadow-[0_8px_15px_rgba(26,26,26,0.3)] scale-[1.02]' : 'bg-surface border border-border/80 text-text-secondary hover:bg-border/30 shadow-sm'}`}
          >
            <span className="text-xl">✨</span>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === 'all' ? 'text-white' : 'text-text-secondary'}`}>All</span>
          </button>
          
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex flex-col items-center justify-center space-y-2 px-6 py-4 rounded-[20px] min-w-[95px] transition-all duration-300 ${activeTab === cat.id ? 'bg-[#1A1A1A] text-white shadow-[0_8px_15px_rgba(26,26,26,0.3)] scale-[1.02]' : 'bg-surface border border-border/80 text-text-secondary hover:bg-border/30 shadow-sm'}`}
            >
              <span className={`text-[26px] ${activeTab === cat.id ? '' : 'grayscale-[0.2]'}`}>{cat.icon}</span>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === cat.id ? 'text-white' : 'text-text-secondary'}`}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 flex items-center justify-between mb-4">
        <h2 className="font-serif text-[20px] font-bold text-[#1A1A1A] tracking-tight">{searchQuery ? 'Search Results' : 'Explore Products'}</h2>
        {!searchQuery && <span className="text-[11px] font-bold text-accent-gold uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity">Filter</span>}
      </div>

      {/* Grid */}
      <div className="px-4 grid grid-cols-2 gap-3.5 pb-6">
        <AnimatePresence>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </AnimatePresence>
        
        {filteredProducts.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center bg-surface border border-border/50 rounded-[24px] shadow-sm">
            <Search size={32} className="text-border mb-3" />
            <h3 className="font-serif font-bold text-lg mb-1">No matches found</h3>
            <p className="text-[13px] text-text-secondary px-4">Try adjusting your search criteria and explore our categories.</p>
          </div>
        )}
      </div>

    </motion.div>
  );
};
export default HomeScreen;

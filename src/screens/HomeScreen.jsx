import React, { useContext, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

const HomeScreen = () => {
  const { products, categories, saleActive, saleMessage, salePercent } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    let result = products;

    if (activeTab !== 'all') {
      result = result.filter(p => p.category === activeTab);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [products, activeTab, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="pb-safe bg-background min-h-screen"
    >
      {/* Header with Search */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-border/50 px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-[28px] font-bold tracking-tight text-primary"
          >
            BR Collection
          </motion.h1>
          <div className="w-10 h-10 rounded-full bg-accent-gold/10 flex items-center justify-center">
            <span className="text-lg">✨</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/10 border border-border/50 rounded-2xl pl-10 pr-10 py-3 text-[14px] font-medium text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-gold transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-[#1A1A1A] transition-colors">
              <X size={18} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </header>

      {/* Flash Sale Banner */}
      {saleActive && !searchQuery && (
        <motion.div
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-accent-gold/15 to-accent-gold/5 border-b border-accent-gold/20 py-3.5 px-4 text-center overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/20 to-transparent w-1/2 -skew-x-12 translate-x-[-150%] animate-[shimmer_3s_infinite]" />
          <span className="text-accent-gold font-extrabold text-[12px] uppercase tracking-widest relative z-10 drop-shadow-sm">
            🎉 {saleMessage} (-{salePercent}%)
          </span>
        </motion.div>
      )}

      {/* Discovery / Banner Area */}
      {!searchQuery && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-5 pt-6 pb-2"
        >
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] text-white rounded-[28px] p-6 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.15)] h-[170px] flex flex-col justify-center border border-white/5">
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent-gold/20 rounded-full blur-3xl -mr-20 -mt-20" />
            <img src="https://picsum.photos/seed/BannersBR/600/400" alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent-gold mb-2 block relative z-10 drop-shadow-sm">New Season</span>
            <h2 className="font-serif text-[26px] font-bold leading-[1.1] mb-5 w-[75%] relative z-10 text-white drop-shadow-md">The Summer Tailoring Collection</h2>
            <motion.button 
              onClick={() => setActiveTab('cat_1')}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-[#1A1A1A] px-5 py-2.5 rounded-xl font-bold text-[12px] uppercase tracking-wider shadow-md active:scale-95 transition-transform relative z-10 w-fit hover:bg-accent-gold hover:text-white"
            >
              Shop Now
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Categories Horizontal Scroll */}
      <div className="px-5 py-6">
        <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 min-w-max -mx-5 px-5 pt-1">
          <motion.button
            onClick={() => setActiveTab('all')}
            whileTap={{ scale: 0.95 }}
            className={`flex flex-col items-center justify-center space-y-2 px-6 py-4 rounded-2xl min-w-[95px] transition-all duration-300 ${activeTab === 'all' ? 'bg-[#1A1A1A] text-white shadow-[0_8px_15px_rgba(26,26,26,0.3)] scale-[1.02]' : 'bg-surface border border-border/80 text-text-secondary hover:bg-border/30 shadow-sm'}`}
          >
            <span className="text-xl">✨</span>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === 'all' ? 'text-white' : 'text-text-secondary'}`}>All</span>
          </motion.button>
          {categories.map(cat => (
            <motion.button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center justify-center space-y-2 px-6 py-4 rounded-[20px] min-w-[95px] transition-all duration-300 ${activeTab === cat.id ? 'bg-[#1A1A1A] text-white shadow-[0_8px_15px_rgba(26,26,26,0.3)] scale-[1.02]' : 'bg-surface border border-border/80 text-text-secondary hover:bg-border/30 shadow-sm'}`}
            >
              <span className={`text-[26px] ${activeTab === cat.id ? '' : 'grayscale-[0.2]'}`}>{cat.icon}</span>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === cat.id ? 'text-white' : 'text-text-secondary'}`}>{cat.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Section Header */}
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

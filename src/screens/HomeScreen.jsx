import React, { useContext, useDeferredValue, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, MessageCircle, Search, ShieldCheck, SlidersHorizontal, Truck, X } from 'lucide-react'
import { AppContext } from '../context/AppContext'
import ProductCard from '../components/ProductCard'
import { formatPrice } from '../utils/formatPrice'

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price Low-High' },
  { value: 'price-desc', label: 'Price High-Low' },
  { value: 'best-selling', label: 'Best Selling' },
  { value: 'rating', label: 'Top Rated' },
]

const HomeScreen = () => {
  const {
    products,
    categories,
    saleActive,
    saleMessage,
    salePercent,
    getProductPrice,
    featuredCollections,
    bestSellers,
    newArrivals,
    recentlyViewed,
    faq,
    policies,
    contactInfo,
  } = useContext(AppContext)

  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('featured')
  const [stockOnly, setStockOnly] = useState(false)
  const [saleOnly, setSaleOnly] = useState(false)
  const [collectionFilter, setCollectionFilter] = useState('all')

  const deferredSearch = useDeferredValue(searchQuery)
  const maxPrice = useMemo(
    () => Math.max(...products.map((product) => getProductPrice(product)), 0),
    [getProductPrice, products],
  )
  const [priceCap, setPriceCap] = useState(maxPrice)

  React.useEffect(() => {
    setPriceCap((current) => (current > maxPrice ? maxPrice : current || maxPrice))
  }, [maxPrice])

  const filteredProducts = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase()

    let result = products.filter((product) => {
      const matchesTab = activeTab === 'all' || product.category === activeTab
      const matchesCollection = collectionFilter === 'all' || product.featuredCollection === collectionFilter
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.material?.toLowerCase().includes(query)
      const matchesStock = !stockOnly || product.stock > 0
      const matchesSale = !saleOnly || saleActive || product.sale > 0
      const matchesPrice = getProductPrice(product) <= priceCap

      return matchesTab && matchesCollection && matchesSearch && matchesStock && matchesSale && matchesPrice
    })

    switch (sortBy) {
      case 'newest':
        result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case 'price-asc':
        result = [...result].sort((a, b) => getProductPrice(a) - getProductPrice(b))
        break
      case 'price-desc':
        result = [...result].sort((a, b) => getProductPrice(b) - getProductPrice(a))
        break
      case 'best-selling':
        result = [...result].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
        break
      case 'rating':
        result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      default:
        result = [...result].sort((a, b) => {
          const featuredScoreA = (a.badges?.includes('best-seller') ? 2 : 0) + (a.badges?.includes('new') ? 1 : 0)
          const featuredScoreB = (b.badges?.includes('best-seller') ? 2 : 0) + (b.badges?.includes('new') ? 1 : 0)
          return featuredScoreB - featuredScoreA
        })
        break
    }

    return result
  }, [activeTab, collectionFilter, deferredSearch, getProductPrice, priceCap, products, saleActive, saleOnly, sortBy, stockOnly])

  const recentlyViewedProducts = recentlyViewed
    .map((productId) => products.find((product) => product.id === productId))
    .filter(Boolean)

  const featuredInsights = [
    {
      title: 'Fast Delivery',
      body: policies.shipping,
      icon: <Truck size={18} />,
    },
    {
      title: 'Easy Exchanges',
      body: policies.returns,
      icon: <ShieldCheck size={18} />,
    },
    {
      title: 'Concierge Support',
      body: `Telegram ${contactInfo.telegram} or call ${contactInfo.phone}.`,
      icon: <MessageCircle size={18} />,
    },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-safe bg-background min-h-screen">
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl border-b border-border/50 px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-accent-gold">BR Collection</p>
            <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-[28px] font-bold tracking-tight text-primary">
              Refined Telegram Shopping
            </motion.h1>
          </div>
          <div className="w-11 h-11 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold shadow-inner border border-accent-gold/10">
            ?
          </div>
        </div>

        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search by product, fabric, or mood"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full bg-muted/10 border border-border/50 rounded-2xl pl-10 pr-20 py-3 text-[14px] font-medium text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-gold transition-colors"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-primary transition-colors">
                <X size={16} strokeWidth={2.5} />
              </button>
            )}
            <button
              onClick={() => setShowFilters((value) => !value)}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors ${showFilters ? 'bg-primary text-white border-primary' : 'bg-surface text-primary border-border/60'}`}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>
      </header>

      {saleActive && !searchQuery && (
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-gradient-to-r from-accent-gold/15 to-accent-gold/5 border-b border-accent-gold/20 py-3.5 px-4 text-center overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/20 to-transparent w-1/2 -skew-x-12 translate-x-[-150%] animate-[shimmer_3s_infinite]" />
          <span className="text-accent-gold font-extrabold text-[12px] uppercase tracking-widest relative z-10 drop-shadow-sm">
            ?? {saleMessage} (-{salePercent}%)
          </span>
        </motion.div>
      )}

      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-border/50 bg-surface">
            <div className="px-5 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="rounded-2xl border border-border/60 bg-background p-3 text-[12px] font-bold text-text-secondary">
                  <span className="block mb-2 uppercase tracking-widest text-[10px]">Sort</span>
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="w-full bg-transparent text-primary text-[13px] font-bold outline-none">
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <div className="rounded-2xl border border-border/60 bg-background p-3">
                  <span className="block mb-2 uppercase tracking-widest text-[10px] font-bold text-text-secondary">Price Cap</span>
                  <input type="range" min="0" max={maxPrice || 1} step="10000" value={priceCap} onChange={(event) => setPriceCap(Number(event.target.value))} className="w-full accent-[#B8952A]" />
                  <p className="text-[13px] font-bold text-primary mt-2">Up to {formatPrice(priceCap || maxPrice)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => setStockOnly((value) => !value)} className={`px-4 py-2 rounded-full text-[12px] font-bold border transition-colors ${stockOnly ? 'bg-primary text-white border-primary' : 'bg-background text-primary border-border/60'}`}>
                  In Stock Only
                </button>
                <button onClick={() => setSaleOnly((value) => !value)} className={`px-4 py-2 rounded-full text-[12px] font-bold border transition-colors ${saleOnly ? 'bg-accent-gold text-white border-accent-gold' : 'bg-background text-primary border-border/60'}`}>
                  Sale Only
                </button>
                <button onClick={() => { setCollectionFilter('all'); setStockOnly(false); setSaleOnly(false); setPriceCap(maxPrice); setSortBy('featured'); }} className="px-4 py-2 rounded-full text-[12px] font-bold border border-border/60 bg-background text-primary">
                  Reset Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!searchQuery && (
        <section className="px-5 pt-6 pb-2 space-y-4">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(184,149,42,0.22),_transparent_35%),linear-gradient(135deg,_#151515,_#222_65%,_#2F2A20)] text-white rounded-[30px] p-6 relative overflow-hidden shadow-[0_16px_34px_rgba(0,0,0,0.18)] min-h-[190px] border border-white/5">
            <img src={featuredCollections[0]?.cover} alt="Featured collection" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen" />
            <div className="relative z-10 max-w-[70%]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent-gold mb-2 block">Curated Drop</span>
              <h2 className="font-serif text-[28px] font-bold leading-[1.02] mb-3">Collections designed for confident dressing.</h2>
              <p className="text-[13px] text-white/75 leading-relaxed mb-4">Discover best sellers, fresh arrivals, and clean tailoring essentials built for Telegram-native shopping.</p>
              <button onClick={() => setCollectionFilter(featuredCollections[0]?.name || 'all')} className="bg-white text-primary px-5 py-2.5 rounded-xl font-bold text-[12px] uppercase tracking-wider shadow-md inline-flex items-center gap-2">
                Explore Collection
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {featuredCollections.map((collection) => (
              <button key={collection.name} onClick={() => setCollectionFilter(collection.name)} className={`min-w-[220px] rounded-[24px] p-4 text-left border transition-all ${collectionFilter === collection.name ? 'bg-primary text-white border-primary shadow-[0_10px_24px_rgba(0,0,0,0.12)]' : 'bg-surface border-border/60 text-primary'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-[0.28em] ${collectionFilter === collection.name ? 'text-accent-gold' : 'text-text-secondary'}`}>{collection.items.length} styles</p>
                <h3 className="font-serif text-[22px] font-bold mt-2">{collection.name}</h3>
                <p className={`text-[12px] mt-2 leading-relaxed ${collectionFilter === collection.name ? 'text-white/70' : 'text-text-secondary'}`}>{collection.description}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="px-5 py-6">
        <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 min-w-max -mx-5 px-5 pt-1">
          <motion.button onClick={() => setActiveTab('all')} whileTap={{ scale: 0.95 }} className={`flex flex-col items-center justify-center space-y-2 px-6 py-4 rounded-2xl min-w-[95px] transition-all duration-300 ${activeTab === 'all' ? 'bg-[#1A1A1A] text-white shadow-[0_8px_15px_rgba(26,26,26,0.3)] scale-[1.02]' : 'bg-surface border border-border/80 text-text-secondary hover:bg-border/30 shadow-sm'}`}>
            <span className="text-xl">?</span>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === 'all' ? 'text-white' : 'text-text-secondary'}`}>All</span>
          </motion.button>
          {categories.map((category) => (
            <motion.button key={category.id} onClick={() => setActiveTab(category.id)} whileTap={{ scale: 0.95 }} className={`flex flex-col items-center justify-center space-y-2 px-6 py-4 rounded-[20px] min-w-[110px] transition-all duration-300 ${activeTab === category.id ? 'bg-[#1A1A1A] text-white shadow-[0_8px_15px_rgba(26,26,26,0.3)] scale-[1.02]' : 'bg-surface border border-border/80 text-text-secondary hover:bg-border/30 shadow-sm'}`}>
              <span className="text-[26px]">{category.icon}</span>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${activeTab === category.id ? 'text-white' : 'text-text-secondary'}`}>{category.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-5 flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-[22px] font-bold text-primary tracking-tight">{searchQuery ? 'Search Results' : 'Discover the Edit'}</h2>
          <p className="text-[12px] text-text-secondary mt-1">{filteredProducts.length} pieces ready to shop</p>
        </div>
        <span className="text-[11px] font-bold text-accent-gold uppercase tracking-widest">{sortOptions.find((option) => option.value === sortBy)?.label}</span>
      </div>

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
            <p className="text-[13px] text-text-secondary px-4">Try another fabric, collection, or price range to uncover more looks.</p>
          </div>
        )}
      </div>

      {!searchQuery && (
        <div className="space-y-8 pb-8">
          {bestSellers.length > 0 && (
            <section className="px-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-[22px] font-bold text-primary">Best Sellers</h3>
                <span className="text-[11px] font-bold uppercase tracking-widest text-text-secondary">Most Ordered</span>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                {bestSellers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}

          {newArrivals.length > 0 && (
            <section className="px-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-[22px] font-bold text-primary">New Arrivals</h3>
                <span className="text-[11px] font-bold uppercase tracking-widest text-accent-gold">Fresh Drop</span>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}

          {recentlyViewedProducts.length > 0 && (
            <section className="px-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-[22px] font-bold text-primary">Recently Viewed</h3>
                <span className="text-[11px] font-bold uppercase tracking-widest text-text-secondary">Continue Browsing</span>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                {recentlyViewedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}

          <section className="px-5">
            <div className="grid gap-3">
              {featuredInsights.map((item) => (
                <div key={item.title} className="rounded-[24px] border border-border/60 bg-surface p-4 shadow-[0_8px_22px_rgba(0,0,0,0.03)] flex gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-accent-gold/10 text-accent-gold flex items-center justify-center shrink-0">{item.icon}</div>
                  <div>
                    <h4 className="font-bold text-[15px] text-primary">{item.title}</h4>
                    <p className="text-[13px] text-text-secondary leading-relaxed mt-1">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="px-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-[22px] font-bold text-primary">FAQ</h3>
              <span className="text-[11px] font-bold uppercase tracking-widest text-text-secondary">Confidence Layer</span>
            </div>
            {faq.map((item) => (
              <div key={item.question} className="rounded-[22px] border border-border/60 bg-surface p-4 shadow-[0_8px_22px_rgba(0,0,0,0.03)]">
                <h4 className="font-bold text-[15px] text-primary">{item.question}</h4>
                <p className="text-[13px] text-text-secondary leading-relaxed mt-2">{item.answer}</p>
              </div>
            ))}
          </section>
        </div>
      )}
    </motion.div>
  )
}

export default HomeScreen


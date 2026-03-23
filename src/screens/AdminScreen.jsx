import React, { useContext, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowUp, ChevronLeft, Edit2, ImagePlus, Package, Plus, ShieldCheck, Tags, TrendingUp, TriangleAlert, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { formatPrice } from '../utils/formatPrice'
import { telegram } from '../utils/telegram'
import { getProductImage } from '../utils/productMedia'
import { getCategoryGlyph } from '../utils/iconMaps'

const parseList = (value) => value.split(',').map((item) => item.trim()).filter(Boolean)

const normalizeImageUrl = (value) => {
  const raw = value.trim()
  if (!raw) {
    return ''
  }

  const driveMatch = raw.match(/file\/d\/([^/]+)/i)
  if (driveMatch?.[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`
  }

  const openMatch = raw.match(/[?&]id=([^&]+)/i)
  if (/drive\.google\.com/i.test(raw) && openMatch?.[1]) {
    return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`
  }

  return raw
}


const AdminScreen = () => {
  const {
    products,
    setProducts,
    orders,
    categories,
    setCategories,
    homeBanners,
    setHomeBanners,
    promos,
    setPromos,
    saleActive,
    setSaleActive,
    salePercent,
    setSalePercent,
    saleMessage,
    setSaleMessage,
    currentUser,
  } = useContext(AppContext)
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productSearch, setProductSearch] = useState('')
  const [productFormData, setProductFormData] = useState({
    name: '',
    category: categories[0]?.id || '',
    price: '',
    description: '',
    sale: 0,
    stock: 0,
    sizes: 'S, M, L, XL',
    sizeStock: 'S:0, M:0, L:0, XL:0',
    material: '',
    deliveryEstimate: '',
    careInstructions: 'Dry clean only',
    image: '',
    imageUpload: '',
    colors: 'Black:#1B1B1D',
    badges: 'best-seller',
    featuredCollection: 'Core Essentials',
  })

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [categoryFormData, setCategoryFormData] = useState({ name: '', icon: '?', description: '' })
  const [bannerFormData, setBannerFormData] = useState({
    eyebrow: '',
    title: '',
    subtitle: '',
    cta: '',
    targetCollection: '',
    image: '',
  })
  const [promoFormData, setPromoFormData] = useState({
    code: '',
    type: 'percent',
    value: 10,
    minTotal: 0,
    description: '',
  })

  useEffect(() => {
    if (currentUser && !currentUser.isAdmin) {
      navigate('/')
    }

    if (telegram?.BackButton) {
      telegram.BackButton.show()
      const handleBack = () => navigate(-1)
      telegram.BackButton.onClick(handleBack)
      return () => telegram.BackButton.offClick(handleBack)
    }

    return undefined
  }, [currentUser, navigate])

  const stats = useMemo(() => ({
    products: products.length,
    orders: orders.length,
    newOrders: orders.filter((order) => order.status === 'New').length,
    revenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
  }), [orders, products.length])

  const lowStockProducts = useMemo(() => products.filter((product) => product.stock > 0 && product.stock <= 5), [products])

  const topProducts = useMemo(
    () => [...products].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 4),
    [products],
  )

  const categoryAnalytics = useMemo(() => categories.map((category) => {
    const categoryProducts = products.filter((product) => product.category === category.id)
    const categoryRevenue = orders.reduce((sum, order) => {
      return sum + order.items.filter((item) => item.product.category === category.id).reduce((inner, item) => inner + item.finalPrice, 0)
    }, 0)

    return {
      ...category,
      productCount: categoryProducts.length,
      revenue: categoryRevenue,
    }
  }), [categories, orders, products])

  const dateAnalytics = useMemo(() => {
    const buckets = new Map()

    orders.forEach((order) => {
      const dateKey = new Date(order.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      buckets.set(dateKey, (buckets.get(dateKey) || 0) + (order.totalAmount || 0))
    })

    return [...buckets.entries()].slice(-5)
  }, [orders])

  const filteredProducts = products.filter((product) =>
    [product.name, product.material, product.featuredCollection]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(productSearch.toLowerCase())),
  )

  const handleDeleteProduct = (id) => {
    if (window.confirm('Delete this product from the store?')) {
      setProducts((prev) => prev.filter((product) => product.id !== id))
    }
  }

  const handleOpenProductEdit = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setProductFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description,
        sale: product.sale,
        stock: product.stock,
        sizes: product.sizes.join(', '),
        sizeStock: Object.entries(product.sizeStock || {}).map(([size, qty]) => `${size}:${qty}`).join(', '),
        material: product.material || '',
        deliveryEstimate: product.deliveryEstimate || '',
        careInstructions: (product.careInstructions || []).join(', '),
        image: product.image || '',
        imageUpload: '',
        colors: (product.colors || []).map((color) => `${color.name}:${color.hex}`).join(', '),
        badges: (product.badges || []).join(', '),
        featuredCollection: product.featuredCollection || 'Core Essentials',
      })
    } else {
      setEditingProduct(null)
      setProductFormData({
        name: '',
        category: categories[0]?.id || '',
        price: '',
        description: '',
        sale: 0,
        stock: 0,
        sizes: 'S, M, L, XL',
        sizeStock: 'S:0, M:0, L:0, XL:0',
        material: '',
        deliveryEstimate: '',
        careInstructions: 'Dry clean only',
        image: '',
        imageUpload: '',
        colors: 'Black:#1B1B1D',
        badges: 'new',
        featuredCollection: 'Core Essentials',
      })
    }

    setIsProductModalOpen(true)
  }

  const handleImageLinkChange = (value) => {
    const normalized = normalizeImageUrl(value)
    setProductFormData((prev) => ({
      ...prev,
      image: normalized,
      imageUpload: normalized,
    }))
  }

  const handleSaveProduct = (event) => {
    event.preventDefault()

    const sizes = parseList(productFormData.sizes)
    const sizeStock = parseList(productFormData.sizeStock).reduce((accumulator, chunk) => {
      const [size, qty] = chunk.split(':').map((item) => item.trim())
      if (size) {
        accumulator[size] = Number(qty || 0)
      }
      return accumulator
    }, {})
    const colors = parseList(productFormData.colors).map((chunk, index) => {
      const [name, hex = '#1B1B1D'] = chunk.split(':').map((item) => item.trim())
      return {
        id: `${name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
        name,
        hex,
        image: productFormData.imageUpload || productFormData.image || editingProduct?.image || '',
      }
    })

    const nextProduct = {
      ...(editingProduct || {}),
      id: editingProduct ? editingProduct.id : `p_${Date.now()}`,
      name: productFormData.name,
      category: productFormData.category,
      price: Number(productFormData.price),
      description: productFormData.description,
      sale: Number(productFormData.sale),
      stock: Number(productFormData.stock),
      sizes,
      sizeStock,
      material: productFormData.material,
      deliveryEstimate: productFormData.deliveryEstimate,
      careInstructions: parseList(productFormData.careInstructions),
      image: productFormData.imageUpload || productFormData.image,
      gallery: [productFormData.imageUpload || productFormData.image].filter(Boolean),
      colors,
      badges: parseList(productFormData.badges),
      featuredCollection: productFormData.featuredCollection,
      rating: editingProduct?.rating || 4.8,
      reviewsCount: editingProduct?.reviewsCount || 0,
      reviews: editingProduct?.reviews || [],
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      salesCount: editingProduct?.salesCount || 0,
      emoji: editingProduct?.emoji || getCategoryGlyph(productFormData.category),
    }

    setProducts((prev) => editingProduct ? prev.map((product) => (product.id === nextProduct.id ? nextProduct : product)) : [nextProduct, ...prev])
    setIsProductModalOpen(false)
  }

  const handleSaveCategory = (event) => {
    event.preventDefault()

    const nextCategory = {
      id: `cat_${Date.now()}`,
      name: categoryFormData.name,
      icon: categoryFormData.icon,
      description: categoryFormData.description,
    }

    setCategories((prev) => [...prev, nextCategory])
    setCategoryFormData({ name: '', icon: '?', description: '' })
    setIsCategoryModalOpen(false)
  }

  const moveCategory = (index, direction) => {
    setCategories((prev) => {
      const next = [...prev]
      const target = next[index]
      const swapIndex = index + direction
      if (!target || !next[swapIndex]) {
        return prev
      }
      next[index] = next[swapIndex]
      next[swapIndex] = target
      return next
    })
  }

  const handleSaveBanner = (event) => {
    event.preventDefault()

    const nextBanner = {
      id: `banner_${Date.now()}`,
      ...bannerFormData,
      image: normalizeImageUrl(bannerFormData.image),
      image: normalizeImageUrl(bannerFormData.image),
    }

    setHomeBanners((prev) => [nextBanner, ...(prev || [])].slice(0, 8))
    setBannerFormData({
      eyebrow: '',
      title: '',
      subtitle: '',
      cta: '',
      targetCollection: '',
      image: '',
    })
  }

  const handleDeleteBanner = (bannerId) => {
    setHomeBanners((prev) => prev.filter((banner) => banner.id !== bannerId))
  }

  const handleSavePromo = (event) => {
    event.preventDefault()

    const code = promoFormData.code.trim().toUpperCase()
    if (!code) {
      return
    }

    setPromos((prev) => ({
      ...prev,
      [code]: {
        type: promoFormData.type,
        value: Number(promoFormData.value),
        minTotal: Number(promoFormData.minTotal) || 0,
        description: promoFormData.description,
      },
    }))

    setPromoFormData({
      code: '',
      type: 'percent',
      value: 10,
      minTotal: 0,
      description: '',
    })
  }

  const handleDeletePromo = (code) => {
    setPromos((prev) => {
      const next = { ...prev }
      delete next[code]
      return next
    })
  }

  return (
    <motion.div initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '-30%', opacity: 0 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }} className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => navigate(-1)} className="text-text-primary p-2 -ml-2 rounded-full hover:bg-muted/10 transition-colors">
          <ChevronLeft size={24} strokeWidth={2} />
        </button>
        <h1 className="font-serif text-[20px] font-bold">Admin Studio</h1>
        <div className="w-8"></div>
      </header>

      <div className="bg-surface border-b border-border/50 px-4 py-3 flex justify-between space-x-2 shadow-[0_4px_10px_rgba(0,0,0,0.02)] sticky top-[60px] z-30">
        {['dashboard', 'products', 'categories', 'marketing'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'bg-transparent text-text-secondary border border-border/60 hover:bg-muted/10'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-6">
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface border border-border/60 rounded-[20px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center">
                <Package size={24} className="text-text-secondary mb-2" strokeWidth={1.5} />
                <div className="text-3xl font-bold text-primary tracking-tight">{stats.products}</div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-text-secondary mt-1">Products</div>
              </div>
              <div className="bg-surface border border-border/60 rounded-[20px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center">
                <Users size={24} className="text-text-secondary mb-2" strokeWidth={1.5} />
                <div className="text-3xl font-bold text-primary tracking-tight">{stats.orders}</div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-text-secondary mt-1">Orders</div>
              </div>
              <div className="bg-surface border border-border/60 rounded-[20px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center">
                <TriangleAlert size={24} className="text-error mb-2" strokeWidth={1.5} />
                <div className="text-3xl font-bold text-error tracking-tight">{lowStockProducts.length}</div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-error mt-1">Low Stock</div>
              </div>
              <div className="bg-surface border border-border/60 rounded-[20px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center">
                <TrendingUp size={24} className="text-success mb-2" strokeWidth={1.5} />
                <div className="text-xl font-bold text-success truncate w-full text-center tracking-tight">{formatPrice(stats.revenue)}</div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-success mt-1">Revenue</div>
              </div>
            </div>

            <div className="rounded-[28px] bg-surface border border-border/60 p-5 shadow-[0_10px_24px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-[24px] text-primary">Live promotion controls</h3>
                <button onClick={() => setSaleActive((value) => !value)} className={`px-4 py-2 rounded-full text-[12px] font-bold ${saleActive ? 'bg-primary text-white' : 'bg-background border border-border/60 text-primary'}`}>
                  {saleActive ? 'Sale Active' : 'Start Sale'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="rounded-[20px] border border-border/60 bg-background p-4 text-[12px] font-bold text-text-secondary">
                  <span className="block mb-2 uppercase tracking-widest text-[10px]">Discount Percent</span>
                  <input type="number" min="0" max="80" value={salePercent} onChange={(event) => setSalePercent(Number(event.target.value))} className="w-full bg-transparent text-primary text-[16px] font-bold outline-none" />
                </label>
                <label className="rounded-[20px] border border-border/60 bg-background p-4 text-[12px] font-bold text-text-secondary">
                  <span className="block mb-2 uppercase tracking-widest text-[10px]">Campaign Message</span>
                  <input value={saleMessage} onChange={(event) => setSaleMessage(event.target.value)} className="w-full bg-transparent text-primary text-[13px] font-bold outline-none" />
                </label>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[28px] bg-surface border border-border/60 p-5 shadow-[0_10px_24px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-2 mb-4"><TriangleAlert size={18} className="text-error" /><h3 className="font-serif font-bold text-[22px] text-primary">Low-stock alerts</h3></div>
                {lowStockProducts.length === 0 ? (
                  <p className="text-[13px] text-text-secondary">Everything looks healthy right now.</p>
                ) : (
                  <div className="space-y-3">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="rounded-[20px] border border-border/60 bg-background p-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-primary">{product.name}</p>
                          <p className="text-[12px] text-text-secondary mt-1">{product.stock} total left • {Object.entries(product.sizeStock || {}).map(([size, qty]) => `${size}:${qty}`).join(', ')}</p>
                        </div>
                        <button onClick={() => handleOpenProductEdit(product)} className="px-3 py-2 rounded-full bg-primary text-white text-[12px] font-bold">Restock</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-[28px] bg-surface border border-border/60 p-5 shadow-[0_10px_24px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-2 mb-4"><TrendingUp size={18} className="text-accent-gold" /><h3 className="font-serif font-bold text-[22px] text-primary">Analytics by product and category</h3></div>
                <div className="space-y-3 mb-5">
                  {topProducts.map((product) => (
                    <div key={product.id} className="rounded-[20px] border border-border/60 bg-background p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-primary">{product.name}</p>
                        <p className="text-[12px] text-text-secondary mt-1">{product.salesCount || 0} units sold</p>
                      </div>
                      <span className="text-[12px] font-bold text-accent-gold">{product.featuredCollection}</span>
                    </div>
                  ))}
                </div>
                <div className="grid gap-3">
                  {categoryAnalytics.map((category) => (
                    <div key={category.id} className="rounded-[20px] border border-border/60 bg-background p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-primary">{category.icon || getCategoryGlyph(category.id)} {category.name}</p>
                        <p className="text-[12px] text-text-secondary mt-1">{category.productCount} products</p>
                      </div>
                      <span className="text-[12px] font-bold text-success">{formatPrice(category.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] bg-surface border border-border/60 p-5 shadow-[0_10px_24px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-2 mb-4"><ShieldCheck size={18} className="text-accent-gold" /><h3 className="font-serif font-bold text-[22px] text-primary">Revenue by date</h3></div>
                <div className="grid gap-3">
                  {dateAnalytics.length === 0 ? (
                    <p className="text-[13px] text-text-secondary">Revenue will appear here after the first placed order.</p>
                  ) : (
                    dateAnalytics.map(([date, revenue]) => (
                      <div key={date} className="rounded-[20px] border border-border/60 bg-background p-4 flex items-center justify-between">
                        <span className="font-bold text-primary">{date}</span>
                        <span className="text-[12px] font-bold text-success">{formatPrice(revenue)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-5 gap-3">
              <input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search products, fabric, or collection" className="input-luxury flex-1 text-[14px]" />
              <button onClick={() => handleOpenProductEdit()} className="text-[12px] bg-primary text-white px-4 py-3 rounded-full font-bold flex items-center space-x-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.15)] active:scale-95 transition-all">
                <Plus size={16} strokeWidth={3} /> <span>Create</span>
              </button>
            </div>

            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-surface border border-border/60 rounded-[24px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center space-x-4 relative overflow-hidden">
                  <img src={getProductImage(product)} alt={product.name} className="w-[70px] h-[84px] object-cover rounded-2xl border border-border/40" />
                  <div className="flex-1 overflow-hidden pr-2">
                    <h4 className="text-[14px] font-bold truncate leading-tight text-primary">{product.name}</h4>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mt-1.5">{categories.find((category) => category.id === product.category)?.name || 'Misc'} • Stock: <span className={product.stock === 0 ? 'text-error' : 'text-success'}>{product.stock}</span></p>
                    <p className="text-[12px] text-text-secondary mt-1 truncate">{product.material}</p>
                    <p className="text-[13px] font-black tracking-tight text-accent-gold mt-1">{formatPrice(product.price)}</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button onClick={() => handleOpenProductEdit(product)} className="p-2 text-text-secondary hover:text-primary transition-colors bg-background rounded-xl border border-border/70 shadow-sm active:scale-90">
                      <Edit2 size={16} strokeWidth={2} />
                    </button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-text-secondary hover:text-error transition-colors bg-background rounded-xl border border-border/70 shadow-sm active:scale-90">
                      <Package size={16} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'categories' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-serif font-bold text-xl">Categories</h3>
              <button onClick={() => setIsCategoryModalOpen(true)} className="text-[12px] bg-primary text-white px-4 py-2 rounded-full font-bold flex items-center space-x-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.15)] active:scale-95 transition-all">
                <Plus size={16} strokeWidth={3} /> <span>Add</span>
              </button>
            </div>
            {categories.map((category, index) => (
              <div key={category.id} className="bg-surface border border-border/60 rounded-[22px] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border/60 flex items-center justify-center text-2xl">{category.icon || getCategoryGlyph(category.id)}</div>
                <div className="flex-1">
                  <p className="font-bold text-[15px] text-primary">{category.name}</p>
                  <p className="text-[12px] text-text-secondary mt-1">{category.description}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => moveCategory(index, -1)} className="w-9 h-9 rounded-xl border border-border/60 bg-background flex items-center justify-center text-primary"><ArrowUp size={16} /></button>
                  <button onClick={() => moveCategory(index, 1)} className="w-9 h-9 rounded-xl border border-border/60 bg-background flex items-center justify-center text-primary"><ArrowDown size={16} /></button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'marketing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="rounded-[28px] bg-surface border border-border/60 p-5 shadow-[0_10px_24px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-2 mb-4">
                <ImagePlus size={18} className="text-accent-gold" />
                <h3 className="font-serif font-bold text-[22px] text-primary">Homepage Carousel</h3>
              </div>
              <form onSubmit={handleSaveBanner} className="space-y-3">
                <input value={bannerFormData.eyebrow} onChange={(event) => setBannerFormData((prev) => ({ ...prev, eyebrow: event.target.value }))} className="input-luxury" placeholder="Eyebrow text" required />
                <input value={bannerFormData.title} onChange={(event) => setBannerFormData((prev) => ({ ...prev, title: event.target.value }))} className="input-luxury" placeholder="Banner title" required />
                <textarea value={bannerFormData.subtitle} onChange={(event) => setBannerFormData((prev) => ({ ...prev, subtitle: event.target.value }))} rows={3} className="input-luxury resize-none" placeholder="Banner subtitle" required />
                <div className="grid grid-cols-2 gap-3">
                  <input value={bannerFormData.cta} onChange={(event) => setBannerFormData((prev) => ({ ...prev, cta: event.target.value }))} className="input-luxury" placeholder="CTA label" required />
                  <input value={bannerFormData.targetCollection} onChange={(event) => setBannerFormData((prev) => ({ ...prev, targetCollection: event.target.value }))} className="input-luxury" placeholder="Target collection" required />
                </div>
                <input value={bannerFormData.image} onChange={(event) => setBannerFormData((prev) => ({ ...prev, image: normalizeImageUrl(event.target.value) }))} className="input-luxury" placeholder="Banner image URL or Google Drive share link" required />
                <button type="submit" className="w-full py-4 rounded-2xl bg-primary text-white font-bold">Add Banner</button>
              </form>
              <div className="mt-5 space-y-3">
                {homeBanners.map((banner) => (
                  <div key={banner.id} className="rounded-[20px] border border-border/60 bg-background p-4 flex items-center gap-3">
                    <img src={banner.image} alt={banner.title} className="w-16 h-16 rounded-2xl object-cover border border-border/50" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-accent-gold">{banner.eyebrow}</p>
                      <p className="font-bold text-primary truncate">{banner.title}</p>
                      <p className="text-[12px] text-text-secondary truncate">{banner.targetCollection}</p>
                    </div>
                    <button onClick={() => handleDeleteBanner(banner.id)} className="px-3 py-2 rounded-full border border-border/60 bg-surface text-primary text-[12px] font-bold">Delete</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] bg-surface border border-border/60 p-5 shadow-[0_10px_24px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-2 mb-4">
                <Tags size={18} className="text-accent-gold" />
                <h3 className="font-serif font-bold text-[22px] text-primary">Promo Codes</h3>
              </div>
              <form onSubmit={handleSavePromo} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input value={promoFormData.code} onChange={(event) => setPromoFormData((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))} className="input-luxury" placeholder="PROMO2026" required />
                  <select value={promoFormData.type} onChange={(event) => setPromoFormData((prev) => ({ ...prev, type: event.target.value }))} className="input-luxury appearance-none">
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed UZS</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" value={promoFormData.value} onChange={(event) => setPromoFormData((prev) => ({ ...prev, value: event.target.value }))} className="input-luxury" placeholder="Value" required />
                  <input type="number" value={promoFormData.minTotal} onChange={(event) => setPromoFormData((prev) => ({ ...prev, minTotal: event.target.value }))} className="input-luxury" placeholder="Min order total" />
                </div>
                <textarea value={promoFormData.description} onChange={(event) => setPromoFormData((prev) => ({ ...prev, description: event.target.value }))} rows={2} className="input-luxury resize-none" placeholder="Promo description" required />
                <button type="submit" className="w-full py-4 rounded-2xl bg-primary text-white font-bold">Save Promo</button>
              </form>
              <div className="mt-5 space-y-3">
                {Object.entries(promos).map(([code, promo]) => (
                  <div key={code} className="rounded-[20px] border border-border/60 bg-background p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-primary">{code}</p>
                      <p className="text-[12px] text-text-secondary mt-1">{promo.description}</p>
                      <p className="text-[12px] text-accent-gold mt-1">{promo.type === 'percent' ? `${promo.value}% off` : `${promo.value} UZS off`}{promo.minTotal ? ` • min ${formatPrice(promo.minTotal)}` : ''}</p>
                    </div>
                    <button onClick={() => handleDeletePromo(code)} className="px-3 py-2 rounded-full border border-border/60 bg-surface text-primary text-[12px] font-bold">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="relative w-full max-w-[430px] bg-background rounded-t-[32px] p-6 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.2)] h-[92vh] overflow-y-auto no-scrollbar border-t border-border/30">
              <h2 className="font-serif font-bold text-[24px] mb-6 tracking-tight text-primary">{editingProduct ? 'Edit Product' : 'Create Product'}</h2>
              <form onSubmit={handleSaveProduct} className="space-y-5 pb-8">
                <input type="text" value={productFormData.name} onChange={(event) => setProductFormData((prev) => ({ ...prev, name: event.target.value }))} className="input-luxury" placeholder="Product name" required />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" value={productFormData.price} onChange={(event) => setProductFormData((prev) => ({ ...prev, price: event.target.value }))} className="input-luxury" placeholder="Price" required />
                  <input type="number" value={productFormData.stock} onChange={(event) => setProductFormData((prev) => ({ ...prev, stock: event.target.value }))} className="input-luxury" placeholder="Stock" required />
                </div>
                <select value={productFormData.category} onChange={(event) => setProductFormData((prev) => ({ ...prev, category: event.target.value }))} className="input-luxury appearance-none">
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                <textarea value={productFormData.description} onChange={(event) => setProductFormData((prev) => ({ ...prev, description: event.target.value }))} rows={3} className="input-luxury resize-none" placeholder="Description" required />
                <input type="text" value={productFormData.material} onChange={(event) => setProductFormData((prev) => ({ ...prev, material: event.target.value }))} className="input-luxury" placeholder="Fabric / material" required />
                <input type="text" value={productFormData.deliveryEstimate} onChange={(event) => setProductFormData((prev) => ({ ...prev, deliveryEstimate: event.target.value }))} className="input-luxury" placeholder="Delivery estimate" required />
                <textarea value={productFormData.careInstructions} onChange={(event) => setProductFormData((prev) => ({ ...prev, careInstructions: event.target.value }))} rows={2} className="input-luxury resize-none" placeholder="Care instructions, comma separated" required />
                <input type="text" value={productFormData.sizes} onChange={(event) => setProductFormData((prev) => ({ ...prev, sizes: event.target.value }))} className="input-luxury" placeholder="Sizes, comma separated" required />
                <input type="text" value={productFormData.sizeStock} onChange={(event) => setProductFormData((prev) => ({ ...prev, sizeStock: event.target.value }))} className="input-luxury" placeholder="Size stock e.g. S:2, M:4" required />
                <input type="text" value={productFormData.colors} onChange={(event) => setProductFormData((prev) => ({ ...prev, colors: event.target.value }))} className="input-luxury" placeholder="Colors e.g. Black:#111111, Sand:#C8B291" required />
                <input type="text" value={productFormData.badges} onChange={(event) => setProductFormData((prev) => ({ ...prev, badges: event.target.value }))} className="input-luxury" placeholder="Badges, comma separated" />
                <input type="text" value={productFormData.featuredCollection} onChange={(event) => setProductFormData((prev) => ({ ...prev, featuredCollection: event.target.value }))} className="input-luxury" placeholder="Featured collection" />
                <input type="number" min="0" max="80" value={productFormData.sale} onChange={(event) => setProductFormData((prev) => ({ ...prev, sale: event.target.value }))} className="input-luxury" placeholder="Sale %" />
                <input type="text" value={productFormData.image} onChange={(event) => handleImageLinkChange(event.target.value)} className="input-luxury" placeholder="Image URL or Google Drive share link" />
                <div className="rounded-[24px] border border-dashed border-border/70 bg-surface p-4 text-[12px] font-medium text-text-secondary">Paste a direct image URL or a Google Drive share link. The app converts Drive links into a display-ready URL before saving to Firestore.</div>
                {(productFormData.imageUpload || productFormData.image) && (
                  <img src={productFormData.imageUpload || productFormData.image} alt="Preview" className="w-full h-[180px] object-cover rounded-[24px] border border-border/60" />
                )}
                <div className="pt-2 flex space-x-3">
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-[0.6] py-4 h-[56px] rounded-2xl font-bold bg-muted/20 text-text-primary active:scale-95 transition-transform text-[15px] tracking-wide">Cancel</button>
                  <button type="submit" className="flex-1 py-4 h-[56px] rounded-2xl font-bold bg-primary text-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:scale-95 transition-transform text-[15px] tracking-wide">{editingProduct ? 'Save Changes' : 'Create Product'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="relative w-full max-w-[430px] bg-background rounded-t-[32px] p-6 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] border-t border-border/30">
              <h2 className="font-serif font-bold text-[24px] mb-6 text-primary tracking-tight">Add Category</h2>
              <form onSubmit={handleSaveCategory} className="space-y-5">
                <input type="text" value={categoryFormData.icon} onChange={(event) => setCategoryFormData((prev) => ({ ...prev, icon: event.target.value }))} className="input-luxury" placeholder="Icon" required />
                <input type="text" value={categoryFormData.name} onChange={(event) => setCategoryFormData((prev) => ({ ...prev, name: event.target.value }))} className="input-luxury" placeholder="Category name" required />
                <textarea value={categoryFormData.description} onChange={(event) => setCategoryFormData((prev) => ({ ...prev, description: event.target.value }))} rows={3} className="input-luxury resize-none" placeholder="Category description" required />
                <button type="submit" className="w-full py-4 h-[56px] rounded-2xl font-bold bg-primary text-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:scale-95 transition-transform text-[15px]">Save</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AdminScreen



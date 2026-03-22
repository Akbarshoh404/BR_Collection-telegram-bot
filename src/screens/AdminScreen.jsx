import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Edit2, Trash2, Plus, TrendingUp, Package, Users, Tag, Box, LogOut, Tags } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { formatPrice } from '../utils/formatPrice';
import { telegram } from '../utils/telegram';

const AdminScreen = () => {
  const { 
    products, setProducts, orders, 
    categories, setCategories,
    saleActive, setSaleActive, 
    salePercent, setSalePercent, 
    saleMessage, setSaleMessage,
    currentUser, becomeAdmin
  } = useContext(AppContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | products | categories
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    name: '', category: categories[0]?.id || '', price: '', description: '', sale: 0, emoji: '👕', stock: 10
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', icon: '🌟' });

  useEffect(() => {
    if (!currentUser?.isAdmin) {
      navigate('/');
    }
    if (telegram?.BackButton) {
      telegram.BackButton.show();
      const handleBack = () => navigate(-1);
      telegram.BackButton.onClick(handleBack);
      return () => telegram.BackButton.offClick(handleBack);
    }
  }, [currentUser, navigate]);

  const stats = {
    products: products.length,
    orders: orders.length,
    newOrders: orders.filter(o => o.status === 'New').length,
    revenue: orders.filter(o => o.status === 'Done').reduce((sum, order) => {
      return sum + order.items.reduce((s, item) => s + item.finalPrice, 0);
    }, 0)
  };

  const handleDeleteProduct = (id) => {
    if(window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleOpenProductEdit = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductFormData({
        name: product.name, category: product.category, price: product.price,
        description: product.description, sale: product.sale, emoji: product.emoji, stock: product.stock || 0
      });
    } else {
      setEditingProduct(null);
      setProductFormData({ name: '', category: categories[0]?.id || '', price: '', description: '', sale: 0, emoji: '👕', stock: 10 });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    const newProduct = {
      id: editingProduct ? editingProduct.id : 'p_' + Date.now(),
      name: productFormData.name,
      category: productFormData.category,
      price: Number(productFormData.price),
      description: productFormData.description,
      sale: Number(productFormData.sale),
      emoji: productFormData.emoji,
      stock: Number(productFormData.stock),
      sizes: ["S", "M", "L", "XL"]
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === newProduct.id ? newProduct : p));
    } else {
      setProducts([newProduct, ...products]);
    }
    setIsProductModalOpen(false);
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    const newCat = {
      id: 'cat_' + Date.now(),
      name: categoryFormData.name,
      icon: categoryFormData.icon
    };
    setCategories([...categories, newCat]);
    setIsCategoryModalOpen(false);
  };

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '-30%', opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-background pb-20"
    >
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => navigate(-1)} className="text-text-primary p-2 -ml-2 rounded-full hover:bg-muted/10 transition-colors">
          <ChevronLeft size={24} strokeWidth={2} />
        </button>
        <h1 className="font-serif text-[20px] font-bold">Admin Panel</h1>
        <div className="w-8"></div>
      </header>

      {/* Tabs */}
      <div className="bg-surface border-b border-border/50 px-4 py-3 flex justify-between space-x-2 shadow-[0_4px_10px_rgba(0,0,0,0.02)] sticky top-[60px] z-30">
        {['dashboard', 'products', 'categories'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'bg-transparent text-text-secondary border border-border/60 hover:bg-muted/10'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-6">
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface border border-border/60 rounded-[20px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center">
                <Box size={24} className="text-text-secondary mb-2" strokeWidth={1.5} />
                <div className="text-3xl font-bold text-primary tracking-tight">{stats.products}</div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-text-secondary mt-1">Products</div>
              </div>
              <div className="bg-surface border border-border/60 rounded-[20px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center">
                <Package size={24} className="text-text-secondary mb-2" strokeWidth={1.5} />
                <div className="text-3xl font-bold text-primary tracking-tight">{stats.orders}</div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-text-secondary mt-1">Total Orders</div>
              </div>
              <div className="bg-surface border border-border/60 rounded-[20px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center">
                <Users size={24} className="text-error mb-2" strokeWidth={1.5} />
                <div className="text-3xl font-bold text-error tracking-tight">{stats.newOrders}</div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-error mt-1">Pending</div>
              </div>
              <div className="bg-surface border border-border/60 rounded-[20px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center">
                <TrendingUp size={24} className="text-success mb-2" strokeWidth={1.5} />
                <div className="text-xl font-bold text-success truncate w-full text-center tracking-tight">{formatPrice(stats.revenue)}</div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-success mt-1">Revenue</div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/admin/orders')}
              className="w-full bg-primary text-white border border-border/60 rounded-[20px] p-5 shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex items-center justify-between active:scale-95 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-white/10 p-2.5 rounded-xl">
                  <Package size={20} className="text-white" />
                </div>
                <span className="font-bold text-[16px]">Manage Orders</span>
              </div>
              <div className="flex items-center space-x-2">
                {stats.newOrders > 0 && (
                  <span className="bg-error shadow-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">{stats.newOrders} New</span>
                )}
                <ChevronLeft size={20} className="rotate-180 text-white/50" />
              </div>
            </button>
          </motion.div>
        )}

        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-serif font-bold text-xl">All Products</h3>
              <button 
                onClick={() => handleOpenProductEdit()}
                className="text-[12px] bg-primary text-white px-4 py-2 rounded-full font-bold flex items-center space-x-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.15)] active:scale-95 transition-all"
              >
                <Plus size={16} strokeWidth={3} /> <span>Create</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {products.map(product => (
                <div key={product.id} className="bg-surface border border-border/60 rounded-[24px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center space-x-4 relative overflow-hidden">
                  <div className="w-[52px] h-[52px] bg-muted/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-border/40">
                    {product.emoji}
                  </div>
                  <div className="flex-1 overflow-hidden pr-2">
                    <h4 className="text-[14px] font-bold truncate leading-tight text-primary">{product.name}</h4>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold mt-1.5">
                      {categories.find(c => c.id === product.category)?.name || 'Misc'} • Stock: <span className={product.stock === 0 ? 'text-error' : 'text-success'}>{product.stock}</span>
                    </p>
                    <p className="text-[13px] font-black tracking-tight text-accent-gold mt-1">{formatPrice(product.price)}</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button onClick={() => handleOpenProductEdit(product)} className="p-2 text-text-secondary hover:text-primary transition-colors bg-background rounded-xl border border-border/70 shadow-sm active:scale-90">
                      <Edit2 size={16} strokeWidth={2} />
                    </button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-text-secondary hover:text-error transition-colors bg-background rounded-xl border border-border/70 shadow-sm active:scale-90">
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'categories' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-serif font-bold text-xl">Categories</h3>
              <button 
                onClick={() => setIsCategoryModalOpen(true)}
                className="text-[12px] bg-primary text-white px-4 py-2 rounded-full font-bold flex items-center space-x-1.5 shadow-[0_4px_15px_rgba(0,0,0,0.15)] active:scale-95 transition-all"
              >
                <Plus size={16} strokeWidth={3} /> <span>Add</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {categories.map(cat => (
                <div key={cat.id} className="bg-surface border border-border/60 rounded-[20px] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col items-center text-center">
                  <span className="text-3xl mb-2">{cat.icon}</span>
                  <span className="font-bold text-[13px] uppercase tracking-wider text-primary">{cat.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>

      {/* Product Edit/Add Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="relative w-full max-w-[430px] bg-background rounded-t-[32px] p-6 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.2)] h-[90vh] overflow-y-auto no-scrollbar border-t border-border/30">
              <h2 className="font-serif font-bold text-[24px] mb-6 tracking-tight text-primary">{editingProduct ? 'Edit Product' : 'Create Product'}</h2>
              <form onSubmit={handleSaveProduct} className="space-y-5">
                
                <div className="flex space-x-4">
                  <div className="w-[80px]">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 pl-1">Icon</label>
                    <input type="text" value={productFormData.emoji} onChange={e => setProductFormData({...productFormData, emoji: e.target.value})} maxLength={2} className="w-full border-2 border-border/50 rounded-2xl px-2 py-3.5 text-center text-2xl bg-surface focus:border-accent-gold focus:outline-none transition-colors shadow-sm" required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 pl-1">Name</label>
                    <input type="text" value={productFormData.name} onChange={e => setProductFormData({...productFormData, name: e.target.value})} className="w-full border-2 border-border/50 rounded-2xl px-4 py-4 bg-surface focus:border-accent-gold focus:outline-none text-[15px] font-bold text-primary transition-colors shadow-sm" required />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <div className="flex-[2]">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 pl-1">Price (UZS)</label>
                    <input type="number" value={productFormData.price} onChange={e => setProductFormData({...productFormData, price: e.target.value})} className="w-full border-2 border-border/50 rounded-2xl px-4 py-4 bg-surface focus:border-accent-gold focus:outline-none text-[15px] font-bold text-primary transition-colors shadow-sm font-mono" required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 pl-1">Stock</label>
                    <input type="number" min="0" value={productFormData.stock} onChange={e => setProductFormData({...productFormData, stock: e.target.value})} className="w-full border-2 border-border/50 rounded-2xl px-4 py-4 bg-surface focus:border-accent-gold focus:outline-none text-[15px] font-bold text-primary transition-colors shadow-sm font-mono text-center" required />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 pl-1">Category</label>
                  <select value={productFormData.category} onChange={e => setProductFormData({...productFormData, category: e.target.value})} className="w-full border-2 border-border/50 rounded-2xl px-4 py-4 bg-surface focus:border-accent-gold focus:outline-none text-[15px] font-bold appearance-none transition-colors shadow-sm text-primary">
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 pl-1">Description</label>
                  <textarea value={productFormData.description} onChange={e => setProductFormData({...productFormData, description: e.target.value})} rows={3} className="w-full border-2 border-border/50 rounded-2xl px-4 py-4 bg-surface focus:border-accent-gold focus:outline-none text-[14px] leading-relaxed resize-none transition-colors shadow-sm text-primary" required />
                </div>

                <div className="pt-4 flex space-x-3 pb-8">
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
                <div className="flex space-x-4">
                  <div className="w-[80px]">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 pl-1">Icon</label>
                    <input type="text" value={categoryFormData.icon} onChange={e => setCategoryFormData({...categoryFormData, icon: e.target.value})} maxLength={2} className="w-full border-2 border-border/50 rounded-2xl px-2 py-4 text-center text-2xl bg-surface focus:border-accent-gold focus:outline-none shadow-sm" required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 pl-1">Name</label>
                    <input type="text" value={categoryFormData.name} onChange={e => setCategoryFormData({...categoryFormData, name: e.target.value})} className="w-full border-2 border-border/50 rounded-2xl px-4 py-4 bg-surface focus:border-accent-gold focus:outline-none text-[15px] font-bold text-primary shadow-sm" required />
                  </div>
                </div>
                <div className="pt-2 flex space-x-3">
                  <button type="submit" className="w-full py-4 h-[56px] rounded-2xl font-bold bg-primary text-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:scale-95 transition-transform text-[15px]">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </motion.div>
  );
};

export default AdminScreen;

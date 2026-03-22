import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Edit2, Trash2, Plus, TrendingUp, Package, Users, Tag, Box, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { formatPrice } from '../utils/formatPrice';
import { telegram } from '../utils/telegram';

const AdminScreen = () => {
  const { 
    products, setProducts, orders, 
    saleActive, setSaleActive, 
    salePercent, setSalePercent, 
    saleMessage, setSaleMessage,
    adminLoggedIn, setAdminLoggedIn
  } = useContext(AppContext);
  const navigate = useNavigate();

  const [isSaleConfigOpen, setIsSaleConfigOpen] = useState(false);
  const [tempSaleTitle, setTempSaleTitle] = useState(saleMessage);
  const [tempSalePercent, setTempSalePercent] = useState(salePercent);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [productFormData, setProductFormData] = useState({
    name: '', category: 'jackets', price: '', description: '', sale: 0, emoji: '👕'
  });

  useEffect(() => {
    if (!adminLoggedIn) {
      navigate('/');
    }
    if (telegram?.BackButton) {
      telegram.BackButton.show();
      const handleBack = () => navigate(-1);
      telegram.BackButton.onClick(handleBack);
      return () => telegram.BackButton.offClick(handleBack);
    }
  }, [adminLoggedIn, navigate]);

  const stats = {
    products: products.length,
    orders: orders.length,
    newOrders: orders.filter(o => o.status === 'New').length,
    revenue: orders.filter(o => o.status === 'Done').reduce((sum, order) => {
      return sum + order.items.reduce((s, item) => s + item.finalPrice, 0);
    }, 0)
  };

  const handleSaveSaleConfig = (e) => {
    e.preventDefault();
    setSaleMessage(tempSaleTitle);
    setSalePercent(Number(tempSalePercent));
    setIsSaleConfigOpen(false);
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
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description,
        sale: product.sale,
        emoji: product.emoji
      });
    } else {
      setEditingProduct(null);
      setProductFormData({
        name: '', category: 'jackets', price: '', description: '', sale: 0, emoji: '👕'
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    const newProduct = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      name: productFormData.name,
      category: productFormData.category,
      price: Number(productFormData.price),
      description: productFormData.description,
      sale: Number(productFormData.sale),
      emoji: productFormData.emoji,
      sizes: ["S", "M", "L", "XL"]
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === newProduct.id ? newProduct : p));
    } else {
      setProducts([...products, newProduct]);
    }
    setIsProductModalOpen(false);
  };

  const handleLogout = () => {
    setAdminLoggedIn(false);
    navigate('/');
  };

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-30%', opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-background pb-20"
    >
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-text-primary p-1 -ml-1">
          <ChevronLeft size={24} strokeWidth={1.5} />
        </button>
        <h1 className="font-serif text-xl font-bold">Admin Panel</h1>
        <button onClick={handleLogout} className="text-error p-1">
          <LogOut size={20} strokeWidth={1.5} />
        </button>
      </header>

      <div className="p-4 space-y-6">
        {/* STATS */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div className="bg-surface border border-border rounded-xl p-3 shadow-sm text-center">
            <Box size={20} className="text-text-secondary mx-auto mb-1" />
            <div className="text-2xl font-bold text-text-primary">{stats.products}</div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-text-secondary mt-1">Products</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3 shadow-sm text-center">
            <Package size={20} className="text-text-secondary mx-auto mb-1" />
            <div className="text-2xl font-bold text-text-primary">{stats.orders}</div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-text-secondary mt-1">Total Orders</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3 shadow-sm text-center">
            <Users size={20} className="text-error mx-auto mb-1" />
            <div className="text-2xl font-bold text-error">{stats.newOrders}</div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-error mt-1">New Orders</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3 shadow-sm text-center">
            <TrendingUp size={20} className="text-success mx-auto mb-1" />
            <div className="text-base font-bold text-success truncate min-h-[32px] flex items-center justify-center">{formatPrice(stats.revenue)}</div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-success mt-1">Revenue</div>
          </div>
        </div>

        {/* Global Sale Manage */}
        <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Tag size={18} className="text-accent-gold" />
              <h3 className="font-bold text-sm">Global Sale</h3>
            </div>
            <button 
              onClick={() => setSaleActive(!saleActive)}
              className={`w-12 h-6 rounded-full transition-colors relative ${saleActive ? 'bg-success' : 'bg-muted/50'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${saleActive ? 'left-[26px]' : 'left-0.5'}`} />
            </button>
          </div>
          {saleActive && (
            <div className="pt-3 border-t border-border flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">{saleMessage}</p>
                <p className="text-xs text-text-secondary mt-0.5">{salePercent}% Off everything</p>
              </div>
              <button 
                onClick={() => setIsSaleConfigOpen(true)}
                className="text-xs bg-accent-gold/10 text-accent-gold px-3 py-1.5 rounded-md font-bold hover:bg-accent-gold/20 transition-colors"
              >
                Configure
              </button>
            </div>
          )}
        </div>

        {/* Orders Button */}
        <button 
          onClick={() => navigate('/admin/orders')}
          className="w-full bg-surface border border-border rounded-xl p-4 shadow-sm flex items-center justify-between hover:bg-muted/10 transition-colors active:scale-[0.98]"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-primary/5 text-primary p-2 rounded-lg">
              <Package size={20} />
            </div>
            <span className="font-bold">Manage Orders</span>
          </div>
          <div className="flex items-center space-x-2">
            {stats.newOrders > 0 && (
              <span className="bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{stats.newOrders} New</span>
            )}
            <ChevronLeft size={18} className="rotate-180 text-text-secondary" />
          </div>
        </button>

        {/* Products List */}
        <div>
          <div className="flex justify-between items-end mb-3 mt-8">
            <h3 className="font-serif font-bold text-lg">Products Ledger</h3>
            <button 
              onClick={() => handleOpenProductEdit()}
              className="text-xs bg-primary text-white px-3 py-1.5 rounded-full font-bold flex items-center space-x-1 shadow-sm hover:bg-black transition-colors active:scale-95"
            >
              <Plus size={14} /> <span>Add</span>
            </button>
          </div>
          <div className="space-y-3">
            {products.map(product => (
              <div key={product.id} className="bg-surface border border-border rounded-xl p-3 shadow-sm flex items-center space-x-3">
                <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center text-2xl relative shadow-inner">
                  {product.emoji}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold truncate">{product.name}</h4>
                    {product.sale > 0 && !saleActive && (
                      <span className="bg-error/10 text-error text-[9px] font-bold px-1.5 py-0.5 rounded uppercase leading-none shadow-sm pb-[3px]">
                        Sale
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold mt-0.5">{product.category}</p>
                  <p className="text-xs font-semibold text-accent-gold mt-1">{formatPrice(product.price)}</p>
                </div>
                <div className="flex space-x-1.5 align-middle">
                  <button onClick={() => handleOpenProductEdit(product)} className="p-2 text-text-secondary hover:text-text-primary transition-colors bg-background rounded-lg border border-border shadow-sm active:scale-95">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-text-secondary hover:text-error transition-colors bg-background rounded-lg border border-border shadow-sm active:scale-95">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sale Config Modal */}
      <AnimatePresence>
        {isSaleConfigOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setIsSaleConfigOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-surface p-6 rounded-2xl w-full max-w-[340px] m-4 shadow-xl border border-border">
              <h2 className="font-serif font-bold text-xl mb-4">Configure Global Sale</h2>
              <form onSubmit={handleSaveSaleConfig} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Sale Title</label>
                  <input type="text" value={tempSaleTitle} onChange={e => setTempSaleTitle(e.target.value)} required className="w-full border border-border rounded-lg px-3 py-2 bg-background focus:border-accent-gold focus:outline-none text-sm transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Discount %</label>
                  <input type="number" min="0" max="100" value={tempSalePercent} onChange={e => setTempSalePercent(e.target.value)} required className="w-full border border-border rounded-lg px-3 py-2 bg-background focus:border-accent-gold focus:outline-none text-sm transition-colors" />
                </div>
                <div className="pt-2 flex space-x-3">
                  <button type="button" onClick={() => setIsSaleConfigOpen(false)} className="flex-1 py-2.5 rounded-lg font-medium border border-border hover:bg-muted/10 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-lg font-medium bg-accent-gold text-white shadow-lg active:scale-95 transition-transform">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Edit/Add Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setIsProductModalOpen(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="relative w-full max-w-[430px] bg-surface rounded-t-3xl p-6 pb-8 shadow-2xl h-[85vh] overflow-y-auto no-scrollbar border-t border-border">
              <h2 className="font-serif font-bold text-xl mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <form onSubmit={handleSaveProduct} className="space-y-5">
                <div className="flex space-x-3">
                  <div className="w-20">
                    <label className="block text-xs font-bold text-text-secondary mb-1">Emoji</label>
                    <input type="text" value={productFormData.emoji} onChange={e => setProductFormData({...productFormData, emoji: e.target.value})} maxLength={2} className="w-full border border-border rounded-lg px-2 py-2.5 text-center text-xl bg-background focus:border-accent-gold focus:outline-none transition-colors shadow-inner" required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-text-secondary mb-1">Name</label>
                    <input type="text" value={productFormData.name} onChange={e => setProductFormData({...productFormData, name: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2.5 bg-background focus:border-accent-gold focus:outline-none text-sm transition-colors" required />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-text-secondary mb-1">Price (UZS)</label>
                    <input type="number" value={productFormData.price} onChange={e => setProductFormData({...productFormData, price: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2.5 bg-background focus:border-accent-gold focus:outline-none text-sm transition-colors" required />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-xs font-bold text-text-secondary mb-1">Sale %</label>
                    <input type="number" min="0" max="100" value={productFormData.sale} onChange={e => setProductFormData({...productFormData, sale: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2.5 bg-background focus:border-accent-gold focus:outline-none text-sm transition-colors" required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Category</label>
                  <select value={productFormData.category} onChange={e => setProductFormData({...productFormData, category: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2.5 bg-background focus:border-accent-gold focus:outline-none text-sm appearance-none transition-colors font-medium">
                    <option value="jackets">Jackets</option>
                    <option value="polos">Polos</option>
                    <option value="pants">Pants</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Description</label>
                  <textarea value={productFormData.description} onChange={e => setProductFormData({...productFormData, description: e.target.value})} rows={3} className="w-full border border-border rounded-lg px-3 py-2.5 bg-background focus:border-accent-gold focus:outline-none text-sm resize-none transition-colors" required />
                </div>

                <div className="pt-2 flex space-x-3">
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 py-3.5 rounded-lg font-medium border border-border hover:bg-muted/10 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3.5 rounded-lg font-medium bg-primary text-white shadow-lg active:scale-[0.98] transition-all">{editingProduct ? 'Save Changes' : 'Add Product'}</button>
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

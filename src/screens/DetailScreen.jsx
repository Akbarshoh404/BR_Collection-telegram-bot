import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Heart, ShieldCheck, ShoppingBag, Star, Truck, AlertCircle } from 'lucide-react'
import { AppContext } from '../context/AppContext'
import { formatPrice } from '../utils/formatPrice'
import { telegram } from '../utils/telegram'
import { getProductImage } from '../utils/productMedia'
import ProductCard from '../components/ProductCard'

const DetailScreen = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    products,
    categories,
    getProductPrice,
    saleActive,
    salePercent,
    addToCart,
    favorites,
    toggleFavorite,
    recordRecentlyViewed,
    policies,
    currentUser,
    setProducts,
  } = useContext(AppContext)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [activeImage, setActiveImage] = useState('')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [cartFeedback, setCartFeedback] = useState('')
  const [commentText, setCommentText] = useState('')
  const [commentRating, setCommentRating] = useState(5)

  const product = products.find((item) => item.id === id)

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

  useEffect(() => {
    if (!product) {
      return
    }

    const initialColor = product.colors?.[0]?.id || null
    setSelectedColor(initialColor)
    setActiveImage(getProductImage(product, initialColor))
    setSelectedSize(product.sizes.find((size) => (product.sizeStock?.[size] ?? product.stock) > 0) || product.sizes[0] || null)
    recordRecentlyViewed(product.id)
  }, [product, recordRecentlyViewed])

  const relatedProducts = useMemo(
    () => products.filter((item) => item.category === product?.category && item.id !== product?.id).slice(0, 2),
    [product, products],
  )

  if (!product) {
    return (
      <div className="p-4 flex h-screen items-center justify-center text-lg font-serif">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="text-text-secondary mb-4">Product not found.</p>
          <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
        </motion.div>
      </div>
    )
  }

  const price = getProductPrice(product)
  const hasDiscount = saleActive || product.sale > 0
  const discountLabel = saleActive ? `-${salePercent}%` : `-${product.sale}%`
  const isFavorite = favorites.includes(product.id)
  const categoryName = categories.find((category) => category.id === product.category)?.name || product.category
  const isOutOfStock = product.stock === 0
  const imageChoices = [activeImage, ...(product.gallery || [])].filter(Boolean).filter((image, index, array) => array.indexOf(image) === index)

  const handleColorChange = (colorId) => {
    setSelectedColor(colorId)
    setActiveImage(getProductImage(product, colorId))
  }

  const handleAddToCart = () => {
    if (isOutOfStock || !selectedSize) {
      return
    }

    const added = addToCart(product, selectedSize, 1, selectedColor)
    setCartFeedback(added ? 'Added to cart' : 'Cart updated')
    window.setTimeout(() => setCartFeedback(''), 1800)
  }

  const handleOrderNow = () => {
    if (isOutOfStock || !selectedSize) {
      return
    }

    addToCart(product, selectedSize, 1, selectedColor)
    navigate('/cart')
  }

  const handleAddComment = () => {
    if (!commentText.trim()) {
      return
    }

    const nextReview = {
      author: currentUser?.firstName || currentUser?.telegramId || 'Guest',
      rating: Number(commentRating),
      comment: commentText.trim(),
    }

    setProducts((prev) =>
      prev.map((item) =>
        item.id === product.id
          ? {
              ...item,
              reviews: [nextReview, ...(item.reviews || [])],
              reviewsCount: (item.reviewsCount || 0) + 1,
              rating: Number(
                (
                  ((item.rating || 0) * (item.reviewsCount || 0) + nextReview.rating) /
                  ((item.reviewsCount || 0) + 1)
                ).toFixed(1),
              ),
            }
          : item,
      ),
    )

    setCommentText('')
    setCommentRating(5)
  }

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '-20%', opacity: 0 }} transition={{ type: 'spring', damping: 30, stiffness: 350 }} className="min-h-screen bg-surface pb-14">
      <div className="relative h-[58vh] w-full bg-muted/10 rounded-b-[40px] overflow-hidden shadow-sm">
        <motion.button onClick={() => navigate(-1)} whileTap={{ scale: 0.9 }} className="absolute top-4 left-4 z-20 w-11 h-11 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform">
          <ChevronLeft size={26} strokeWidth={2} />
        </motion.button>

        <motion.button onClick={() => toggleFavorite(product.id)} whileTap={{ scale: 0.9 }} className="absolute top-4 right-4 z-20 w-11 h-11 bg-white/90 backdrop-blur-md border border-border/50 rounded-full flex items-center justify-center text-primary shadow-lg active:scale-90 transition-transform">
          <Heart size={22} fill={isFavorite ? '#D94F3D' : 'none'} color={isFavorite ? '#D94F3D' : 'currentColor'} strokeWidth={isFavorite ? 0 : 2} />
        </motion.button>

        <motion.img
          src={activeImage}
          alt={product.name}
          className="w-full h-full object-cover"
          onLoad={() => setImageLoaded(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
        />

        {!imageLoaded && <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/10 animate-pulse" />}

        {hasDiscount && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute bottom-6 left-6 bg-error text-white text-[11px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full shadow-[0_4px_12px_rgba(217,79,61,0.4)]">
            Sale {discountLabel}
          </motion.div>
        )}
      </div>

      <div className="px-6 py-6 relative -mt-8 bg-surface rounded-t-[40px] z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] space-y-8">
        {imageChoices.length > 1 && (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {imageChoices.map((image) => (
              <button key={image} onClick={() => setActiveImage(image)} className={`w-20 h-24 rounded-[18px] overflow-hidden border-2 shrink-0 ${activeImage === image ? 'border-accent-gold' : 'border-border/60'}`}>
                <img src={image} alt={product.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-between items-start gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-accent-gold">{categoryName}</span>
            <h1 className="text-3xl font-serif font-bold leading-[1.08] mt-2 text-text-primary tracking-tight">{product.name}</h1>
          </div>
          <div className="flex items-center space-x-1 text-text-primary mt-1">
            <Star size={14} fill="#B8952A" color="#B8952A" />
            <span className="text-sm font-bold">{product.rating}</span>
            <span className="text-xs text-text-muted">({product.reviewsCount})</span>
          </div>
        </div>

        <div className="flex items-end space-x-3">
          <span className="text-[28px] font-bold text-text-primary tracking-tight">{formatPrice(price)}</span>
          {hasDiscount && <span className="text-sm font-semibold text-text-muted line-through mb-1.5">{formatPrice(product.price)}</span>}
        </div>

        <p className="text-text-secondary leading-relaxed text-[15px]">{product.description}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[24px] border border-border/60 bg-background p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Material</p>
            <p className="text-[14px] font-bold text-primary leading-snug">{product.material}</p>
          </div>
          <div className="rounded-[24px] border border-border/60 bg-background p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">Delivery</p>
            <p className="text-[14px] font-bold text-primary leading-snug">{product.deliveryEstimate}</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[13px] uppercase tracking-widest font-bold text-text-primary">Select Color</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">{product.colors?.length || 0} variants</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {product.colors?.map((color) => (
              <motion.button key={color.id} onClick={() => handleColorChange(color.id)} whileTap={{ scale: 0.95 }} className={`px-4 py-3 rounded-2xl border-2 flex items-center gap-3 transition-all ${selectedColor === color.id ? 'border-primary bg-primary text-white shadow-lg' : 'border-border/60 bg-transparent text-text-primary'}`}>
                <span className="w-4 h-4 rounded-full border border-white/40" style={{ backgroundColor: color.hex }} />
                <span className="text-[13px] font-bold">{color.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[13px] uppercase tracking-widest font-bold text-text-primary">Select Size</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary underline decoration-border underline-offset-4">Live Stock</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map((size) => {
              const sizeQuantity = product.sizeStock?.[size] ?? product.stock
              const disabled = sizeQuantity <= 0

              return (
                <motion.button
                  key={size}
                  onClick={() => !disabled && setSelectedSize(size)}
                  whileTap={{ scale: disabled ? 1 : 0.95 }}
                  className={`min-w-[74px] px-4 h-[58px] rounded-2xl border-2 transition-all flex flex-col items-center justify-center font-bold text-[15px] ${selectedSize === size ? 'border-primary bg-primary text-white shadow-lg scale-105' : disabled ? 'border-border/40 bg-muted/10 text-text-muted cursor-not-allowed' : 'border-border/60 bg-transparent text-text-primary hover:border-text-muted'}`}
                >
                  <span>{size}</span>
                  <span className={`text-[10px] font-medium ${selectedSize === size ? 'text-white/70' : disabled ? 'text-text-muted' : 'text-text-secondary'}`}>{sizeQuantity} left</span>
                </motion.button>
              )
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-border/50 bg-background px-4 py-4 shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
          {isOutOfStock ? (
            <div className="w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 bg-muted/20 text-text-muted border border-border">
              <AlertCircle size={20} />
              <span>Out of Stock</span>
            </div>
          ) : (
            <>
              {product.stock < 5 && (
                <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-4 text-center w-full">
                  <span className="bg-error text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
                    Only {product.stock} left in stock
                  </span>
                </motion.div>
              )}

              {!selectedSize && <p className="mb-4 text-[12px] font-medium text-text-secondary">Choose your size to unlock bag and checkout actions.</p>}

              {cartFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-[13px] font-bold text-success"
                >
                  {cartFeedback}
                </motion.div>
              )}

              <div className="flex space-x-3">
                <motion.button onClick={handleAddToCart} disabled={!selectedSize} whileTap={{ scale: 0.95 }} className={`flex-1 py-4.5 h-[56px] rounded-2xl font-bold flex items-center justify-center transition-all border-2 ${selectedSize ? 'border-border text-primary hover:bg-muted/10 active:scale-95 bg-surface' : 'border-border/50 bg-muted/10 text-text-muted cursor-not-allowed'}`}>
                  <ShoppingBag size={20} className="mr-2" strokeWidth={2.5} />
                  {cartFeedback ? 'Added' : 'Add to Cart'}
                </motion.button>
                <motion.button onClick={handleOrderNow} disabled={!selectedSize} whileTap={{ scale: 0.95 }} className={`flex-[1.5] py-4.5 h-[56px] rounded-2xl font-bold flex items-center justify-center transition-all relative overflow-hidden ${selectedSize ? 'bg-accent-gold text-white shadow-[0_8px_20px_rgba(184,149,42,0.3)] active:scale-95' : 'bg-muted text-surface cursor-not-allowed'}`}>
                  Order Now
                </motion.button>
              </div>
            </>
          )}
        </div>

        <div className="rounded-[28px] border border-border/60 bg-background p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-accent-gold" />
            <h3 className="font-serif text-[22px] font-bold text-primary">Care and Confidence</h3>
          </div>
          <div className="space-y-2 mb-4">
            {product.careInstructions?.map((instruction) => (
              <div key={instruction} className="text-[13px] text-text-secondary flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent-gold shrink-0" />
                <span>{instruction}</span>
              </div>
            ))}
          </div>
          <div className="grid gap-3">
            <div className="rounded-[20px] bg-surface border border-border/60 p-4 text-[13px] text-text-secondary leading-relaxed">{policies.shipping}</div>
            <div className="rounded-[20px] bg-surface border border-border/60 p-4 text-[13px] text-text-secondary leading-relaxed">{policies.returns}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-accent-gold" />
            <h3 className="font-serif text-[22px] font-bold text-primary">Customer Reviews</h3>
          </div>
          <div className="rounded-[22px] border border-border/60 bg-background p-4 shadow-[0_6px_18px_rgba(0,0,0,0.03)] space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-[11px] font-bold uppercase tracking-widest text-text-secondary">
                Rating
                <select value={commentRating} onChange={(event) => setCommentRating(Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-border/60 bg-surface px-4 py-3 text-[14px] font-bold text-primary outline-none">
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>{value} Stars</option>
                  ))}
                </select>
              </label>
              <div className="text-[11px] font-bold uppercase tracking-widest text-text-secondary">
                Author
                <div className="mt-2 rounded-2xl border border-border/60 bg-surface px-4 py-3 text-[14px] font-bold text-primary">
                  {currentUser?.firstName || currentUser?.telegramId || 'Guest'}
                </div>
              </div>
            </div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-text-secondary">
              Comment
              <textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-border/60 bg-surface px-4 py-3 text-[14px] font-medium text-primary outline-none resize-none"
                placeholder="Share your fit, fabric feel, or delivery experience"
              />
            </label>
            <button onClick={handleAddComment} className="w-full rounded-2xl bg-primary px-4 py-3 text-[14px] font-bold text-white shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
              Post Comment
            </button>
          </div>
          {product.reviews?.map((review, index) => (
            <div key={`${review.author}-${index}`} className="rounded-[22px] border border-border/60 bg-background p-4 shadow-[0_6px_18px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-primary">{review.author}</p>
                <div className="flex items-center gap-1 text-[12px] font-bold text-primary">
                  <Star size={12} fill="#B8952A" color="#B8952A" />
                  {review.rating}
                </div>
              </div>
              <p className="text-[13px] text-text-secondary leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>

        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-[22px] font-bold text-primary">You may also like</h3>
              <span className="text-[11px] font-bold uppercase tracking-widest text-text-secondary">Same Edit</span>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default DetailScreen


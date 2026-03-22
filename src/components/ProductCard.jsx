import React, { useContext, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Heart, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { formatPrice } from '../utils/formatPrice'
import { getBadgeLabel, getProductImage } from '../utils/productMedia'

const ProductCard = ({ product }) => {
  const navigate = useNavigate()
  const { getProductPrice, saleActive, salePercent, categories, favorites, toggleFavorite } = useContext(AppContext)
  const [imageLoaded, setImageLoaded] = useState(false)

  const price = getProductPrice(product)
  const hasDiscount = saleActive || product.sale > 0
  const isGlobalSale = saleActive
  const discountLabel = isGlobalSale ? `-${salePercent}%` : `-${product.sale}%`
  const isFavorite = favorites.includes(product.id)
  const categoryName = categories.find((category) => category.id === product.category)?.name || product.category
  const badge = product.badges?.[0]

  const handleFavoriteClick = (event) => {
    event.stopPropagation()
    toggleFavorite(product.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-surface rounded-[22px] overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.03)] border border-border/50 cursor-pointer relative group flex flex-col h-full"
    >
      <div className="relative aspect-[3/4] bg-muted/10 w-full overflow-hidden">
        <motion.img
          src={getProductImage(product)}
          alt={product.name}
          className="w-full h-full object-cover select-none transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
        />
        {!imageLoaded && <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/10 animate-pulse" />}

        <div className="absolute top-3 w-full px-3 flex justify-between items-start z-10 pointer-events-none">
          <div className="flex flex-col gap-1.5">
            {hasDiscount && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-error/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm max-w-fit pointer-events-auto">
                {discountLabel}
              </motion.div>
            )}
            {badge && (
              <div className="bg-white/85 backdrop-blur-sm text-primary text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm max-w-fit pointer-events-auto">
                {getBadgeLabel(badge)}
              </div>
            )}
            {product.stock === 0 && (
              <div className="bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm max-w-fit pointer-events-auto">
                Sold Out
              </div>
            )}
          </div>
          <motion.button
            onClick={handleFavoriteClick}
            whileTap={{ scale: 0.85 }}
            className="w-8 h-8 rounded-full bg-white/70 backdrop-blur flex items-center justify-center text-text-primary shadow-sm hover:scale-110 active:scale-90 transition-all pointer-events-auto"
          >
            <Heart size={16} fill={isFavorite ? '#D94F3D' : 'none'} color={isFavorite ? '#D94F3D' : 'currentColor'} strokeWidth={isFavorite ? 0 : 2} />
          </motion.button>
        </div>
      </div>

      <div className="p-3.5 relative flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary block">{categoryName}</span>
          <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
            <Star size={12} fill="#B8952A" color="#B8952A" />
            <span>{product.rating}</span>
          </div>
        </div>
        <h3 className="text-sm font-serif font-bold leading-tight pr-8 mb-2">{product.name}</h3>
        <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2 mb-3">{product.material}</p>
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            {hasDiscount && <span className="text-[10px] text-text-muted line-through mb-0.5">{formatPrice(product.price)}</span>}
            <span className={`text-[14px] font-bold tracking-tight ${hasDiscount ? 'text-accent-gold' : 'text-text-primary'}`}>
              {formatPrice(price)}
            </span>
          </div>
          <motion.button
            onClick={(event) => {
              event.stopPropagation()
              navigate(`/product/${product.id}`)
            }}
            whileTap={{ scale: 0.85 }}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all z-20 active:scale-95 ${product.stock === 0 ? 'bg-muted text-surface' : 'bg-[#1A1A1A] text-white hover:bg-black'}`}
          >
            <ShoppingBag size={15} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard


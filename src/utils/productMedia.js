export const getProductImage = (product, colorId) => {
  if (!product) {
    return ''
  }

  if (colorId && Array.isArray(product.colors)) {
    const variant = product.colors.find((item) => item.id === colorId)
    if (variant?.image) {
      return variant.image
    }
  }

  if (product.image) {
    return product.image
  }

  if (Array.isArray(product.gallery) && product.gallery.length) {
    return product.gallery[0]
  }

  return ''
}

export const getBadgeLabel = (badge) => {
  switch (badge) {
    case 'best-seller':
      return 'Best Seller'
    case 'editor-pick':
      return 'Editor Pick'
    case 'limited':
      return 'Limited'
    case 'formal':
      return 'Formal'
    case 'new':
      return 'New'
    case 'sale':
      return 'Sale'
    default:
      return badge
  }
}


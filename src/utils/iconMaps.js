export const getCategoryGlyph = (categoryId) => {
  switch (categoryId) {
    case 'cat_jackets':
      return '\uD83E\uDDE5'
    case 'cat_polos':
      return '\uD83D\uDC55'
    case 'cat_pants':
      return '\uD83D\uDC56'
    case 'cat_accessories':
      return '\uD83D\uDD76\uFE0F'
    default:
      return '\u2728'
  }
}

export const getProductGlyph = (product) => {
  if (product?.emoji && !product.emoji.includes('ð')) {
    return product.emoji
  }

  return getCategoryGlyph(product?.category)
}

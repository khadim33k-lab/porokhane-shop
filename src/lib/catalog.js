export const SHOP_UNIVERSES = ['Tous', 'Mode & Voiles', 'Accessoires']

const ACCESSORY_TERMS = [
  'accessoire',
  'zikr',
  'iqibla',
  'chapelet',
  'tasbih',
  'bague',
  'ring',
]

export function getProductUniverse(product = {}) {
  const searchable = [product.category, product.name, product.material]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('fr')

  return ACCESSORY_TERMS.some(term => searchable.includes(term))
    ? 'Accessoires'
    : 'Mode & Voiles'
}

export function productMatchesUniverse(product, universe) {
  return universe === 'Tous' || getProductUniverse(product) === universe
}

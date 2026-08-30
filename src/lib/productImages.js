export function getProductImage(product = {}) {
  const imageFromGallery = Array.isArray(product.images)
    ? product.images.find(image => typeof image === 'string' && image.trim())
    : null

  if (imageFromGallery) return imageFromGallery
  if (typeof product.image_url === 'string' && product.image_url.trim()) return product.image_url
  if (typeof product.imageUrl === 'string' && product.imageUrl.trim()) return product.imageUrl

  return null
}

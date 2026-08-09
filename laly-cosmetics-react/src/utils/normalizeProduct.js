export const normalizeProductData = (product) => {
  if (!product) return null

  const id = String(product.id || product.docId || product._id || Date.now())

  const nombre = product.title || product.nombre || product.name || 'Producto sin título'

  let rawPrice = product.price_usd !== undefined 
    ? product.price_usd 
    : (product.precio !== undefined ? product.precio : product.price)

  if (typeof rawPrice === 'string') {
    rawPrice = rawPrice.replace(/[^0-9.-]+/g, "")
  }
  const precio = parseFloat(rawPrice) || 0

  let imagenUrl = 'https://via.placeholder.com/100'
  if (Array.isArray(product.images) && product.images.length > 0) {
    imagenUrl = product.images[0]
  } else if (typeof product.imagenUrl === 'string') {
    imagenUrl = product.imagenUrl
  } else if (typeof product.image === 'string') {
    imagenUrl = product.image
  }

  const stock = parseInt(product.stock) || 99

  return { id, nombre, precio, imagenUrl, stock }
}
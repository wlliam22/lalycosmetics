import { useParams, Link } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { useCart } from '../context/CartContext'
import { ShoppingBag, CheckCircle, Droplet, Sparkles, Heart } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import PageShell from '../components/layout/PageShell'
import ProductGallery from '../components/product/ProductGallery'
import QuantitySelector from '../components/product/QuantitySelector'
import ProductCard from '../components/product/ProductCard'
import { formatUSD } from '../utils/formatCurrency'

const ProductDetail = () => {
  const { id } = useParams()
  const { products, loading } = useProducts()
  const { addToCart } = useCart()

  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const product = products.find((p) => p.id === id)

  const relatedProducts = useMemo(
    () =>
      products
        .filter((p) => p.category === product?.category && p.id !== id)
        .slice(0, 4),
    [products, product?.category, id]
  )

  useEffect(() => {
    setQuantity(1)
    setAdded(false)
  }, [id])

  if (loading) {
    return (
      <PageShell className="bg-brand-nude/30">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400 text-sm animate-pulse">Cargando producto...</div>
        </div>
      </PageShell>
    )
  }

  if (!product) {
    return (
      <PageShell className="bg-brand-nude/30">
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center">
            <h2 className="text-2xl font-serif text-gray-700 mb-2">Producto no encontrado</h2>
            <p className="text-gray-400 text-sm mb-6">
              El producto que buscas no existe o fue eliminado.
            </p>
            <Link
              to="/"
              className="bg-brand-primary text-white px-6 py-2.5 rounded-full text-sm hover:bg-brand-hover transition inline-block"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </PageShell>
    )
  }

  const isOutOfStock = product.stock === 0

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleQuantityChange = (newQty) => {
    if (newQty < 1) return
    if (product.stock && newQty > product.stock) return
    setQuantity(newQty)
  }

  return (
    <PageShell className="bg-white">
      <main className="flex-1 bg-gradient-to-b from-brand-nude/30 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">

            <ProductGallery
              images={product.images}
              title={product.title}
              outOfStock={isOutOfStock}
            />

            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold text-brand-primary uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                  {product.category || 'Sin categoría'}
                </span>
                {!isOutOfStock ? (
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 font-medium flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-emerald-500" />
                    {product.stock} disponibles
                  </span>
                ) : (
                  <span className="text-xs text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 font-medium">
                    Agotado
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl md:text-4xl font-bold text-brand-primary">
                  {formatUSD(product.price_usd)}
                </span>
                <span className="text-sm text-gray-400 font-medium">USD</span>
              </div>

              <div className="border-t border-rose-100/50 pt-4 mt-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-brand-primary" />
                  Descripción
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description || 'Sin descripción disponible.'}
                </p>
              </div>

              <div className="mt-auto pt-6 border-t border-rose-100/50 space-y-4">
                <QuantitySelector
                  quantity={quantity}
                  onChange={handleQuantityChange}
                  max={product.stock}
                />

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  aria-live="polite"
                  className={`w-full py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden ${
                    !isOutOfStock
                      ? 'bg-gradient-to-r from-brand-primary to-rose-400 text-white hover:from-brand-hover hover:to-rose-500 shadow-lg shadow-rose-200/50 hover:shadow-rose-300/50'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {added ? (
                    <>
                      <CheckCircle className="w-5 h-5 animate-bounce" />
                      <span>¡Agregado!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>{!isOutOfStock ? 'Agregar al carrito' : 'Agotado'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-16 pt-8 border-t border-rose-100/50">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-5 h-5 text-brand-primary" />
                <h3 className="font-serif text-2xl font-bold text-gray-800">
                  Productos relacionados
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedProducts.map((rel) => (
                  <ProductCard key={rel.id} product={rel} onAddToCart={addToCart} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </PageShell>
  )
}

export default ProductDetail
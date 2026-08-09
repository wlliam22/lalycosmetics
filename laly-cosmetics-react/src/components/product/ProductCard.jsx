import { Link } from 'react-router-dom'
import { formatUSD } from '../../utils/formatCurrency'

const LOW_STOCK_THRESHOLD = 5

const ProductCard = ({ product, onAddToCart, badge, className = '' }) => {
  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onAddToCart(product)
  }

  return (
    <Link
      to={`/producto/${product.id}`}
      className={`bg-white rounded-2xl p-3 border border-gray-100 shadow-sm relative group hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div className="relative w-full h-40 rounded-xl overflow-hidden mb-2 bg-gray-50">
        <img
          src={product.images?.[0]}
          alt={product.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = '/placeholder-product.svg'
          }}
          className={`w-full h-full object-cover group-hover:scale-105 transition duration-300 ${
            isOutOfStock ? 'opacity-50 grayscale' : ''
          }`}
        />

        {badge && (
          <span className="absolute top-2 left-2 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            {badge}
          </span>
        )}

        {isOutOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-white text-xs font-bold uppercase tracking-wide">
              Agotado
            </span>
          </span>
        )}
      </div>

      <h3 className="text-xs font-semibold text-gray-800 line-clamp-1">
        {product.title}
      </h3>
      <p className="text-[11px] text-gray-400 mb-1">{product.category}</p>

      {isLowStock && (
        <p className="text-[10px] text-amber-600 font-medium mb-1">
          ¡Últimas {product.stock} unidades!
        </p>
      )}

      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-gray-900">
          {formatUSD(product.price_usd)}
        </span>
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          aria-label={
            isOutOfStock
              ? `${product.title} agotado`
              : `Añadir ${product.title} al carrito`
          }
          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
            !isOutOfStock
              ? 'bg-[#E5235E] text-white hover:bg-[#C2184B]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {!isOutOfStock ? '+ Añadir' : 'Agotado'}
        </button>
      </div>
    </Link>
  )
}

export default ProductCard
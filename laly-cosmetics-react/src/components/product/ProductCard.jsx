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
      className={`bg-white rounded-2xl p-3 border border-gray-100 shadow-sm relative group hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full ${className}`}
    >
      {/* SECCIÓN SUPERIOR CON CONTENEDORES DE ALTURA FIJA */}
      <div className="flex flex-col flex-grow">
        <div className="relative w-full h-40 rounded-xl overflow-hidden mb-2 bg-gray-50 flex items-center justify-center">
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
            <span className="absolute top-2 left-2 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow z-10">
              {badge}
            </span>
          )}

          {isOutOfStock && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
              <span className="text-white text-xs font-bold uppercase tracking-wide">
                Agotado
              </span>
            </span>
          )}
        </div>

        {/* Título: Reserva exactamente 2 líneas aunque tenga 1 sola línea */}
        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 min-h-[32px] leading-tight mb-0.5">
          {product.title}
        </h3>

        {/* Categoria */}
        <p className="text-[11px] text-gray-400 mb-1 leading-tight">{product.category}</p>

        {/* Contenedor de Bajo Stock: Mantiene reservado el espacio de 16px aunque no aplique */}
        <div className="min-h-[16px] mb-2 flex items-center">
          {isLowStock && (
            <p className="text-[10px] text-amber-600 font-medium">
              ¡Últimas {product.stock} unidades!
            </p>
          )}
        </div>
      </div>

      {/* SECCIÓN INFERIOR: Alineada siempre al pie de la tarjeta */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-50 mt-auto">
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
import { useMemo } from 'react'
import { useProducts } from '../../context/ProductsContext'
import { useCart } from '../../context/CartContext'
import ProductCard from '../product/ProductCard'

const FeaturedProducts = () => {
  const { products } = useProducts()
  const { addToCart } = useCart()

  const featured = useMemo(
    () => products.filter((p) => p.is_featured === true),
    [products]
  )

  if (featured.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 text-sm w-full">
        No hay productos destacados por ahora.
      </div>
    )
  }

  return (
    <div
      className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
      role="list"
      aria-label="Productos destacados"
    >
      {featured.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={addToCart}
          badge="Destacado"
          className="flex-shrink-0 w-48"
        />
      ))}
    </div>
  )
}

export default FeaturedProducts
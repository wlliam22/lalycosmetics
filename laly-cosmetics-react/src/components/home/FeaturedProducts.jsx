import { useMemo } from 'react'
import { useProducts } from '../../context/ProductsContext'
import { useCart } from '../../context/CartContext'
import ProductCard from '../product/ProductCard'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'

import 'swiper/css'

const FeaturedProducts = () => {
  const { products, loading } = useProducts()
  const { addToCart } = useCart()

  // Filtrado flexible de destacados
  const rawFeatured = useMemo(() => {
    if (!products) return []
    return products.filter((p) => {
      const val = p.is_featured ?? p.featured ?? p.destacado
      return val === true || val === 1 || val === 'true'
    })
  }, [products])

  // Duplicamos el arreglo si hay pocos elementos para garantizar el loop infinito continuo sin saltos
  const featured = useMemo(() => {
    if (rawFeatured.length > 0 && rawFeatured.length < 10) {
      return [...rawFeatured, ...rawFeatured, ...rawFeatured]
    }
    return rawFeatured
  }, [rawFeatured])

  if (loading) {
    return (
      <div className="text-center py-6 text-gray-400 text-sm w-full animate-pulse">
        Cargando productos destacados...
      </div>
    )
  }

  if (featured.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 text-sm w-full">
        No hay productos destacados por ahora.
      </div>
    )
  }

  return (
    <div className="w-full relative px-2 continuous-slider">
      {/* Estilo CSS inyectado para obligar la transición lineal sin pausas ni aceleraciones */}
      <style>{`
        .continuous-slider .swiper-wrapper {
        -webkit-transition-timing-function: linear !important;
        -o-transition-timing-function: linear !important;
        transition-timing-function: linear !important;
        }
        /* Congela el movimiento al hacer hover en el contenedor */
        .continuous-slider:hover .swiper-wrapper {
        transition-duration: 0ms !important;
        }
        `}
        </style>

      <Swiper
        modules={[Autoplay]}
        spaceBetween={16}
        slidesPerView={2}
        loop={true}
        speed={5000}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: true, // <--- DETIENE EL AUTOPLAY AL PASAR EL RATÓN
  }}
        breakpoints={{
        640: { slidesPerView: 3 },
        768: { slidesPerView: 4 },
        1024: { slidesPerView: 5 },
        1280: { slidesPerView: 6 },
  }}
        className="w-full py-2"
      >
        {featured.map((product, index) => (
          <SwiperSlide key={`${product.id}-${index}`} className="h-auto">
            <ProductCard
              product={product}
              onAddToCart={addToCart}
              badge="Destacado"
              className="h-full"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default FeaturedProducts
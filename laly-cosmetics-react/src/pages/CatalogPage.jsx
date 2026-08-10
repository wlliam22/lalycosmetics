import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import CartDrawer from '../components/cart/CartDrawer'
import CheckoutModal from '../components/checkout/CheckoutModal'
import { useProducts } from '../context/ProductsContext'
import { useCart } from '../context/CartContext'
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react'

// 3 hileras de 4 ítems = 12 ítems por página
const ITEMS_PER_PAGE = 12

const CatalogPage = () => {
  const [searchParams] = useSearchParams()
  const { products, loading } = useProducts()
  const { addToCart } = useCart()

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  
  const initialCategory = searchParams.get('category') || 'Todos'
  const initialSearch = searchParams.get('search') || ''

  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [currentPage, setCurrentPage] = useState(1)

  const categories = ['Todos', 'Cuidado Facial', 'Maquillaje', 'Cuidado Corporal', 'Accesorios']

  // Debounce de 200ms para la búsqueda rápida
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, 200)

    return () => clearTimeout(handler)
  }, [searchInput])

  // Filtrado por categoría, título y descripción
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const category = p.category || p.categoria || ''
      const title = p.title || p.nombre || ''
      const description = p.description || p.descripcion || ''

      const matchCategory =
        selectedCategory === 'Todos' ||
        category.toLowerCase() === selectedCategory.toLowerCase()

      const matchSearch =
        !debouncedSearch?.trim() ||
        title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        category.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        description.toLowerCase().includes(debouncedSearch.toLowerCase())

      return matchCategory && matchSearch
    })
  }, [products, selectedCategory, debouncedSearch])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, debouncedSearch])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredProducts, currentPage])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <Header onCartOpen={() => setIsCartOpen(true)} showSearch={false} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* BUSCADOR Y FILTROS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por producto o categoría..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:border-brand-primary"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-rose-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* GRID: 2 COLUMNAS EN MÓVIL, 4 COLUMNAS EN TABLET Y DESKTOP */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-xs">Cargando catálogo...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-xs">No se encontraron productos.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {paginatedProducts.map((item) => {
              const image = item.images?.[0] || item.imagenUrl || 'https://via.placeholder.com/100'
              const title = item.title || item.nombre
              const category = item.category || item.categoria
              const price = item.price_usd ?? item.precio ?? 0

              return (
                <Link
                  key={item.id}
                  to={`/producto/${item.id}`}
                  className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition"
                >
                  <div>
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-gray-50 flex items-center justify-center p-2">
                      <img
                        src={image}
                        alt={title}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                      />
                      {item.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center text-white text-[10px] font-bold uppercase">
                          Agotado
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-brand-primary uppercase tracking-wider block">
                      {category}
                    </span>
                    <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight min-h-[2rem] mt-1">
                      {title}
                    </h3>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-50 mt-3">
                    <span className="text-sm font-bold text-gray-900">
                      ${typeof price === 'number' ? price.toFixed(2) : price}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        addToCart(item)
                      }}
                      disabled={item.stock === 0}
                      className="px-3 py-1.5 text-xs rounded-xl font-semibold bg-brand-primary text-white hover:opacity-90 disabled:bg-gray-100 disabled:text-gray-400 shadow-sm transition"
                    >
                      Añadir +
                    </button>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* PAGINACIÓN CON NÚMEROS CENTRADOS */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-10">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-rose-50 disabled:opacity-40 disabled:hover:bg-white transition"
              title="Página Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-9 h-9 rounded-xl text-xs font-semibold transition ${
                    currentPage === page
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-rose-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-rose-50 disabled:opacity-40 disabled:hover:bg-white transition"
              title="Página Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false)
          setIsCheckoutOpen(true)
        }}
      />

      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  )
}

export default CatalogPage
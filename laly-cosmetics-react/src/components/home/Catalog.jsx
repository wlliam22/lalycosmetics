import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../context/ProductsContext'
import { useCart } from '../../context/CartContext'
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react'

const ITEMS_PER_PAGE = 8

const Catalog = ({ selectedCategory, onCategoryChange, searchTerm, onClearSearch }) => {
  const { products, loading } = useProducts()
  const { addToCart } = useCart()
  const [currentPage, setCurrentPage] = useState(1)

  const categories = ['Todos', 'Cuidado Facial', 'Maquillaje', 'Cuidado Corporal', 'Accesorios']

  const handleClearSearch = () => {
    if (onClearSearch) {
      onClearSearch()
    } else {
      window.dispatchEvent(new CustomEvent('clearSearch'))
    }
  }

  // Filtrar por categoría y búsqueda
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const category = p.category || p.categoria || ''
      const title = p.title || p.nombre || ''
      const description = p.description || p.descripcion || ''

      const matchCategory =
        selectedCategory === 'Todos' ||
        category.toLowerCase() === selectedCategory.toLowerCase()

      const matchSearch =
        !searchTerm?.trim() ||
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase())

      return matchCategory && matchSearch
    })
  }, [products, selectedCategory, searchTerm])

  // Resetear paginación si cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchTerm])

  // Paginación (8 items por página)
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredProducts, currentPage])

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="catalogo" className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50/50 rounded-3xl my-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-gray-900">Catálogo Completo</h2>
          <p className="text-xs text-gray-500 mt-1">Explora nuestros productos disponibles en stock</p>
          {searchTerm && (
            <div className="flex items-center gap-2 mt-2 bg-brand-accent px-3 py-1.5 rounded-full w-fit">
              <Search className="w-3.5 h-3.5 text-brand-primary" />
              <span className="text-xs text-gray-700">
                {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''} para <span className="font-semibold">"{searchTerm}"</span>
              </span>
              <button 
                onClick={handleClearSearch}
                className="ml-1 p-0.5 rounded-full hover:bg-rose-200 transition"
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
          )}
        </div>

        {/* FILTROS POR CATEGORÍA */}
        <div className="flex flex-wrap gap-2 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                onCategoryChange(cat)
                document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className={`px-3.5 py-1.5 rounded-full font-medium transition shadow-sm ${
                selectedCategory === cat
                  ? 'bg-brand-primary text-white hover:opacity-90'
                  : 'bg-white text-gray-600 hover:bg-rose-50 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCT GRID CON CARDS MÁS PEQUEÑAS */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          Cargando catálogo...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium text-sm">
            {searchTerm 
              ? `No se encontraron productos que coincidan con "${searchTerm}"` 
              : 'No se encontraron productos en esta categoría.'}
          </p>
          {searchTerm && (
            <button 
              onClick={handleClearSearch}
              className="mt-4 text-xs text-brand-primary hover:underline font-semibold"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-4">
          {paginatedProducts.map((item) => {
            const image = item.images?.[0] || item.imagenUrl || 'https://via.placeholder.com/100'
            const title = item.title || item.nombre
            const category = item.category || item.categoria
            const price = item.price_usd ?? item.precio ?? 0

            return (
              <Link
                key={item.id}
                to={`/producto/${item.id}`}
                className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition"
              >
                <div>
                  {/* Aspect Ratio y altura limitada para reducir tamaño */}
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2.5 bg-gray-50 flex items-center justify-center p-2">
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
                  <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 mt-0.5 mb-1 leading-snug min-h-[2rem]">
                    {title}
                  </h3>
                  <p className="text-[11px] text-gray-400 line-clamp-2 mb-2 leading-tight">
                    {item.description || item.descripcion || ''}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-50 mt-auto">
                  <div>
                    <span className="text-[10px] text-gray-400 block -mb-1">Precio</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      ${typeof price === 'number' ? price.toFixed(2) : price}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      addToCart(item)
                    }}
                    disabled={item.stock === 0}
                    className={`px-2.5 py-1 text-[11px] rounded-xl font-semibold transition ${
                      item.stock > 0
                        ? 'bg-brand-primary text-white hover:opacity-90 shadow-sm'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {item.stock > 0 ? 'Agregar' : 'Agotado'}
                  </button>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* CONTROLES DE PAGINACIÓN CENTRADOS */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-rose-50 disabled:opacity-40 disabled:hover:bg-white transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 rounded-xl text-xs font-semibold transition ${
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
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-rose-50 disabled:opacity-40 disabled:hover:bg-white transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  )
}

export default Catalog
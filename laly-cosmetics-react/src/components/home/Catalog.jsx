import { Link } from 'react-router-dom'
import { useProducts } from '../../context/ProductsContext'
import { useCart } from '../../context/CartContext'
import { Search, X } from 'lucide-react'

const Catalog = ({ selectedCategory, onCategoryChange, searchTerm }) => {
  const { products, loading } = useProducts()
  const { addToCart } = useCart()

  const categories = ['Todos', 'Cuidado Facial', 'Maquillaje', 'Cuidado Corporal', 'Accesorios']

  // Filtrar por categoría y búsqueda
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'Todos' || p.category?.toLowerCase() === selectedCategory.toLowerCase()
    const matchSearch = searchTerm?.trim() === '' || 
      p.title?.toLowerCase().includes(searchTerm?.toLowerCase() || '') ||
      p.description?.toLowerCase().includes(searchTerm?.toLowerCase() || '')
    return matchCategory && matchSearch
  })

  // Limpiar búsqueda
  const clearSearch = () => {
    onCategoryChange('Todos')
    // Esto es un workaround porque el searchTerm viene de Home
    // Lo manejamos a través del input del Header, pero aquí solo reseteamos la categoría
    // Idealmente deberíamos tener un estado global, pero por ahora funciona
    window.dispatchEvent(new Event('clearSearch'))
  }

  return (
    <section id="catalogo" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50/50 rounded-3xl my-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-gray-900">Catálogo Completo</h2>
          <p className="text-xs text-gray-500 mt-1">Explora nuestros productos disponibles en stock</p>
          {searchTerm && (
            <div className="flex items-center gap-2 mt-2 bg-brand-accent px-3 py-1.5 rounded-full">
              <Search className="w-3.5 h-3.5 text-brand-primary" />
              <span className="text-xs text-gray-700">
                {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''} para <span className="font-semibold">"{searchTerm}"</span>
              </span>
              <button 
                onClick={() => {
                  // Limpiar búsqueda (necesitamos acceso a setSearchTerm desde Home)
                  // Por ahora, recargamos la página o usamos un evento personalizado
                  window.location.reload() // Temporal, luego mejoramos
                }}
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
              className={`px-4 py-2 rounded-full font-medium transition shadow-sm ${
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

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-400 text-sm">
            Cargando catálogo...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium text-sm">
              {searchTerm 
                ? `No se encontraron productos que coincidan con "${searchTerm}"` 
                : 'No se encontraron productos en esta categoría.'}
            </p>
            {searchTerm && (
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 text-xs text-brand-primary hover:underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          filteredProducts.map((item) => (
            <Link
              key={item.id}
              to={`/producto/${item.id}`}
              className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition"
            >
              <div>
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-gray-50">
                  <img
                    src={item.images?.[0] || 'https://via.placeholder.com/100'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {item.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center text-white text-xs font-bold uppercase">
                      Agotado
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-[#E5235E] uppercase tracking-wider">
                  {item.category}
                </span>
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mt-0.5 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                  {item.description || ''}
                </p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-50 mt-auto">
                <div>
                  <span className="text-xs text-gray-400 block -mb-1">Precio</span>
                  <span className="text-base font-bold text-gray-900">
                    ${item.price_usd?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    addToCart(item)
                  }}
                  disabled={item.stock === 0}
                  className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition ${
                    item.stock > 0
                      ? 'bg-[#E5235E] text-white hover:bg-[#C2184B] shadow-sm'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {item.stock > 0 ? 'Agregar' : 'Agotado'}
                </button>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  )
}

export default Catalog
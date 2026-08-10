import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Search, Truck, MapPin, Phone } from 'lucide-react'
import { useCart } from '../../context/CartContext'

const Header = ({ onCartOpen, showSearch = true }) => {
  const { cart } = useCart()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  
  const totalItems = cart.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <>
      <div className="bg-brand-primary text-white text-xs py-2 text-center font-medium tracking-wide flex items-center justify-center gap-4 flex-wrap">
        <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Envíos a toda Venezuela</span>
        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Tienda Virtual en Maracaibo</span>
        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> ¡Haz tu pedido directo a WhatsApp!</span>
      </div>

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center text-white font-serif font-bold text-xl shadow-md border-2 border-white">
              laly.
            </div>
            <div>
              <span className="block font-serif font-bold text-xl text-gray-900 tracking-tight leading-none">LALY</span>
              <span className="block text-[9px] tracking-[0.25em] text-brand-primary font-semibold uppercase">Cosmetics</span>
            </div>
          </Link>

          {showSearch && (
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar productos o categorías (presiona Enter)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition"
                />
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-primary">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-700">
            <Link to="/" className="hover:text-brand-primary transition">Inicio</Link>
            <Link to="/catalogo" className="hover:text-brand-primary transition">Catálogo</Link>                      
          </nav>

          <div className="flex items-center space-x-5">
            <button 
              onClick={onCartOpen}
              className="relative p-2 text-gray-600 hover:text-brand-primary transition"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-brand-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  )
}

export default Header
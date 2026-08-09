import { Link } from 'react-router-dom'
import { ShoppingBag, Search, Truck, MapPin, Phone } from 'lucide-react'
import { useCart } from '../../context/CartContext'

const Header = ({ onCartOpen, onSearch, showSearch = true }) => {
  const { cart } = useCart()
  
  const totalItems = cart.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0)

  return (
    <>
      {/* TOP BAR */}
      <div className="bg-brand-primary text-white text-xs py-2 text-center font-medium tracking-wide flex items-center justify-center gap-4 flex-wrap">
        <span className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5" />
          Envíos a toda Venezuela
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          Tienda Virtual en Maracaibo
        </span>
        <span className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5" />
          ¡Haz tu pedido directo a WhatsApp!
        </span>
      </div>

      {/* HEADER / NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center text-white font-serif font-bold text-xl shadow-md border-2 border-white">
              laly.
            </div>
            <div>
              <span className="block font-serif font-bold text-xl text-gray-900 tracking-tight leading-none">LALY</span>
              <span className="block text-[9px] tracking-[0.25em] text-brand-primary font-semibold uppercase">Cosmetics</span>
            </div>
          </Link>

          {/* BUSCADOR */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  onChange={(e) => onSearch?.(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          )}

          {/* NAV MENU */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-700">
            <a href="#inicio" className="hover:text-brand-primary transition">Inicio</a>
            <a href="#destacados" className="hover:text-brand-primary transition">Destacados</a>
            <a href="#catalogo" className="hover:text-brand-primary transition">Catálogo</a>
            <a href="#promos" className="hover:text-brand-primary transition">Ofertas</a>
            <a href="#categorias" className="hover:text-brand-primary transition">Categorías</a>
          </nav>

          {/* ICONS & CART */}
          <div className="flex items-center space-x-5">
            {showSearch && (
              <button className="md:hidden p-2 text-gray-600 hover:text-brand-primary transition">
                <Search className="w-5 h-5" />
              </button>
            )}
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
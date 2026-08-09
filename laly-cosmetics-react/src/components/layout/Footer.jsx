import { MapPin, Phone, CreditCard } from 'lucide-react'
import InstagramIcon from '../../assets/icons/Instagram'

const Footer = () => {
  
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
        <div>
          <h4 className="font-serif text-xl font-bold text-brand-primary mb-3">Laly Cosmetics</h4>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
            Venta de Cosméticos y algo más. Tienda Virtual con entregas en Maracaibo y envíos a toda Venezuela.
          </p>
        </div>
        <div>
          <h5 className="text-sm font-semibold uppercase tracking-wider mb-3">Contacto</h5>
          <p className="text-xs text-gray-400 flex items-center justify-center md:justify-start gap-2">
            <MapPin className="w-3.5 h-3.5" /> Maracaibo - Venezuela
          </p>
          <p className="text-xs text-gray-400 mt-1 flex items-center justify-center md:justify-start gap-2">
            <Phone className="w-3.5 h-3.5" /> 0424-6766457
          </p>
          <p className="text-xs text-gray-400 mt-1 flex items-center justify-center md:justify-start gap-2">
            <InstagramIcon className="w-3.5 h-3.5" /> @lalycosmetic.3
          </p>
        </div>
        <div>
          <h5 className="text-sm font-semibold uppercase tracking-wider mb-3">Formas de Pago</h5>
          <p className="text-xs text-gray-400 flex items-center justify-center md:justify-start gap-2">
            <CreditCard className="w-3.5 h-3.5" /> Pago Móvil • Zelle • Efectivo USD
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Atención personalizada y confirmación inmediata por WhatsApp.
          </p>
        </div>
      </div>
      <div className="border-t border-gray-800 pt-6 text-center text-[11px] text-gray-500">
        &copy; 2026 Laly Cosmetics. Todos los derechos reservados.
      </div>
    </footer>
  )
}

export default Footer
import { X, ShoppingBag, Send, Calendar, Hash } from 'lucide-react'
import { useCart } from '../../context/CartContext'

const CheckoutModal = ({ isOpen, onClose }) => {
  const { cart, getTotal } = useCart()

  if (!isOpen) return null

  // Generar número de cotización
  const now = new Date()
  const cotizacion = `COT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
  const fecha = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

  // Construir mensaje de WhatsApp
  const buildWhatsAppMessage = () => {
    let message = `🌸 *¡HOLA LALY COSMETICS! QUIERO PROCESAR MI PEDIDO* 🌸\n\n`
    message += `_______________________________________\n`
    message += `*N° de Cotización:* ${cotizacion}\n`
    message += `*Fecha:* ${fecha}\n\n`
    message += `<ShoppingBag className="w-4 h-4 text-brand-primary" /> *DETALLE DEL PEDIDO:*\n`

    cart.forEach(item => {
      const price = typeof item.precio === 'string'
        ? parseFloat(item.precio.replace(/[^0-9.-]+/g, "")) || 0
        : item.precio || 0
      const qty = parseInt(item.quantity) || 1
      const subtotal = price * qty
      message += `• ${qty}x ${item.nombre} ($${price.toFixed(2)} c/u) = $${subtotal.toFixed(2)}\n`
    })

    message += `\n_______________________________________\n`
    message += `💰 *TOTAL ESTIMADO:* $${getTotal().toFixed(2)} USD\n\n`
    message += `📌 *DATOS PARA LA ENTREGA / ENVÍO:*\n`
    message += `• *Nombre:* [Nombre del Cliente]\n`
    message += `• *Método de Pago:* [Pago Móvil / Zelle / Efectivo]\n`
    message += `• *Ubicación / Dirección:* [Zona / Maracaibo]\n\n`
    message += `Quedo a la espera de sus datos bancarios para confirmar el pago. ¡Muchas gracias!`

    return encodeURIComponent(message)
  }

  const handleSendWhatsApp = () => {
    const url = `https://wa.me/584246766457?text=${buildWhatsAppMessage()}`
    window.open(url, '_blank')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 flex justify-between items-center p-6 border-b border-rose-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-accent rounded-full">
              <ShoppingBag className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-gray-800">Resumen del Pedido</h3>
              <p className="text-xs text-gray-400">Revisa los detalles antes de enviar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="p-6 space-y-6">
          {/* Cotización */}
          <div className="bg-brand-nude rounded-2xl p-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-brand-primary" />
              <span className="text-xs font-medium text-gray-600">Cotización:</span>
              <span className="text-xs font-bold text-brand-primary">{cotizacion}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-primary" />
              <span className="text-xs font-medium text-gray-600">Fecha:</span>
              <span className="text-xs font-bold text-gray-700">{fecha}</span>
            </div>
          </div>

          {/* Lista de productos */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">🛒 Detalle del Pedido</h4>
            {cart.map((item) => {
              const price = typeof item.precio === 'string'
                ? parseFloat(item.precio.replace(/[^0-9.-]+/g, "")) || 0
                : item.precio || 0
              const qty = parseInt(item.quantity) || 1
              const subtotal = price * qty

              return (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imagenUrl || 'https://via.placeholder.com/100'}
                      alt={item.nombre}
                      className="w-12 h-12 object-cover rounded-xl border border-gray-100"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.nombre}</p>
                      <p className="text-xs text-gray-400">{qty} x ${price.toFixed(2)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
              )
            })}
          </div>

          {/* Total */}
          <div className="bg-brand-accent rounded-2xl p-4 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">Total Estimado</span>
            <span className="text-2xl font-bold text-brand-primary">${getTotal().toFixed(2)} USD</span>
          </div>

          {/* Botón WhatsApp */}
          <button
            onClick={handleSendWhatsApp}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3.5 rounded-2xl font-semibold hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-200/50 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            Enviar Pedido por WhatsApp
          </button>
          <button
            onClick={onClose}
            className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Seguir comprando
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckoutModal
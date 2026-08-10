import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { db } from '../../firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { X, Send, ShoppingBag, User, Phone, MapPin } from 'lucide-react'

const PHONE_NUMBER = '584246766457' // Número de WhatsApp Lalycosmetics

const CheckoutModal = ({ isOpen, onClose }) => {
  const { cart, clearCart } = useCart()
  const [clientName, setClientName] = useState('')
  const [clientLocation, setClientLocation] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const total = cart.reduce((acc, item) => {
    const price = item.price_usd ?? item.precio ?? 0
    return acc + price * item.quantity
  }, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!clientName.trim() || !clientLocation.trim() || !clientPhone.trim()) {
      alert('Por favor completa todos los campos obligatorios.')
      return
    }

    setLoading(true)

    try {
      const quoteItems = cart.map((item) => ({
        id: item.id,
        nombre: item.nombre || item.title,
        precio: item.price_usd ?? item.precio ?? 0,
        cantidad: item.quantity
      }))

      // Guardar en Firestore para que el admin lo vea
      const docRef = await addDoc(collection(db, 'quotes'), {
        clienteNombre: clientName.trim(),
        clienteUbicacion: clientLocation.trim(),
        clienteTelefono: clientPhone.trim(),
        items: quoteItems,
        total: total,
        status: 'pendiente',
        createdAt: serverTimestamp()
      })

      // Generar mensaje estructurado hacia WhatsApp
      let message = `*¡Hola Lalycosmetics! Quiero realizar un pedido.*\n\n`
      message += `*N° Cotización:* #${docRef.id.slice(0, 6)}\n`
      message += `*Cliente:* ${clientName.trim()}\n`
      message += `*Ubicación:* ${clientLocation.trim()}\n`
      message += `*Teléfono:* ${clientPhone.trim()}\n\n`
      message += `*Detalle del Pedido:*\n`

      cart.forEach((item) => {
        const itemPrice = item.price_usd ?? item.precio ?? 0
        const subtotal = itemPrice * item.quantity
        message += `• ${item.quantity}x ${item.nombre || item.title} - $${subtotal.toFixed(2)}\n`
      })

      message += `\n*Total a pagar:* $${total.toFixed(2)}\n\n`
      message += `Quedo a la espera de sus datos para concretar el pago y envío.`

      const whatsappUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`

      clearCart()
      onClose()
      window.open(whatsappUrl, '_blank')
    } catch (error) {
      console.error('Error al guardar cotización:', error)
      alert('Hubo un error al procesar la cotización.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl border border-rose-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-brand-primary">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-gray-900">Datos para el Envío</h2>
            <p className="text-xs text-gray-500">Completa tus datos para enviarnos la cotización</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-primary" /> Nombre completo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. María Pérez"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-primary" /> Ubicación *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Maracaibo, Sector Tierra Negra"
              value={clientLocation}
              onChange={(e) => setClientLocation(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-primary" /> Teléfono *
            </label>
            <input
              type="tel"
              required
              placeholder="Ej. 04246766457"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-100/50 mt-4">
            <div className="flex justify-between items-center text-xs font-bold text-gray-900">
              <span>Total del Pedido:</span>
              <span className="text-base text-brand-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cart.length === 0}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 transition mt-2"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Procesando...' : 'Enviar Pedido por WhatsApp'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CheckoutModal
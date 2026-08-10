import { useState, useEffect } from 'react'
import { db } from '../firebase/config'
import { 
  collection, 
  onSnapshot, 
  doc, 
  runTransaction, 
  query, 
  orderBy 
} from 'firebase/firestore'
import { 
  Check, 
  Printer, 
  Search, 
  FileText, 
  Calendar, 
  User, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react'

const QuotesAdmin = () => {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [processingId, setProcessingId] = useState(null)

  // 1. Escuchar cotizaciones en tiempo real
  useEffect(() => {
    const q = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      setQuotes(docs)
      setLoading(false)
    }, (error) => {
      console.error('Error al cargar cotizaciones:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // 2. Confirmar Venta + Descuento de Stock en Transacción Atómica
  const handleConfirmSale = async (quote) => {
    if (quote.status === 'completada') return
    
    if (!window.confirm(`¿Confirmar venta de la cotización #${quote.id.slice(0, 6)}? Esto descontará el inventario.`)) {
      return
    }

    setProcessingId(quote.id)

    try {
      await runTransaction(db, async (transaction) => {
        // Verificar y descontar el stock de cada ítem de la cotización
        for (const item of quote.items) {
          const productRef = doc(db, 'products', item.id)
          const productSnap = await transaction.get(productRef)

          if (!productSnap.exists()) {
            throw new Error(`El producto "${item.nombre || item.title}" ya no existe en el inventario.`)
          }

          const currentStock = productSnap.data().stock || 0
          if (currentStock < item.cantidad) {
            throw new Error(`Stock insuficiente para "${item.nombre || item.title}". Disponible: ${currentStock}, Requerido: ${item.cantidad}`)
          }

          transaction.update(productRef, {
            stock: currentStock - item.cantidad
          })
        }

        // Marcar la cotización como completada
        const quoteRef = doc(db, 'quotes', quote.id)
        transaction.update(quoteRef, {
          status: 'completada',
          confirmedAt: new Date()
        })
      })

      alert('¡Venta realizada con éxito e inventario actualizado!')
    } catch (error) {
      console.error('Error al procesar la venta:', error)
      alert(`No se pudo procesar la venta: ${error.message}`)
    } finally {
      setProcessingId(null)
    }
  }

  // 3. Reimprimir / Descargar Cotización
  const handlePrint = (quote) => {
    const printWindow = window.open('', '_blank')
    const itemsHtml = quote.items.map((item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.nombre || item.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.cantidad}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${Number(item.precio).toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.cantidad * item.precio).toFixed(2)}</td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <html>
        <head>
          <title>Cotización #${quote.id.slice(0, 6)}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { color: #e11d48; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f8fafc; padding: 10px; text-align: left; font-size: 12px; }
            .total { text-align: right; margin-top: 20px; font-size: 16px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Cotización de Compra</h1>
          <p><strong>N° Cotización:</strong> #${quote.id.slice(0, 6)}</p>
          <p><strong>Cliente:</strong> ${quote.clienteNombre || 'Cliente General'}</p>
          <p><strong>Fecha:</strong> ${quote.createdAt?.toDate ? quote.createdAt.toDate().toLocaleDateString() : 'N/A'}</p>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th style="text-align: center;">Cant.</th>
                <th style="text-align: right;">Precio U.</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <p class="total">Total: $${Number(quote.total || 0).toFixed(2)}</p>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const filteredQuotes = quotes.filter((q) => {
    const client = (q.clienteNombre || '').toLowerCase()
    const id = q.id.toLowerCase()
    return client.includes(searchTerm.toLowerCase()) || id.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-rose-100 shadow-sm">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
              Gestión de Cotizaciones
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Revisa, reimprime y confirma ventas para descontar automáticamente del inventario
            </p>
          </div>
        </div>

        {/* BÚSQUEDA */}
        <div className="flex bg-white p-4 rounded-2xl border border-rose-50 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-primary text-gray-700"
            />
          </div>
        </div>

        {/* TABLA DE COTIZACIONES */}
        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-400">
              Cargando cotizaciones...
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
              <FileText className="w-8 h-8 text-gray-300" />
              <span>No hay cotizaciones registradas</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-rose-50/50 border-b border-rose-100 text-gray-500 font-medium">
                  <tr>
                    <th className="py-3.5 px-4">Cotización</th>
                    <th className="py-3.5 px-4">Cliente</th>
                    <th className="py-3.5 px-4">Items</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4 text-center">Estado</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredQuotes.map((q) => {
                    const isCompleted = q.status === 'completada'
                    const itemCount = q.items?.reduce((acc, item) => acc + item.cantidad, 0) || 0

                    return (
                      <tr key={q.id} className="hover:bg-rose-50/20 transition">
                        <td className="py-3 px-4 font-mono font-semibold text-gray-700">
                          #{q.id.slice(0, 6)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-gray-800 font-medium">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span>{q.clienteNombre || 'Cliente Mozo / General'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {itemCount} unids.
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900">
                          ${Number(q.total || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-amber-50 text-amber-600'
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                Venta Confirmada
                              </>
                            ) : (
                              'Pendiente'
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            
                            {/* Botón 1: Confirmar Venta / Descontar Inventario */}
                            <button
                              onClick={() => handleConfirmSale(q)}
                              disabled={isCompleted || processingId === q.id}
                              title={isCompleted ? 'Venta ya procesada' : 'Confirmar Venta y Descontar Stock'}
                              className={`p-2 rounded-xl transition flex items-center justify-center ${
                                isCompleted
                                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                              }`}
                            >
                              {processingId === q.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4 stroke-[2.5]" />
                              )}
                            </button>

                            {/* Botón 2: Reimprimir / Descargar Cotización */}
                            <button
                              onClick={() => handlePrint(q)}
                              title="Reimprimir o Descargar Cotización"
                              className="p-2 bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-brand-primary rounded-xl transition"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuotesAdmin
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
  User, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import { LogOut } from 'lucide-react'

const QuotesAdmin = () => {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [processingId, setProcessingId] = useState(null)

  // Escuchar cotizaciones en tiempo real
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

  // Confirmar Venta + Descuento de Stock
  const handleConfirmSale = async (quote) => {
    if (quote.status === 'completada') return
    
    if (!window.confirm(`¿Confirmar venta de la cotización #${quote.id.slice(0, 6)}? Esto descontará el inventario.`)) {
      return
    }

    setProcessingId(quote.id)

    try {
      await runTransaction(db, async (transaction) => {
        for (const item of quote.items) {
          const productRef = doc(db, 'products', item.id)
          const productSnap = await transaction.get(productRef)

          if (!productSnap.exists()) {
            throw new Error(`El producto "${item.nombre || item.title}" no existe en la base de datos.`)
          }

          const currentStock = productSnap.data().stock || 0
          if (currentStock < item.cantidad) {
            throw new Error(`Stock insuficiente para "${item.nombre || item.title}". Disponible: ${currentStock}, Requerido: ${item.cantidad}`)
          }

          transaction.update(productRef, {
            stock: currentStock - item.cantidad
          })
        }

        const quoteRef = doc(doc(db, 'quotes', quote.id))
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

  // Reimprimir / Descargar Cotización PDF en formato Carta Vertical
  const handlePrint = (quote) => {
    const printWindow = window.open('', '_blank')
    const itemsHtml = quote.items.map((item) => `
      <tr>
        <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0;">${item.nombre || item.title}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.cantidad}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${Number(item.precio).toFixed(2)}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${(item.cantidad * item.precio).toFixed(2)}</td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cotizacion_${quote.id.slice(0, 6)}</title>
          <style>
            @page {
              size: letter portrait;
              margin: 12mm;
            }
            @media print {
              html, body {
                width: 8.5in;
                height: 11in;
                margin: 0;
                padding: 0;
              }
            }
            body { 
              font-family: Arial, Helvetica, sans-serif; 
              color: #1e293b; 
              padding: 20px;
              margin: 0;
            }
            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #e11d48;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .brand { color: #e11d48; font-size: 22px; font-weight: bold; margin: 0; }
            .subtext { font-size: 11px; color: #64748b; margin-top: 3px; }
            .info-grid {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              font-size: 12px;
              background-color: #fff1f2;
              padding: 12px;
              border-radius: 8px;
            }
            .info-grid p { margin: 2px 0; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 15px; 
              font-size: 12px;
            }
            th { 
              background: #f8fafc; 
              color: #0f172a;
              padding: 10px 8px; 
              text-align: left; 
              font-weight: bold;
              border-bottom: 2px solid #cbd5e1;
            }
            .total-box { 
              margin-top: 25px; 
              text-align: right; 
              font-size: 13px; 
            }
            .total-amount {
              font-size: 20px;
              color: #e11d48;
              font-weight: bold;
              margin-top: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <p class="brand">LALY COSMETICS</p>
              <p class="subtext">Maracaibo, Venezuela</p>
              <p class="subtext">Contacto: +58 424-6766457</p>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 16px; font-weight: bold; margin: 0; color: #0f172a;">COTIZACIÓN</p>
              <p class="subtext">N°: #${quote.id.slice(0, 6)}</p>
              <p class="subtext">Fecha: ${quote.createdAt?.toDate ? quote.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div class="info-grid">
            <div>
              <p><strong>Cliente:</strong> ${quote.clienteNombre || 'Cliente General'}</p>
              <p><strong>Ubicación:</strong> ${quote.clienteUbicacion || 'N/A'}</p>
            </div>
            <div style="text-align: right;">
              <p><strong>Teléfono:</strong> ${quote.clienteTelefono || 'N/A'}</p>
              <p><strong>Estado:</strong> ${quote.status === 'completada' ? 'Venta Confirmada' : 'Pendiente'}</p>
            </div>
          </div>

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

          <div class="total-box">
            <p style="margin: 0; color: #64748b;">TOTAL ESTIMADO:</p>
            <p class="total-amount">$${Number(quote.total || 0).toFixed(2)} USD</p>
          </div>
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
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* BUSCADOR */}
        <div className="flex bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
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
                            <span>{q.clienteNombre || 'Cliente General'}</span>
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

                            <button
                              onClick={() => handlePrint(q)}
                              title="Imprimir / Descargar Cotización"
                              className="p-2 bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-brand-primary rounded-xl transition"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => signOut(auth)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold transition"
>
                            <LogOut className="w-4 h-4" />
                              Cerrar Sesión
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
import jsPDF from 'jspdf'

// Formateador correlativo: COT-YYYYMMDD-HHMM
export const generateOrderCode = () => {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const timeStr = now.toTimeString().slice(0, 5).replace(':', '')
  return `COT-${dateStr}-${timeStr}`
}

// 1. Generación del comprobante PDF
export const generateOrderPDF = ({ cart, total, orderCode, customerData }) => {
  const doc = new jsPDF()

  // Membrete Laly Cosmetics
  doc.setFontSize(18)
  doc.setTextColor(229, 35, 94) // #E5235E
  doc.text('LALY COSMETICS', 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text('RIF: J-50000000-0 | Maracaibo, Venezuela', 14, 26)
  doc.text('Contacto: +58 424-6766457', 14, 31)

  // Datos del Documento
  doc.setFontSize(12)
  doc.setTextColor(31)
  doc.text(`N° Cotización: ${orderCode}`, 130, 20)
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 130, 26)

  doc.setLineWidth(0.5)
  doc.setDrawColor(200)
  doc.line(14, 36, 196, 36)

  // Datos del Cliente
  if (customerData?.nombre) {
    doc.setFontSize(11)
    doc.text(`Cliente: ${customerData.nombre}`, 14, 44)
    doc.text(`Método de Pago: ${customerData.metodoPago || 'Por acordar'}`, 14, 50)
    doc.text(`Dirección: ${customerData.direccion || 'Maracaibo'}`, 14, 56)
  }

  // Tabla de Productos
  let startY = customerData?.nombre ? 66 : 46
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Descripción', 14, startY)
  doc.text('Cant.', 120, startY)
  doc.text('P. Unit ($)', 145, startY)
  doc.text('Subtotal ($)', 175, startY)

  doc.line(14, startY + 2, 196, startY + 2)
  doc.setFont('helvetica', 'normal')

  let currentY = startY + 8
  cart.forEach((item) => {
    const price =
      typeof item.precio === 'string'
        ? parseFloat(item.precio.replace(/[^0-9.-]+/g, '')) || 0
        : item.precio || 0
    const qty = parseInt(item.quantity) || 1
    const subtotal = (price * qty).toFixed(2)

    doc.text(item.nombre.substring(0, 45), 14, currentY)
    doc.text(String(qty), 125, currentY)
    doc.text(Number(price).toFixed(2), 148, currentY)
    doc.text(subtotal, 178, currentY)
    currentY += 7
  })

  doc.line(14, currentY + 2, 196, currentY + 2)

  // Total
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(`TOTAL ESTIMADO: $${total.toFixed(2)} USD`, 125, currentY + 12)

  // Descarga del archivo en la PC/Móvil del cliente
  doc.save(`Cotizacion_LalyCosmetics_${orderCode}.pdf`)

  // Retornamos el Base64 por si luego lo envías por EmailJS u otro servicio
  return {
    base64: doc.output('datauristring')
  }
}

// 2. Redirección y formato de WhatsApp Business
export const checkoutToWhatsApp = ({ cart, total, orderCode, customerData }) => {
  const phone = '584246766457'

  const itemsText = cart
    .map(i => {
      const price =
        typeof i.precio === 'string'
          ? parseFloat(i.precio.replace(/[^0-9.-]+/g, '')) || 0
          : i.precio || 0
      const qty = parseInt(i.quantity) || 1
      return `• ${qty}x ${i.nombre} ($${(price * qty).toFixed(2)})`
    })
    .join('\n')

  const message = `🌸 *¡HOLA LALY COSMETICS! QUIERO PROCESAR MI PEDIDO* 🌸

*N° de Cotización:* ${orderCode}
*Fecha:* ${new Date().toLocaleDateString('es-ES')}

🛒 *DETALLE DEL PEDIDO:*
${itemsText}

💰 *TOTAL ESTIMADO:* $${total.toFixed(2)} USD

📌 *DATOS PARA LA ENTREGA / ENVÍO:*
• *Nombre:* ${customerData.nombre || 'No especificado'}
• *Método de Pago:* ${customerData.metodoPago || 'Por acordar'}
• *Ubicación / Dirección:* ${customerData.direccion || 'No especificada'}

Quedo a la espera de sus datos bancarios para confirmar el pago. ¡Muchas gracias!`

  // URL a la API de WhatsApp para forzar la vista Web/App sin errores de sistema en Windows
  const encodedUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
  
  // Redirección limpia
  window.location.href = encodedUrl
}
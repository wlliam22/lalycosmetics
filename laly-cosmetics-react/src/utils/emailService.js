import emailjs from '@emailjs/browser'

// Configura tus claves de EmailJS
const SERVICE_ID = 'service_90bi44i'
const TEMPLATE_ID = 'TU_TEMPLATE_ID'
const PUBLIC_KEY = 'TU_PUBLIC_KEY'

export const sendOrderEmailToStore = async ({ customerData, cotizacion, fecha, total, cart, pdfBase64 }) => {
  try {
    const templateParams = {
      order_id: cotizacion,
      date: fecha,
      customer_name: customerData.nombre,
      payment_method: customerData.metodoPago,
      address: customerData.direccion,
      total_amount: `$${total.toFixed(2)} USD`,
      // Puedes adjuntar el PDF generado en Base64 según el soporte de tu plantilla de EmailJS
      content_pdf: pdfBase64, 
    }

    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
    console.log('Pedido enviado por correo con éxito')
  } catch (error) {
    console.error('Error enviando correo a la tienda:', error)
  }
}
import { useState } from "react";
import { X, ShoppingBag, Send, Calendar, Hash, FileText } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { generateOrderPDF } from "../../utils/checkout";

const CheckoutModal = ({ isOpen, onClose }) => {
  const { cart, getTotal, clearCart } = useCart();

  const [customerData, setCustomerData] = useState({
    nombre: "",
    metodoPago: "Pago Móvil",
    direccion: "",
  });

  if (!isOpen) return null;

  const now = new Date();
  const cotizacion = `COT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
  const fecha = now.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const total = getTotal();

  const handleInputChange = (e) => {
    setCustomerData({
      ...customerData,
      [e.target.name]: e.target.value,
    });
  };

  const buildWhatsAppMessage = () => {
    let message = `🌸 *¡HOLA LALY COSMETICS! QUIERO PROCESAR MI PEDIDO* 🌸\n\n`;
    message += `_______________________________________\n`;
    message += `*N° de Cotización:* ${cotizacion}\n`;
    message += `*Fecha:* ${fecha}\n\n`;
    message += `🛒 *DETALLE DEL PEDIDO:*\n`;

    cart.forEach((item) => {
      const price =
        typeof item.precio === "string"
          ? parseFloat(item.precio.replace(/[^0-9.-]+/g, "")) || 0
          : item.precio || 0;
      const qty = parseInt(item.quantity) || 1;
      const subtotal = price * qty;
      message += `• ${qty}x ${item.nombre} ($${price.toFixed(2)} c/u) = $${subtotal.toFixed(2)}\n`;
    });

    message += `\n_______________________________________\n`;
    message += `💰 *TOTAL ESTIMADO:* $${total.toFixed(2)} USD\n\n`;
    message += `📌 *DATOS PARA LA ENTREGA / ENVÍO:*\n`;
    message += `• *Nombre:* ${customerData.nombre || "No especificado"}\n`;
    message += `• *Método de Pago:* ${customerData.metodoPago}\n`;
    message += `• *Ubicación / Dirección:* ${customerData.direccion || "No especificada"}\n\n`;
    message += `Adjunto mi cotización descargada en PDF. Quedo a la espera de sus datos bancarios para confirmar el pago. ¡Muchas gracias!`;

    return encodeURIComponent(message);
  };

  const handleProcessOrder = () => {
    // 1. Genera y descarga automáticamente la cotización PDF
    generateOrderPDF({ cart, total, orderCode: cotizacion, customerData });

    // 2. Redirige a WhatsApp con los datos completados
    const url = `https://wa.me/584246766457?text=${buildWhatsAppMessage()}`;
    window.open(url, "_blank");

    if (clearCart) clearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-rose-100">
        {/* HEADER */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 flex justify-between items-center p-6 border-b border-rose-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-accent rounded-full">
              <ShoppingBag className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-gray-800">
                Resumen del Pedido
              </h3>
              <p className="text-xs text-gray-400">
                Completa tus datos y finaliza la compra
              </p>
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
        <div className="p-6 space-y-5">
          {/* Metadata Cotización */}
          <div className="bg-brand-nude rounded-2xl p-4 flex flex-wrap items-center justify-between gap-2 border border-rose-100/50">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-brand-primary" />
              <span className="text-xs font-medium text-gray-600">
                Cotización:
              </span>
              <span className="text-xs font-bold text-brand-primary">
                {cotizacion}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-primary" />
              <span className="text-xs font-medium text-gray-600">Fecha:</span>
              <span className="text-xs font-bold text-gray-700">{fecha}</span>
            </div>
          </div>

          {/* Formulario de Datos del Cliente */}
          <div className="space-y-3 bg-rose-50/30 p-4 rounded-2xl border border-rose-100/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Datos de Entrega / Pago
            </h4>
            <div className="space-y-2">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre completo *"
                value={customerData.nombre}
                onChange={handleInputChange}
                className="w-full p-2.5 text-xs bg-white border border-rose-100 rounded-xl focus:outline-none focus:border-brand-primary text-gray-700 placeholder-gray-400 shadow-sm"
              />
              <div className="flex gap-2">
                <select
                  name="metodoPago"
                  value={customerData.metodoPago}
                  onChange={handleInputChange}
                  className="w-1/2 p-2.5 text-xs bg-white border border-rose-100 rounded-xl focus:outline-none focus:border-brand-primary text-gray-700 shadow-sm"
                >
                  <option value="Pago Móvil">Pago Móvil</option>
                  <option value="Zelle">Zelle</option>
                  <option value="Efectivo">Efectivo</option>
                </select>
                <input
                  type="text"
                  name="direccion"
                  placeholder="Ubicación / Sector *"
                  value={customerData.direccion}
                  onChange={handleInputChange}
                  className="w-1/2 p-2.5 text-xs bg-white border border-rose-100 rounded-xl focus:outline-none focus:border-brand-primary text-gray-700 placeholder-gray-400 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Lista de productos */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Detalle del Pedido
            </h4>
            <div className="max-h-40 overflow-y-auto pr-1 space-y-2 scrollbar-hide">
              {cart.map((item) => {
                const price =
                  typeof item.precio === "string"
                    ? parseFloat(item.precio.replace(/[^0-9.-]+/g, "")) || 0
                    : item.precio || 0;
                const qty = parseInt(item.quantity) || 1;
                const subtotal = price * qty;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-rose-100/50 pb-2"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          item.imagenUrl || "https://via.placeholder.com/100"
                        }
                        alt={item.nombre}
                        className="w-10 h-10 object-cover rounded-xl border border-rose-100 flex-shrink-0"
                      />
                      <div>
                        <p className="text-xs font-semibold text-gray-800 line-clamp-1">
                          {item.nombre}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {qty} x ${price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total */}
          <div className="bg-brand-accent rounded-2xl p-4 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">
              Total Estimado
            </span>
            <span className="text-2xl font-bold text-brand-primary">
              ${total.toFixed(2)} USD
            </span>
          </div>

          {/* Acciones */}
          <div className="space-y-2">
            <button
              onClick={handleProcessOrder}
              disabled={!customerData.nombre || !customerData.direccion}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3.5 rounded-2xl font-semibold hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-200/50 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <span>Descargar PDF y Enviar a WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="w-full text-xs text-gray-400 hover:text-gray-600 text-center py-1 transition-colors"
            >
              Seguir comprando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
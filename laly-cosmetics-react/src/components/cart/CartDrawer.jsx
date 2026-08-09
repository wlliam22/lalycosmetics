import { X, ShoppingBag, ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../../context/CartContext";

const CartDrawer = ({ isOpen, onClose, onCheckout  }) => {
  const { cart, updateQuantity, removeFromCart, getTotal, getItemCount } =
    useCart();

  if (!isOpen) return null;

  const totalItems = getItemCount();

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
      {/* PANEL DEL CARRITO - Con fondo sutil y degradado */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md h-full shadow-2xl flex flex-col justify-between p-6 animate-slide-in-right border-l border-rose-100/50">
        {/* HEADER CARRITO */}
        <div>
          <div className="flex justify-between items-center border-b border-rose-100/70 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-accent rounded-full">
                <ShoppingBag className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-gray-800 leading-tight">
                  Tu Carrito
                </h3>
                <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                  {totalItems} {totalItems === 1 ? "producto" : "productos"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100/50 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CONTENEDOR DE ITEMS */}
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-hide">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-brand-accent rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 text-brand-primary/60" />
                </div>
                <p className="text-gray-600 font-medium text-sm">
                  Tu carrito está vacío
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                  ¡Explora nuestros productos y dale un toque de belleza a tu
                  día!
                </p>
              </div>
            ) : (
              cart.map((item) => {
                const itemPrice =
                  typeof item.precio === "string"
                    ? parseFloat(item.precio.replace(/[^0-9.-]+/g, "")) || 0
                    : item.precio || 0;
                const qty = parseInt(item.quantity) || 1;
                const itemTotal = itemPrice * qty;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-rose-50 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <img
                      src={item.imagenUrl || "https://via.placeholder.com/100"}
                      alt={item.nombre}
                      className="w-16 h-16 object-cover rounded-xl border border-rose-100 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-800 truncate">
                        {item.nombre}
                      </h4>
                      <p className="text-xs text-brand-primary font-medium">
                        ${itemPrice.toFixed(2)} c/u
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-full bg-brand-accent text-brand-primary flex items-center justify-center hover:bg-rose-200 transition-colors duration-200"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-semibold text-gray-700 w-6 text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-full bg-brand-accent text-brand-primary flex items-center justify-center hover:bg-rose-200 transition-colors duration-200"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right flex flex-col justify-between items-end h-full">
                      <span className="text-sm font-bold text-gray-900">
                        ${itemTotal.toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-rose-400 hover:text-rose-600 transition-colors duration-200 p-1 rounded-full hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* FOOTER Y BOTÓN PROCESAR */}
        {cart.length > 0 && (
          <div className="border-t border-rose-100/70 pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">
                Total Estimado
              </span>
              <span className="text-2xl font-bold text-brand-primary">
                ${getTotal().toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => {
                if (onCheckout) onCheckout();
              }}
              className="w-full bg-gradient-to-r from-brand-primary to-rose-400 text-white py-3.5 rounded-2xl font-semibold hover:from-brand-hover hover:to-rose-500 shadow-lg shadow-rose-200/50 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <span>Procesar Pedido</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;

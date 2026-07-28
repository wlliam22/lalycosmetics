// Estado global del carrito
let cart = JSON.parse(localStorage.getItem('laly_cart')) || [];

// Guardar en localStorage
function saveCart() {
  localStorage.setItem('laly_cart', JSON.stringify(cart));
}

// Abrir y Cerrar Modal/Drawer del Carrito
function toggleCartModal() {
  const modal = document.getElementById('cart-modal');
  const drawer = document.getElementById('cart-drawer');

  if (!modal || !drawer) return;

  const isHidden = modal.classList.contains('hidden');

  if (isHidden) {
    openCartModal();
  } else {
    modal.classList.add('opacity-0');
    drawer.classList.add('translate-x-full');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
  }
}

// Abrir forzado
function openCartModal() {
  const modal = document.getElementById('cart-modal');
  const drawer = document.getElementById('cart-drawer');

  if (!modal || !drawer) return;

  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    drawer.classList.remove('translate-x-full');
  }, 10);
}

// Sistema Toast
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-5 left-5 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgColor = type === 'error' ? 'bg-amber-800' : 'bg-gray-900';
  
  toast.className = `${bgColor} text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 transform transition-all duration-300 opacity-0 translate-y-2 pointer-events-auto`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('opacity-0', 'translate-y-2');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Mapeador exacto para la estructura de tu Firestore
function normalizeProductData(product) {
  if (!product) return null;

  // 1. Extraer ID del documento de Firestore
  const id = String(product.id || product.docId || product._id || Date.now());

  // 2. Extraer Nombre/Título (Firestore usa 'title')
  const nombre = product.title || product.nombre || product.name || 'Producto sin título';

  // 3. Extraer Precio (Firestore usa 'price_usd')
  let rawPrice = product.price_usd !== undefined 
    ? product.price_usd 
    : (product.precio !== undefined ? product.precio : product.price);

  if (typeof rawPrice === 'string') {
    rawPrice = rawPrice.replace(/[^0-9.-]+/g, "");
  }
  const precio = parseFloat(rawPrice) || 0;

  // 4. Extraer Imagen (Firestore usa un array 'images')
  let imagenUrl = 'https://via.placeholder.com/100';
  if (Array.isArray(product.images) && product.images.length > 0) {
    imagenUrl = product.images[0];
  } else if (typeof product.imagenUrl === 'string') {
    imagenUrl = product.imagenUrl;
  } else if (typeof product.image === 'string') {
    imagenUrl = product.image;
  }

  // 5. Stock
  const stock = parseInt(product.stock) || 99;

  return { id, nombre, precio, imagenUrl, stock };
}

// Agregar un producto al carrito
function addToCart(rawProduct) {
  const product = normalizeProductData(rawProduct);
  if (!product) return;

  const existingIndex = cart.findIndex(item => String(item.id) === String(product.id));

  if (existingIndex > -1) {
    const currentQty = cart[existingIndex].quantity;
    if (product.stock && (currentQty + 1) > product.stock) {
      showToast(`⚠️ Solo hay ${product.stock} unidades disponibles.`, 'error');
      openCartModal();
      return;
    }
    cart[existingIndex].quantity += 1;
    // Si ya existía pero con precio 0 previo, actualizamos sus datos con la información limpia
    cart[existingIndex].precio = product.precio;
    cart[existingIndex].nombre = product.nombre;
    cart[existingIndex].imagenUrl = product.imagenUrl;
  } else {
    if (product.stock && product.stock < 1) {
      showToast(`⚠️ Producto agotado.`, 'error');
      return;
    }
    cart.push({
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      imagenUrl: product.imagenUrl,
      quantity: 1,
      stock: product.stock
    });
  }

  saveCart();
  renderCart();
  openCartModal();
}

// Cambiar la cantidad de un producto
function updateQuantity(id, delta) {
  const item = cart.find(i => String(i.id) === String(id));
  if (!item) return;

  if (delta > 0 && item.stock && (item.quantity + delta) > item.stock) {
    showToast(`⚠️ Solo hay ${item.stock} unidades disponibles.`, 'error');
    return;
  }

  item.quantity += delta;

  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }

  saveCart();
  renderCart();
}

// Eliminar un producto del carrito
function removeFromCart(id) {
  cart = cart.filter(item => String(item.id) !== String(id));
  saveCart();
  renderCart();
}

// Renderizar contenido en el HTML
function renderCart() {
  const container = document.getElementById('cart-items-container');
  const totalEl = document.getElementById('cart-total');
  const countEl = document.getElementById('cart-count');

  if (!container) return;

  const totalItems = cart.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0);
  if (countEl) countEl.textContent = totalItems;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <i data-lucide="shopping-bag" class="w-12 h-12 text-gray-300 mb-3"></i>
        <p class="text-gray-500 text-sm font-medium">Tu carrito está vacío</p>
        <p class="text-xs text-gray-400 mt-1">Explora nuestros productos y añade lo que te guste.</p>
      </div>
    `;
    if (totalEl) totalEl.textContent = '$0.00';
    if (window.lucide) lucide.createIcons();
    return;
  }

  let total = 0;
  let html = '';

  cart.forEach(item => {
    // Forzamos conversión numérica por si había basura vieja en localStorage
    let itemPrice = item.precio;
    if (typeof itemPrice === 'string') {
      itemPrice = parseFloat(itemPrice.replace(/[^0-9.-]+/g, "")) || 0;
    }

    const qty = parseInt(item.quantity) || 1;
    const itemTotal = itemPrice * qty;
    total += itemTotal;

    html += `
      <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 my-2">
        <img src="${item.imagenUrl}" alt="${item.nombre}" class="w-14 h-14 object-cover rounded-xl border border-gray-200 flex-shrink-0">
        
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-semibold text-gray-800 truncate">${item.nombre}</h4>
          <p class="text-[11px] text-brand-primary font-medium">$${itemPrice.toFixed(2)} c/u</p>
          
          <div class="flex items-center gap-2 mt-2">
            <button onclick="updateQuantity('${item.id}', -1)" class="w-6 h-6 rounded-lg bg-white border border-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold hover:bg-gray-100">-</button>
            <span class="text-xs font-semibold text-gray-700 w-4 text-center">${qty}</span>
            <button onclick="updateQuantity('${item.id}', 1)" class="w-6 h-6 rounded-lg bg-white border border-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold hover:bg-gray-100">+</button>
          </div>
        </div>

        <div class="text-right flex flex-col justify-between items-end h-14">
          <span class="text-xs font-bold text-gray-900">$${itemTotal.toFixed(2)}</span>
          <button onclick="removeFromCart('${item.id}')" class="text-[10px] text-rose-500 hover:text-rose-700 font-medium">Quitar</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

  if (window.lucide) {
    lucide.createIcons();
  }
}

// Inicializar al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});
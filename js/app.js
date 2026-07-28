// js/app.js

// Referencias del DOM
const featuredContainer = document.getElementById('featured-products');
const catalogContainer = document.getElementById('catalog-products');
const categoryButtons = document.querySelectorAll('.category-btn');

let allProducts = [];

// 1. Cargar productos desde Firestore en tiempo real
function loadProducts() {
  db.collection('products').orderBy('created_at', 'desc').onSnapshot((snapshot) => {
    allProducts = [];
    
    snapshot.forEach((doc) => {
      allProducts.push({
        id: doc.id,
        ...doc.data()
      });
    });

    renderFeaturedProducts(allProducts.filter(p => p.is_featured));
    renderCatalogProducts(allProducts);
  }, (error) => {
    console.error("Error al obtener productos:", error);
  });
}

// 2. Renderizar Carrusel / Sección de Destacados
function renderFeaturedProducts(featured) {
  if (!featuredContainer) return;
  featuredContainer.innerHTML = '';

  if (featured.length === 0) {
    featuredContainer.innerHTML = `<p class="text-xs text-gray-400 col-span-full text-center">No hay productos destacados por ahora.</p>`;
    return;
  }

  featured.forEach(item => {
    const card = document.createElement('div');
    card.className = "flex-shrink-0 w-48 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm relative group";
    card.innerHTML = `
      <div class="relative w-full h-40 rounded-xl overflow-hidden mb-2 bg-gray-50">
        <img src="${item.images[0]}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
        <span class="absolute top-2 left-2 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">Destacado</span>
      </div>
      <h3 class="text-xs font-semibold text-gray-800 line-clamp-1">${item.title}</h3>
      <p class="text-[11px] text-gray-400 mb-2">${item.category}</p>
      <div class="flex justify-between items-center">
        <span class="text-sm font-bold text-gray-900">$${item.price_usd.toFixed(2)}</span>
        <button onclick="addToCart('${item.id}')" ${item.stock === 0 ? 'disabled' : ''} class="px-2.5 py-1 text-xs rounded-lg font-medium transition ${item.stock > 0 ? 'bg-[#E5235E] text-white hover:bg-[#C2184B]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}">
          ${item.stock > 0 ? '+ Añadir' : 'Agotado'}
        </button>
      </div>
    `;
    featuredContainer.appendChild(card);
  });
}

// 3. Renderizar Catálogo General
function renderCatalogProducts(products) {
  if (!catalogContainer) return;
  catalogContainer.innerHTML = '';

  if (products.length === 0) {
    catalogContainer.innerHTML = `<div class="col-span-full text-center py-12 text-gray-400 text-sm">No se encontraron productos registrados.</div>`;
    return;
  }

  products.forEach(item => {
    const card = document.createElement('div');
    card.className = "bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition";

    card.innerHTML = `
      <div>
        <div class="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-gray-50">
          <img src="${item.images[0]}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
          ${item.stock === 0 ? `<div class="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center text-white text-xs font-bold uppercase">Agotado</div>` : ''}
        </div>
        <span class="text-[10px] font-bold text-[#E5235E] uppercase tracking-wider">${item.category}</span>
        <h3 class="text-sm font-semibold text-gray-800 line-clamp-2 mt-0.5 mb-1">${item.title}</h3>
        <p class="text-xs text-gray-400 line-clamp-2 mb-3">${item.description || ''}</p>
      </div>

      <div class="flex justify-between items-center pt-2 border-t border-gray-50 mt-auto">
        <div>
          <span class="text-xs text-gray-400 block -mb-1">Precio</span>
          <span class="text-base font-bold text-gray-900">$${item.price_usd.toFixed(2)}</span>
        </div>
        <button onclick="addToCart('${item.id}')" ${item.stock === 0 ? 'disabled' : ''} class="px-3 py-1.5 text-xs rounded-xl font-semibold transition ${item.stock > 0 ? 'bg-[#E5235E] text-white hover:bg-[#C2184B] shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}">
          ${item.stock > 0 ? 'Agregar' : 'Agotado'}
        </button>
      </div>
    `;

    catalogContainer.appendChild(card);
  });
}

// 4. Filtrar por Categoría
function filterByCategory(categoryName) {
  if (categoryName === 'Todos') {
    renderCatalogProducts(allProducts);
  } else {
    const filtered = allProducts.filter(p => p.category.toLowerCase() === categoryName.toLowerCase());
    renderCatalogProducts(filtered);
  }
}

// Inicializar
document.addEventListener('DOMContentLoaded', loadProducts);
// admin/admin.js

const productForm = document.getElementById('productForm');
const inventoryList = document.getElementById('inventoryList');
const productCount = document.getElementById('productCount');

// 1. Escuchar envío del formulario (Crear / Editar)
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const productId = document.getElementById('productId').value;
  const title = document.getElementById('title').value.trim();
  const category = document.getElementById('category').value;
  const price = parseFloat(document.getElementById('price').value);
  const stock = parseInt(document.getElementById('stock').value);
  const imageUrl = document.getElementById('imageUrl').value.trim();
  const description = document.getElementById('description').value.trim();
  const isFeatured = document.getElementById('isFeatured').checked;

  const productData = {
    title,
    category,
    price_usd: price,
    stock,
    images: [imageUrl],
    description,
    is_featured: isFeatured,
    updated_at: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    if (productId) {
      // Actualizar existente
      await db.collection('products').doc(productId).update(productData);
      alert('✅ Producto actualizado correctamente');
    } else {
      // Crear nuevo
      productData.created_at = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('products').add(productData);
      alert('🎉 Producto agregado con éxito');
    }

    productForm.reset();
    document.getElementById('productId').value = '';
  } catch (error) {
    console.error("Error al guardar producto:", error);
    alert('❌ Ocurrió un error al guardar en la base de datos');
  }
});

// 2. Escuchar cambios en tiempo real en Firestore
db.collection('products').orderBy('created_at', 'desc').onSnapshot((snapshot) => {
  inventoryList.innerHTML = '';
  productCount.textContent = `${snapshot.size} productos`;

  if (snapshot.empty) {
    inventoryList.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-gray-400 text-xs">No hay productos registrados aún.</td></tr>`;
    return;
  }

  snapshot.forEach((doc) => {
    const item = doc.data();
    const id = doc.id;

    const row = document.createElement('tr');
    row.className = "hover:bg-gray-50/50 transition text-xs";

    row.innerHTML = `
      <td class="py-3 flex items-center gap-2">
        <img src="${item.images[0]}" class="w-8 h-8 rounded-md object-cover bg-gray-100" alt="">
        <span class="font-medium text-gray-800 line-clamp-1">${item.title}</span>
      </td>
      <td class="py-3 text-gray-500">${item.category}</td>
      <td class="py-3 font-bold text-gray-900">$${item.price_usd.toFixed(2)}</td>
      <td class="py-3">
        ${item.stock > 0 
          ? `<span class="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-semibold">${item.stock} un.</span>`
          : `<span class="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-semibold">Agotado</span>`
        }
      </td>
      <td class="py-3">
        ${item.is_featured ? `<span class="text-amber-500 font-bold">★ Sí</span>` : `<span class="text-gray-300">No</span>`}
      </td>
      <td class="py-3 text-right">
        <button onclick="editProduct('${id}')" class="text-blue-600 hover:underline font-medium mr-2">Editar</button>
        <button onclick="deleteProduct('${id}')" class="text-rose-600 hover:underline font-medium">Borrar</button>
      </td>
    `;

    inventoryList.appendChild(row);
  });
});

// 3. Cargar datos en el formulario para Editar
window.editProduct = async (id) => {
  const doc = await db.collection('products').doc(id).get();
  if (!doc.exists) return;

  const data = doc.data();
  document.getElementById('productId').value = id;
  document.getElementById('title').value = data.title;
  document.getElementById('category').value = data.category;
  document.getElementById('price').value = data.price_usd;
  document.getElementById('stock').value = data.stock;
  document.getElementById('imageUrl').value = data.images[0] || '';
  document.getElementById('description').value = data.description || '';
  document.getElementById('isFeatured').checked = data.is_featured || false;

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 4. Eliminar Producto
window.deleteProduct = async (id) => {
  if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
    await db.collection('products').doc(id).delete();
  }
};
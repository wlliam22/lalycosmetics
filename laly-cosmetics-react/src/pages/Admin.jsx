import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom' // Hook para redireccionar a Home
import { useProducts } from '../context/ProductsContext'
import { db } from '../firebase/config'
import QuotesAdmin from './QuotesAdmin'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore'
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Star, 
  X, 
  Package, 
  Upload, 
  Image as ImageIcon,
  Loader2,
  FileText,
  Home // Ícono de Home
} from 'lucide-react'

const IMGBB_API_KEY = 'fe7d0dabb5596888fb530c4da6d59f18'

const normalizeCategory = (cat = '') => {
  if (!cat) return ''
  const trimmed = cat.trim()
  const lower = trimmed.toLowerCase()
  
  if (['skincare', 'cuidado de la piel', 'cuidado facial'].includes(lower)) {
    return 'Cuidado Facial'
  }
  
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

const initialFormState = {
  nombre: '',
  precio: '',
  categoria: 'Maquillaje',
  nuevaCategoria: '',
  descripcion: '',
  imagenUrl: '',
  stock: 10,
  is_featured: false,
}

const Admin = () => {
  const navigate = useNavigate() // Instancia de navegación
  const { products, loading } = useProducts()
  
  const [activeTab, setActiveTab] = useState('products')

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialFormState)
  
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const categories = useMemo(() => {
    const defaultCats = ['Cuidado Facial', 'Maquillaje', 'Cuidado Corporal', 'Accesorios']
    const fromProducts = products
      .map((p) => normalizeCategory(p.categoria || p.category))
      .filter(Boolean)

    const uniqueSet = new Set([...defaultCats, ...fromProducts])
    return ['Todas', ...Array.from(uniqueSet)]
  }, [products])

  const filteredProducts = products.filter((p) => {
    const title = p.nombre || p.title || ''
    const category = normalizeCategory(p.categoria || p.category || '')
    
    const matchSearch = title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCat =
      selectedCategory === 'Todas' ||
      category.toLowerCase() === selectedCategory.toLowerCase()
      
    return matchSearch && matchCat
  })

  const handleOpenModal = (product = null) => {
    setImageFile(null)
    if (product && product.id) {
      const currentImg = product.imagenUrl || product.images?.[0] || ''
      const rawCat = product.categoria || product.category || 'Maquillaje'
      const normCat = normalizeCategory(rawCat)

      setEditingId(product.id)
      setFormData({
        nombre: product.nombre || product.title || '',
        precio: product.precio ?? product.price_usd ?? '',
        categoria: normCat,
        nuevaCategoria: '',
        descripcion: product.descripcion || product.description || '',
        imagenUrl: currentImg,
        stock: product.stock ?? 0,
        is_featured: Boolean(product.is_featured),
      })
      setImagePreview(currentImg)
    } else {
      setEditingId(null)
      setFormData(initialFormState)
      setImagePreview('')
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData(initialFormState)
    setImageFile(null)
    setImagePreview('')
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido.')
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const uploadToImgBB = async (file) => {
    const bodyData = new FormData()
    bodyData.append('image', file)

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: bodyData,
    })

    const data = await response.json()

    if (data.success) {
      return data.data.url
    } else {
      throw new Error(data.error?.message || 'Error al subir la imagen')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let finalImageUrl = formData.imagenUrl

      if (imageFile) {
        setUploadingImage(true)
        finalImageUrl = await uploadToImgBB(imageFile)
        setUploadingImage(false)
      }

      if (!finalImageUrl) {
        alert('Debes seleccionar una imagen para el producto.')
        setSubmitting(false)
        return
      }

      const rawCategorySelection = formData.categoria === 'NUEVA' 
        ? formData.nuevaCategoria 
        : formData.categoria

      const finalCategory = normalizeCategory(rawCategorySelection) || 'General'

      const payload = {
        nombre: formData.nombre,
        title: formData.nombre,
        precio: parseFloat(formData.precio) || 0,
        price_usd: parseFloat(formData.precio) || 0,
        categoria: finalCategory,
        category: finalCategory,
        descripcion: formData.descripcion,
        description: formData.descripcion,
        imagenUrl: finalImageUrl,
        images: [finalImageUrl],
        stock: parseInt(formData.stock) || 0,
        is_featured: formData.is_featured,
        updatedAt: serverTimestamp(),
      }

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), payload)
      } else {
        payload.createdAt = serverTimestamp()
        await addDoc(collection(db, 'products'), payload)
      }

      handleCloseModal()
    } catch (error) {
      console.error('Error al guardar producto:', error)
      alert(`Error al guardar: ${error.message || 'Verifica la consola'}`)
    } finally {
      setSubmitting(false)
      setUploadingImage(false)
    }
  }

  const toggleFeatured = async (product) => {
    try {
      const productRef = doc(db, 'products', product.id)
      await updateDoc(productRef, {
        is_featured: !product.is_featured,
      })
    } catch (error) {
      console.error('Error al actualizar destacado:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteDoc(doc(db, 'products', id))
      } catch (error) {
        console.error('Error al eliminar producto:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER CON PESTAÑAS, BOTÓN HOME Y ACCIÓN */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-rose-100 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
                Panel de Administración
              </h1>
              {/* Botón a la tienda / Home */}
              <button
                onClick={() => navigate('/')}
                title="Ir a la tienda"
                className="p-2 text-gray-400 hover:text-brand-primary bg-gray-50 hover:bg-rose-50 rounded-2xl border border-gray-200 hover:border-rose-200 transition"
              >
                <Home className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Gestiona el catálogo de productos, inventario y cotizaciones de clientes
            </p>

            {/* SECTOR DE PESTAÑAS (TABS) */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === 'products'
                    ? 'bg-brand-primary text-white shadow-md shadow-rose-200/50'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Productos</span>
              </button>
              <button
                onClick={() => setActiveTab('quotes')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === 'quotes'
                    ? 'bg-brand-primary text-white shadow-md shadow-rose-200/50'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Cotizaciones</span>
              </button>
            </div>
          </div>

          {/* BOTÓN NUEVO PRODUCTO */}
          {activeTab === 'products' && (
            <button
              onClick={() => handleOpenModal()}
              className="bg-brand-primary text-white px-4 py-2.5 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition shadow-md shadow-rose-200/50 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          )}
        </div>

        {/* CONTENIDO SEGÚN LA PESTAÑA ACTIVA */}
        {activeTab === 'quotes' ? (
          <QuotesAdmin />
        ) : (
          <>
            {/* BÚSQUEDA Y FILTRO */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-rose-50 shadow-sm">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-primary text-gray-700"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      selectedCategory === cat
                        ? 'bg-brand-accent text-brand-primary font-semibold'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* TABLA DE PRODUCTOS */}
            <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-xs text-gray-400">
                  Cargando catálogo...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-12 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                  <Package className="w-8 h-8 text-gray-300" />
                  <span>No se encontraron productos registrados</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-rose-50/50 border-b border-rose-100 text-gray-500 font-medium">
                      <tr>
                        <th className="py-3.5 px-4">Producto</th>
                        <th className="py-3.5 px-4">Categoría</th>
                        <th className="py-3.5 px-4">Precio</th>
                        <th className="py-3.5 px-4">Stock</th>
                        <th className="py-3.5 px-4 text-center">Destacado</th>
                        <th className="py-3.5 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredProducts.map((p) => {
                        const title = p.nombre || p.title
                        const price = p.precio ?? p.price_usd ?? 0
                        const category = normalizeCategory(p.categoria || p.category)
                        const image = p.imagenUrl || p.images?.[0] || 'https://via.placeholder.com/50'

                        return (
                          <tr key={p.id} className="hover:bg-rose-50/20 transition">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={image}
                                  alt={title}
                                  className="w-10 h-10 object-cover rounded-xl border border-rose-100 flex-shrink-0 bg-gray-50"
                                />
                                <div className="min-w-0 max-w-xs">
                                  <p className="font-semibold text-gray-800 truncate">{title}</p>
                                  <p className="text-[10px] text-gray-400 line-clamp-1">
                                    {p.descripcion || p.description || 'Sin descripción'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              <span className="bg-gray-100 px-2.5 py-1 rounded-full text-[10px] font-medium">
                                {category}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-gray-900">
                              ${typeof price === 'number' ? price.toFixed(2) : price}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  p.stock > 0
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-rose-50 text-rose-600'
                                }`}
                              >
                                {p.stock > 0 ? `${p.stock} unids.` : 'Agotado'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => toggleFeatured(p)}
                                className={`p-1.5 rounded-full transition ${
                                  p.is_featured
                                    ? 'text-amber-400 hover:text-amber-500 bg-amber-50'
                                    : 'text-gray-300 hover:text-gray-400'
                                }`}
                              >
                                <Star className="w-4 h-4 fill-current" />
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleOpenModal(p)}
                                  className="p-1.5 text-gray-400 hover:text-brand-primary rounded-lg hover:bg-rose-50 transition"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(p.id)}
                                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                                >
                                  <Trash2 className="w-4 h-4" />
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
          </>
        )}
      </div>

      {/* MODAL CREAR / EDITAR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-rose-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-rose-100">
              <h3 className="font-serif font-bold text-lg text-gray-800">
                {editingId ? 'Editar Producto' : 'Añadir Nuevo Producto'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Imagen del Producto *
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Previsualización"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    )}
                  </div>

                  <label className="flex-1 flex flex-col items-center justify-center px-4 py-3 bg-rose-50/50 border border-dashed border-rose-200 rounded-2xl cursor-pointer hover:bg-rose-50 transition">
                    <Upload className="w-5 h-5 text-brand-primary mb-1" />
                    <span className="text-gray-700 font-semibold text-[11px]">
                      {imageFile ? imageFile.name : 'Seleccionar desde tu equipo'}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      PNG, JPG, WEBP
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej. Labial Matte Velvet"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Precio ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio"
                    required
                    value={formData.precio}
                    onChange={handleInputChange}
                    placeholder="12.50"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="10"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Categoría *</label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-primary"
                >
                  {categories.filter((c) => c !== 'Todas').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="NUEVA">＋ Crear nueva categoría...</option>
                </select>

                {formData.categoria === 'NUEVA' && (
                  <input
                    type="text"
                    name="nuevaCategoria"
                    required
                    value={formData.nuevaCategoria}
                    onChange={handleInputChange}
                    placeholder="Escribe el nombre de la nueva categoría"
                    className="w-full mt-2 p-2.5 bg-rose-50/50 border border-rose-200 rounded-xl focus:outline-none focus:border-brand-primary"
                  />
                )}
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  name="descripcion"
                  rows="3"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Escribe detalles del producto..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-primary"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-rose-200"
                />
                <label htmlFor="is_featured" className="text-gray-700 font-medium">
                  Mostrar como destacado en Inicio
                </label>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="w-1/2 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 bg-brand-primary text-white py-2.5 rounded-xl font-semibold hover:opacity-90 transition shadow-md shadow-rose-200/50 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {uploadingImage 
                      ? 'Subiendo imagen...' 
                      : submitting 
                      ? 'Guardando...' 
                      : editingId 
                      ? 'Guardar Cambios' 
                      : 'Crear Producto'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
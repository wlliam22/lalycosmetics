import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './context/CartContext'
import { ProductsProvider } from './context/ProductsContext'
import Home from './pages/Home'
import CatalogPage from './pages/CatalogPage'
import ProductDetail from './pages/ProductDetail'
import AdminLogin from './pages/AdminLogin'
import QuotesAdmin from './pages/QuotesAdmin'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <ProductsProvider>
      <CartProvider>
        <BrowserRouter>
          {/* Componente para las alertas globales */}
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
                fontSize: '12px',
                borderRadius: '10px'
              }
            }} 
          />

          <Routes>
            {/* Rutas públicas del catálogo y cliente */}
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<CatalogPage />} />
            <Route path="/producto/:id" element={<ProductDetail />} />

            {/* Login de administración */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Panel de administración protegido */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <QuotesAdmin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </ProductsProvider>
  )
}

export default App
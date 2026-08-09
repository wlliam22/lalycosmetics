import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './context/CartContext'
import { ProductsProvider } from './context/ProductsContext'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Admin from './pages/Admin'

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-left"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            style: {
              background: '#10B981',
            },
          },
          error: {
            style: {
              background: '#E5235E',
            },
          },
        }}
      />
      <ProductsProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </CartProvider>
      </ProductsProvider>
    </BrowserRouter>
  )
}

export default App
import { useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from '../cart/CartDrawer'

const PageShell = ({ children, className = '', showSearch = false, onSearch }) => {
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <Header
        onCartOpen={() => setIsCartOpen(true)}
        onSearch={onSearch || (() => {})}
        showSearch={showSearch}
      />
      {children}
      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

export default PageShell
import { useState } from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Hero from '../components/home/Hero'
import FeaturedProducts from '../components/home/FeaturedProducts'
import PromoBanner from '../components/home/PromoBanner'
import CategoriesGrid from '../components/home/CategoriesGrid'
import CartDrawer from '../components/cart/CartDrawer'
import CheckoutModal from '../components/checkout/CheckoutModal'
import AnimatedSection from '../components/common/AnimatedSection'
import SectionHeader from '../components/common/SectionHeader'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const navigate = useNavigate()

  const handleCategoryClick = (category) => {
    navigate(`/catalogo?category=${encodeURIComponent(category)}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 overflow-x-hidden">
      <Header onCartOpen={() => setIsCartOpen(true)} />

      <main className="flex-1">
        <Hero />

        <AnimatedSection id="destacados" className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Selección Especial" title="Productos Destacados" />
          <FeaturedProducts />
        </AnimatedSection>

        <AnimatedSection className="my-6">
          <PromoBanner />
        </AnimatedSection>

        <AnimatedSection className="py-16 bg-slate-50/60 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader eyebrow="Colecciones" title="Explora por Categoría" />
            <CategoriesGrid onCategoryClick={handleCategoryClick} />
          </div>
        </AnimatedSection>
      </main>

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false)
          setIsCheckoutOpen(true)
        }}
      />

      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  )
}

export default Home
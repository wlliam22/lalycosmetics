import { MessageCircle } from 'lucide-react'

const PromoBanner = () => {
  return (
    <section id="promos" className="bg-gradient-to-r from-rose-100 via-pink-50 to-brand-nude py-12 my-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 items-center gap-8">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-primary bg-white px-3 py-1 rounded-full shadow-sm">
            Especial de la Semana
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
            Combos de Skincare <br/><span className="text-brand-primary">Hasta 20% OFF</span>
          </h2>
          <p className="text-gray-600 text-sm">
            Lleva tu rutina completa de limpieza y humectación facial con precio especial. Armamos el kit perfecto según tu tipo de piel.
          </p>
          <a
            href="https://wa.me/584246766457?text=Hola%20Laly%20Cosmetics,%20quisiera%20información%20sobre%20los%20combos%20de%20skincare"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-emerald-700 transition shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            Consultar Combo por WhatsApp
          </a>
        </div>
        <div className="flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80"
            alt="Kit Promocional"
            className="rounded-2xl shadow-xl max-h-72 object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export default PromoBanner
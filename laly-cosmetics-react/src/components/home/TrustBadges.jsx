import { ShieldCheck, Truck, CreditCard, RotateCcw } from 'lucide-react'

const TrustBadges = () => {
  const badges = [
    {
      icon: Truck,
      title: 'Envíos Rápidos',
      description: 'Entregas seguras a nivel nacional',
    },
    {
      icon: ShieldCheck,
      title: 'Productos 100% Originales',
      description: 'Calidad garantizada',
    },
    {
      icon: CreditCard,
      title: 'Pagos Seguros',
      description: 'Múltiples métodos de pago',
    },
    {
      icon: RotateCcw,
      title: 'Garantía de Devolución',
      description: 'Atención personalizada',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-2">
      {badges.map((badge, index) => {
        const Icon = badge.icon
        return (
          <div key={index} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0 text-brand-primary">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-800">{badge.title}</h4>
              <p className="text-[11px] text-gray-500 hidden sm:block">{badge.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TrustBadges
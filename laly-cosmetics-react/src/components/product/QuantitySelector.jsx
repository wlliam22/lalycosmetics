import { Minus, Plus } from 'lucide-react'

const QuantitySelector = ({ quantity, onChange, max }) => {
  const canIncrease = max ? quantity < max : true
  const canDecrease = quantity > 1

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-gray-600">Cantidad:</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(quantity - 1)}
          disabled={!canDecrease}
          aria-label="Disminuir cantidad"
          className="w-8 h-8 rounded-full bg-brand-accent text-brand-primary flex items-center justify-center hover:bg-rose-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span
          className="text-lg font-semibold text-gray-800 w-8 text-center"
          aria-live="polite"
        >
          {quantity}
        </span>
        <button
          onClick={() => onChange(quantity + 1)}
          disabled={!canIncrease}
          aria-label="Aumentar cantidad"
          className="w-8 h-8 rounded-full bg-brand-accent text-brand-primary flex items-center justify-center hover:bg-rose-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {max && <span className="text-xs text-gray-400 ml-2">(máx. {max})</span>}
    </div>
  )
}

export default QuantitySelector
import { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'
import { normalizeProductData } from '../utils/normalizeProduct'

const CartContext = createContext()

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const product = normalizeProductData(action.payload)
      if (!product) return state

      const existingIndex = state.findIndex(item => String(item.id) === String(product.id))

      if (existingIndex > -1) {
        const currentQty = state[existingIndex].quantity
        if (product.stock && (currentQty + 1) > product.stock) {
          toast.error(`Solo hay ${product.stock} unidades disponibles.`)
          return state
        }
        const updated = [...state]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
          precio: product.precio,
          nombre: product.nombre,
          imagenUrl: product.imagenUrl,
        }
        toast.success(`${product.nombre} agregado al carrito`)
        return updated
      } else {
        if (product.stock && product.stock < 1) {
          toast.error('Producto agotado.')
          return state
        }
        toast.success(`${product.nombre} agregado al carrito`)
        return [
          ...state,
          {
            id: product.id,
            nombre: product.nombre,
            precio: product.precio,
            imagenUrl: product.imagenUrl,
            quantity: 1,
            stock: product.stock,
          },
        ]
      }
    }

    case 'UPDATE_QUANTITY': {
      const { id, delta } = action.payload
      const item = state.find(i => String(i.id) === String(id))
      if (!item) return state

      if (delta > 0 && item.stock && (item.quantity + delta) > item.stock) {
        toast.error(`Solo hay ${item.stock} unidades disponibles.`)
        return state
      }

      const newQty = item.quantity + delta
      if (newQty <= 0) {
        toast.success(`${item.nombre} eliminado del carrito`)
        return state.filter(i => String(i.id) !== String(id))
      }

      return state.map(i =>
        String(i.id) === String(id) ? { ...i, quantity: newQty } : i
      )
    }

    case 'REMOVE_FROM_CART': {
      const { id } = action.payload
      const item = state.find(i => String(i.id) === String(id))
      if (item) toast.success(`🗑️ ${item.nombre} eliminado del carrito`)
      return state.filter(i => String(i.id) !== String(id))
    }

    case 'CLEAR_CART':
      toast.success('Carrito vaciado')
      return []

    case 'CLEAR_CART_SILENT':
      return []

    default:
      return state
  }
}

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, [], () => {
    const stored = localStorage.getItem('laly_cart')
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    localStorage.setItem('laly_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product })
  }

  const updateQuantity = (id, delta) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, delta } })
  }

  const removeFromCart = (id) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id } })
  }

  const clearCart = (silent = false) => {
    if (silent) {
      dispatch({ type: 'CLEAR_CART_SILENT' })
    } else {
      dispatch({ type: 'CLEAR_CART' })
    }
  }

  const getTotal = () => {
    return cart.reduce((acc, item) => {
      const price = typeof item.precio === 'string'
        ? parseFloat(item.precio.replace(/[^0-9.-]+/g, "")) || 0
        : item.precio || 0
      return acc + price * (parseInt(item.quantity) || 1)
    }, 0)
  }

  const getItemCount = () => {
    return cart.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0)
  }

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getTotal,
      getItemCount,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
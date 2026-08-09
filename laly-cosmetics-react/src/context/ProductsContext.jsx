import { createContext, useContext, useEffect, useState } from 'react'
import { db } from '../firebase/config'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'

const ProductsContext = createContext()

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('created_at', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = []
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() })
      })
      setProducts(data)
      setLoading(false)
    }, (error) => {
      console.error('Error loading products:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <ProductsContext.Provider value={{ products, loading }}>
      {children}
    </ProductsContext.Provider>
  )
}

export const useProducts = () => {
  const context = useContext(ProductsContext)
  if (!context) throw new Error('useProducts must be used within ProductsProvider')
  return context
}
import { useState, useEffect, useRef, useCallback } from 'react'

export function useCatalogFilters() {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const catalogRef = useRef(null)

  const scrollToCatalog = useCallback(() => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  useEffect(() => {
    if (searchTerm.trim() !== '') scrollToCatalog()
  }, [searchTerm, scrollToCatalog])

  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(category)
    scrollToCatalog()
  }, [scrollToCatalog])

  return {
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    catalogRef,
    handleCategoryClick
  }
}
import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import staticProducts from '../data/products'
import API from '../api/axios'

function ShopPage() {
  const [searchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'all'
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [selectedPriceRange, setSelectedPriceRange] = useState('all')
  const [sortBy, setSortBy] = useState('default')
  const [visibleCount, setVisibleCount] = useState(12)
  const [dbProducts, setDbProducts] = useState([])

  // Fetch DB products on mount
  useEffect(() => {
    API.get('/products?limit=100')
      .then(({ data }) => {
        const prods = (data.products || data).map(p => ({
          ...p,
          id: p._id,
          shopifyProductId: p.shopifyProductId,
          shopifyVariantId: p.shopifyVariantId,
          image: p.images?.[0]?.url || 'https://via.placeholder.com/400?text=No+Image',
        }))
        setDbProducts(prods)
      })
      .catch(() => {})
  }, [])

  // Merge: DB products first, then related local products!
  const allProducts = useMemo(() => {
    return [...dbProducts, ...staticProducts]
  }, [dbProducts])

  const categories = [
    { label: 'All Products', value: 'all' },
    { label: 'Home & Cleaning', value: 'home' },
    { label: 'Fitness & Sports', value: 'sport' },
    { label: 'Smart Gadgets', value: 'smart' },
    { label: 'Tools & Essentials', value: 'classic' },
  ]

  const priceRanges = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under ₹499', value: 'under-499', min: 0, max: 499 },
    { label: '₹500 - ₹999', value: '500-999', min: 500, max: 999 },
    { label: '₹1,000 - ₹1,999', value: '1000-1999', min: 1000, max: 1999 },
    { label: 'Above ₹2,000', value: 'above-2000', min: 2000, max: Infinity },
  ]

  const brands = useMemo(() => {
    return [...new Set(allProducts.map(p => p.brand).filter(Boolean))]
  }, [allProducts])

  const currentCategoryLabel = useMemo(() => {
    return categories.find(c => c.value === selectedCategory)?.label || 'All Products'
  }, [selectedCategory])

  const filteredProducts = useMemo(() => {
    let result = [...allProducts]

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory)
    }

    // Brand filter
    if (selectedBrand !== 'all') {
      result = result.filter(p => (p.brand || '').toLowerCase() === selectedBrand.toLowerCase())
    }

    // Price range filter
    if (selectedPriceRange !== 'all') {
      const range = priceRanges.find(r => r.value === selectedPriceRange)
      if (range) {
        result = result.filter(p => {
          const price = Number(p.salePrice || p.price || 0)
          return price >= range.min && price <= range.max
        })
      }
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.salePrice || a.price || 0) - (b.salePrice || b.price || 0))
        break
      case 'price-high':
        result.sort((a, b) => (b.salePrice || b.price || 0) - (a.salePrice || a.price || 0))
        break
      case 'name':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        break
      default:
        break
    }

    return result
  }, [selectedCategory, selectedBrand, selectedPriceRange, sortBy, allProducts])

  const visibleProducts = filteredProducts.slice(0, visibleCount)

  const hasActiveFilters = selectedCategory !== 'all' || selectedBrand !== 'all' || selectedPriceRange !== 'all'

  const handleResetFilters = () => {
    setSelectedCategory('all')
    setSelectedBrand('all')
    setSelectedPriceRange('all')
    setVisibleCount(12)
  }

  return (
    <>
      <div className="page-banner">
        <h1 className="page-banner__title">Shop</h1>
        <p className="page-banner__breadcrumb">
          <Link to="/">Home</Link> / Shop
        </p>
      </div>

      <div className="shop-page">
        <div className="shop-page__container">
          <div className="shop-page__header">
            <h2 className="shop-page__title">
              {currentCategoryLabel}
              <span style={{ fontSize: '0.9rem', fontWeight: 300, color: '#6b6b6b', marginLeft: '10px' }}>
                ({filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'})
              </span>
            </h2>
            <div className="shop-page__controls">
              <select
                className="shop-page__sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Sort by: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          <div className="shop-page__layout">
            {/* Sidebar */}
            <aside className="shop-page__sidebar">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    marginBottom: '1.25rem',
                    padding: '0.45rem 0.9rem',
                    fontSize: '0.8rem',
                    borderRadius: '4px',
                    border: '1px solid #c5a880',
                    background: 'transparent',
                    color: '#c5a880',
                    cursor: 'pointer',
                    width: '100%',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  ✕ Clear All Filters
                </button>
              )}

              <div className="filter-group">
                <h3 className="filter-group__title">Categories</h3>
                {categories.map(cat => (
                  <div
                    key={cat.value}
                    className={`filter-group__option ${selectedCategory === cat.value ? 'active' : ''}`}
                    onClick={() => { setSelectedCategory(cat.value); setVisibleCount(12) }}
                  >
                    {cat.label}
                  </div>
                ))}
              </div>

              {brands.length > 0 && (
                <div className="filter-group">
                  <h3 className="filter-group__title">Brands</h3>
                  <div
                    className={`filter-group__option ${selectedBrand === 'all' ? 'active' : ''}`}
                    onClick={() => { setSelectedBrand('all'); setVisibleCount(12) }}
                  >
                    All Brands
                  </div>
                  {brands.map(brand => (
                    <div
                      key={brand}
                      className={`filter-group__option ${selectedBrand.toLowerCase() === brand.toLowerCase() ? 'active' : ''}`}
                      onClick={() => { setSelectedBrand(brand); setVisibleCount(12) }}
                    >
                      {brand}
                    </div>
                  ))}
                </div>
              )}

              <div className="filter-group">
                <h3 className="filter-group__title">Price Range</h3>
                {priceRanges.map(range => (
                  <div
                    key={range.value}
                    className={`filter-group__option ${selectedPriceRange === range.value ? 'active' : ''}`}
                    onClick={() => { setSelectedPriceRange(range.value); setVisibleCount(12) }}
                  >
                    {range.label}
                  </div>
                ))}
              </div>
            </aside>

            {/* Products */}
            <div className="shop-page__products">
              <div className="products-grid">
                {visibleProducts.map(product => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))}
              </div>

              {visibleCount < filteredProducts.length && (
                <div className="shop-page__load-more">
                  <button
                    className="btn btn--outline-dark"
                    onClick={() => setVisibleCount(prev => prev + 8)}
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ShopPage

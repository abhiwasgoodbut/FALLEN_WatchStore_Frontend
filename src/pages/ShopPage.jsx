import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import staticProducts from '../data/products'
import API from '../api/axios'

function ShopPage() {
  const [searchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'all'
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [sortBy, setSortBy] = useState('default')
  const [visibleCount, setVisibleCount] = useState(8)
  const [dbProducts, setDbProducts] = useState([])

  // Fetch DB products on mount
  useEffect(() => {
    API.get('/products?limit=100')
      .then(({ data }) => {
        const prods = (data.products || data).map(p => ({
          ...p,
          id: p._id,
          image: p.images?.[0]?.url || 'https://via.placeholder.com/400?text=No+Image',
        }))
        setDbProducts(prods)
      })
      .catch(() => { /* API down — just use static data */ })
  }, [])

  // Merge: DB products first, then static
  const allProducts = useMemo(() => {
    return [...dbProducts, ...staticProducts]
  }, [dbProducts])

  const categories = [
    { label: 'All Watches', value: 'all' },
    { label: 'Luxury', value: 'luxury' },
    { label: 'Classic', value: 'classic' },
    { label: 'Sport', value: 'sport' },
    { label: 'Smart', value: 'smart' },
  ]

  const brands = [...new Set(allProducts.map(p => p.brand))]

  const filteredProducts = useMemo(() => {
    let result = [...allProducts]

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory)
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.salePrice - b.salePrice)
        break
      case 'price-high':
        result.sort((a, b) => b.salePrice - a.salePrice)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        break
    }

    return result
  }, [selectedCategory, sortBy, allProducts])

  const visibleProducts = filteredProducts.slice(0, visibleCount)

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
              {selectedCategory === 'all' ? 'All Watches' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Watches`}
              <span style={{ fontSize: '0.9rem', fontWeight: 300, color: '#6b6b6b', marginLeft: '10px' }}>
                ({filteredProducts.length} products)
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
              <div className="filter-group">
                <h3 className="filter-group__title">Categories</h3>
                {categories.map(cat => (
                  <div
                    key={cat.value}
                    className={`filter-group__option ${selectedCategory === cat.value ? 'active' : ''}`}
                    onClick={() => { setSelectedCategory(cat.value); setVisibleCount(8) }}
                  >
                    {cat.label}
                  </div>
                ))}
              </div>

              <div className="filter-group">
                <h3 className="filter-group__title">Brands</h3>
                {brands.map(brand => (
                  <div key={brand} className="filter-group__option">
                    {brand}
                  </div>
                ))}
              </div>

              <div className="filter-group">
                <h3 className="filter-group__title">Price Range</h3>
                <div className="filter-group__option">Under ₹50,000</div>
                <div className="filter-group__option">₹50,000 - ₹1,00,000</div>
                <div className="filter-group__option">₹1,00,000 - ₹2,00,000</div>
                <div className="filter-group__option">Above ₹2,00,000</div>
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

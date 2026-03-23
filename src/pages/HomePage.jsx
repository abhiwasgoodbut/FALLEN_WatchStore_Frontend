import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import ProductCard from '../components/ProductCard'
import staticProducts from '../data/products'
import API from '../api/axios'

function HomePage() {
  const [dbProducts, setDbProducts] = useState([])

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
      .catch(() => {})
  }, [])

  const allProducts = [...dbProducts, ...staticProducts]
  const featuredProducts = allProducts.filter(p => p.isFeatured)
  const bestsellerProducts = allProducts.filter(p => p.isBestseller)

  const categories = [
    { name: 'Luxury', icon: '👑', filter: 'luxury' },
    { name: 'Classic', icon: '🎩', filter: 'classic' },
    { name: 'Sport', icon: '⚡', filter: 'sport' },
    { name: 'Smart', icon: '📱', filter: 'smart' },
    { name: 'All Watches', icon: '⌚', filter: 'all' },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__overlay"></div>
        <div className="hero__particles">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="hero__particle"></div>
          ))}
        </div>
        <div className="hero__container">
          <div className="hero__content">
            <span className="hero__badge">New Collection 2026</span>
            <h1 className="hero__title">
              Luxury <span className="hero__title-accent">Timepieces</span> For The Modern Connoisseur
            </h1>
            <p className="hero__subtitle">
              Discover our exclusive collection of premium watches from the world's most prestigious brands. 
              Every piece tells a story of craftsmanship and elegance.
            </p>
            <div className="hero__actions">
              <Link to="/shop" className="btn btn--primary">
                Shop Now <FiArrowRight />
              </Link>
              <Link to="/about" className="btn btn--outline">
                Our Story
              </Link>
            </div>
          </div>
          <div className="hero__image">
            <div className="hero__image-circle"></div>
            <img
              src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600"
              alt="Premium Watch"
              className="hero__watch-img"
            />
          </div>
        </div>
      </section>

      {/* Category Circles */}
      <section className="categories">
        <div className="section__container">
          <div className="categories__grid">
            {categories.map(cat => (
              <Link
                key={cat.name}
                to={cat.filter === 'all' ? '/shop' : `/shop?category=${cat.filter}`}
                className="category-circle"
              >
                <div className="category-circle__image">
                  {cat.icon}
                </div>
                <span className="category-circle__name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="section">
        <div className="section__container">
          <div className="section__header">
            <p className="section__label">Curated Selection</p>
            <h2 className="section__title">Featured Collection</h2>
            <p className="section__subtitle">
              Hand-picked timepieces that define luxury and sophistication
            </p>
          </div>
          <div className="products-grid">
            {featuredProducts.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/shop" className="btn btn--outline-dark">
              View All <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="featured-banner">
        <div className="featured-banner__container">
          <div className="featured-banner__content">
            <p className="featured-banner__label">Limited Edition</p>
            <h2 className="featured-banner__title">The Art of Precision</h2>
            <p className="featured-banner__text">
              Every watch in our collection undergoes rigorous quality checks. 
              We partner only with authorized dealers to ensure 100% authenticity.
            </p>
            <Link to="/shop" className="btn btn--primary btn--sm">
              Explore Now <FiArrowRight />
            </Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=400"
            alt="Featured Watch"
            className="featured-banner__image"
          />
        </div>
      </section>

      {/* Bestsellers */}
      <section className="section section--gray">
        <div className="section__container">
          <div className="section__header">
            <p className="section__label">Most Popular</p>
            <h2 className="section__title">Bestsellers</h2>
            <p className="section__subtitle">
              The most loved watches by our customers — timeless choices that never disappoint
            </p>
          </div>
          <div className="products-grid">
            {bestsellerProducts.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/shop" className="btn btn--outline-dark">
              Shop All Bestsellers <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="newsletter__container">
          <h2 className="newsletter__title">Stay in the Loop</h2>
          <p className="newsletter__text">
            Subscribe to our newsletter and be the first to know about new arrivals, exclusive deals, and watch guides.
          </p>
          <form className="newsletter__form" onSubmit={(e) => e.preventDefault()}>
            <input
              className="newsletter__input"
              type="email"
              placeholder="Enter your email address"
            />
            <button type="submit" className="newsletter__btn">Subscribe</button>
          </form>
        </div>
      </section>
    </>
  )
}

export default HomePage

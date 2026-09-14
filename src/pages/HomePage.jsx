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
    { name: 'Electronics', icon: '💻', filter: 'electronics' },
    { name: 'Fashion', icon: '👕', filter: 'fashion' },
    { name: 'Beauty', icon: '✨', filter: 'beauty' },
    { name: 'Home', icon: '🏠', filter: 'home' },
    { name: 'All Products', icon: '🛍️', filter: 'all' },
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
            <span className="hero__badge">New Arrivals 2026</span>
            <h1 className="hero__title">
              Premium <span className="hero__title-accent">Products</span> For Your Everyday Life
            </h1>
            <p className="hero__subtitle">
              Discover our exclusive collection of hand-picked items across fashion, electronics, and beauty. 
              Quality and elegance delivered directly to your door.
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
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600"
              alt="Premium Shopping"
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
              Top-tier products that define quality and modern living
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
            <p className="featured-banner__label">Exclusive Deals</p>
            <h2 className="featured-banner__title">Uncompromising Quality</h2>
            <p className="featured-banner__text">
              Every item in our store undergoes rigorous quality checks. 
              We partner only with verified brands to ensure 100% satisfaction.
            </p>
            <Link to="/shop" className="btn btn--primary btn--sm">
              Explore Now <FiArrowRight />
            </Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600"
            alt="Featured Products"
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
              The most loved items by our customers — premium choices that never disappoint
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
            Subscribe to our newsletter and be the first to know about new arrivals, exclusive deals, and shopping guides.
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

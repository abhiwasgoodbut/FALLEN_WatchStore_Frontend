import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiX } from 'react-icons/fi'
import ProductCard from '../components/ProductCard'
import staticProducts from '../data/products'
import { dummyReviews, ratingSummary } from '../data/reviews'
import API from '../api/axios'

function HomePage() {
  const [dbProducts, setDbProducts] = useState([])
  const [previewImage, setPreviewImage] = useState(null)

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

  const allProducts = [...dbProducts, ...staticProducts]
  const featuredProducts = allProducts.filter(p => p.isFeatured).length > 0
    ? allProducts.filter(p => p.isFeatured)
    : allProducts
  const bestsellerProducts = allProducts.filter(p => p.isBestseller).length > 0
    ? allProducts.filter(p => p.isBestseller)
    : allProducts

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

      {/* Customer Reviews Section on Frontpage */}
      <section className="section home-reviews">
        <div className="section__container">
          <div className="section__header">
            <p className="section__label">Verified Social Proof</p>
            <h2 className="section__title">What Our Customers Say</h2>
            <div className="home-reviews__overall-badge">
              <span className="home-reviews__score">{ratingSummary.average}</span>
              <div className="home-reviews__stars">
                <span className="star-filled">★</span>
                <span className="star-filled">★</span>
                <span className="star-filled">★</span>
                <span className="star-filled">★</span>
                <span className="star-half">★</span>
              </div>
              <span className="home-reviews__count">({ratingSummary.totalRatings.toLocaleString()} verified ratings)</span>
            </div>
          </div>

          <div className="home-reviews__grid">
            {dummyReviews.slice(0, 3).map((rev) => (
              <div key={rev.id} className="home-reviews__card">
                <div className="home-reviews__card-header">
                  <img src={rev.avatar} alt={rev.author} className="home-reviews__avatar" />
                  <div>
                    <h4 className="home-reviews__author">{rev.author}</h4>
                    <span className="home-reviews__verified">✓ Verified Purchase</span>
                  </div>
                </div>
                <div className="home-reviews__stars-sm">
                  {[...Array(rev.rating)].map((_, i) => (
                    <span key={i} className="star-filled">★</span>
                  ))}
                </div>
                <h5 className="home-reviews__card-title">"{rev.title}"</h5>
                <p className="home-reviews__card-text">{rev.content}</p>
                {rev.images && rev.images.length > 0 && (
                  <div
                    className="home-reviews__image-preview"
                    onClick={() => setPreviewImage({ url: rev.images[0], author: rev.author, title: rev.title })}
                    title="Click to view full image"
                  >
                    <img src={rev.images[0]} alt="Customer review" />
                    <span className="home-reviews__zoom-hint">🔍 Enlarge</span>
                  </div>
                )}
                <div className="home-reviews__footer">
                  <span className="home-reviews__date">{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Review Image Lightbox Modal - Only Image & Extra Large */}
      {previewImage && (
        <div
          className="review-lightbox"
          onClick={() => setPreviewImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="review-lightbox__dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="review-lightbox__close-btn"
              onClick={() => setPreviewImage(null)}
              aria-label="Close image viewer"
            >
              <FiX />
            </button>
            <div className="review-lightbox__image-wrap">
              <img
                src={previewImage.url || previewImage}
                alt="Enlarged review image"
                className="review-lightbox__img"
              />
            </div>
          </div>
        </div>
      )}

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

import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiHeart, FiMinus, FiPlus, FiShoppingBag, FiTruck, FiShield, FiRefreshCw, FiAward, FiLock, FiDollarSign, FiCreditCard, FiX } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useNotification } from '../context/NotificationContext'
import ProductCard from '../components/ProductCard'
import ProductVideoPlayer, { getVideoThumbnail } from '../components/ProductVideoPlayer'
import staticProducts from '../data/products'
import { dummyReviews, ratingSummary } from '../data/reviews'
import API from '../api/axios'

function ProductDetailPage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const notify = useNotification()
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeMediaIndex, setActiveMediaIndex] = useState(0)
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    setLoading(true)
    setQuantity(1)
    setActiveMediaIndex(0)

    // Check static products first (e.g. integer or id match)
    const staticProd = staticProducts.find(p => String(p.id) === String(id) || String(p._id) === String(id))
    if (staticProd) {
      setProduct(staticProd)
      setRelatedProducts(staticProducts.filter(p => String(p.id) !== String(id)).slice(0, 4))
      setLoading(false)
      return
    }

    // Otherwise fetch from MongoDB API
    API.get(`/products/${id}`)
      .then(({ data }) => {
        const p = {
          ...data,
          id: data._id,
          image: data.images?.[0]?.url || 'https://via.placeholder.com/400?text=No+Image',
        }
        setProduct(p)
        // Combine related products with static products
        return API.get(`/products?limit=5`)
          .then(({ data: related }) => {
            const prods = (related.products || related)
              .filter(r => r._id !== data._id)
              .map(r => ({
                ...r,
                id: r._id,
                image: r.images?.[0]?.url || 'https://via.placeholder.com/400?text=No+Image',
              }))
            const combined = [...prods, ...staticProducts.filter(sp => String(sp.id) !== String(data._id))].slice(0, 4)
            setRelatedProducts(combined)
          })
          .catch(() => {
            setRelatedProducts(staticProducts.slice(0, 4))
          })
      })
      .catch(() => {
        const fallback = staticProducts.find(p => String(p.id) === String(id))
        setProduct(fallback || null)
        if (fallback) {
          setRelatedProducts(staticProducts.filter(p => String(p.id) !== String(id)).slice(0, 4))
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const allImages = useMemo(() => {
    if (!product) return []
    return product.images && product.images.length > 0
      ? product.images.map(img => (typeof img === 'string' ? img : img.url))
      : [product.image].filter(Boolean)
  }, [product])

  const mediaList = useMemo(() => {
    if (!product) return []
    const list = allImages.map((url, i) => ({
      type: 'image',
      url,
      id: `img-${i}`,
      title: `Photo ${i + 1}`,
    }))

    if (product?.videoUrl) {
      const videoItem = {
        type: 'video',
        videoUrl: product.videoUrl,
        thumbnail: getVideoThumbnail(product.videoUrl, allImages[0] || product.image),
        id: 'video',
        title: 'Video',
      }
      const pos = product.videoPosition !== undefined ? product.videoPosition : 2
      if (pos <= 1) {
        list.unshift(videoItem)
      } else if (pos > list.length) {
        list.push(videoItem)
      } else {
        list.splice(pos - 1, 0, videoItem)
      }
    }
    return list
  }, [allImages, product])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <p>Loading product...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <h2>Product not found</h2>
        <Link to="/shop" className="btn btn--primary" style={{ marginTop: '2rem', display: 'inline-flex' }}>
          Back to Shop
        </Link>
      </div>
    )
  }

  const wishlisted = isInWishlist(product.id)
  const discount = Math.round(((product.price - product.salePrice) / product.price) * 100)
  const currentMedia = mediaList[activeMediaIndex] || mediaList[0]

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    notify.success(`${product.name} (×${quantity}) added to cart`)
  }

  const handleToggleWishlist = () => {
    toggleWishlist(product)
    notify.info(wishlisted ? 'Removed from wishlist' : `${product.name} added to wishlist`)
  }

  return (
    <>
      <div className="product-detail">
        <div className="product-detail__container">
          {/* Amazon-style Gallery */}
          <div className="product-detail__gallery">
            {/* Left Thumbnails Strip */}
            {mediaList.length > 1 && (
              <div className="product-detail__thumbs">
                {mediaList.map((item, i) => {
                  if (item.type === 'video') {
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`product-detail__thumb-btn product-detail__thumb-btn--video ${activeMediaIndex === i ? 'active' : ''}`}
                        onClick={() => setActiveMediaIndex(i)}
                        onMouseEnter={() => setActiveMediaIndex(i)}
                        title="Play Product Video"
                      >
                        <img
                          src={item.thumbnail}
                          alt="Video thumbnail"
                          className="product-detail__thumb-video-img"
                        />
                        <div className="product-detail__thumb-video-overlay">
                          <div className="product-detail__thumb-video-circle">▶</div>
                          <span className="product-detail__thumb-video-text">VIDEO</span>
                        </div>
                      </button>
                    )
                  }

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`product-detail__thumb-btn ${activeMediaIndex === i ? 'active' : ''}`}
                      onClick={() => setActiveMediaIndex(i)}
                      onMouseEnter={() => setActiveMediaIndex(i)}
                      title={item.title}
                    >
                      <img src={item.url} alt={item.title} />
                    </button>
                  )
                })}
              </div>
            )}

            {/* Main Stage */}
            <div className="product-detail__main-stage">
              {currentMedia?.type === 'video' ? (
                <div className="product-detail__video-stage">
                  <ProductVideoPlayer videoUrl={currentMedia.videoUrl} style={{ width: '100%', height: '100%', borderRadius: 0 }} />
                </div>
              ) : (
                <img
                  src={currentMedia?.url || product.image}
                  alt={product.name}
                  className="product-detail__main-image"
                />
              )}

              {/* Status pill overlay */}
              {product.videoUrl && (
                <div className="product-detail__badge-overlay">
                  {currentMedia?.type === 'video' ? '🎥 Playing Video' : '📷 Photos'}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="product-detail__info">
            <div className="product-detail__breadcrumb">
              <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / {product.name}
            </div>

            <div className="product-detail__brand">{product.brand}</div>
            <h1 className="product-detail__name">{product.name}</h1>

            {/* Amazon Rating Snippet (4.3 ★★★★☆ 250 ratings) */}
            <div className="product-detail__amazon-rating">
              <span className="product-detail__rating-score">{ratingSummary.average}</span>
              <div className="product-detail__stars" aria-label={`${ratingSummary.average} out of 5 stars`}>
                <span className="star-filled">★</span>
                <span className="star-filled">★</span>
                <span className="star-filled">★</span>
                <span className="star-filled">★</span>
                <span className="star-half">★</span>
              </div>
              <a
                href="#customer-reviews"
                className="product-detail__rating-count-link"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('customer-reviews')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                {ratingSummary.totalRatings.toLocaleString()} ratings
              </a>
              <span className="product-detail__rating-divider">|</span>
              <span className="product-detail__answered-badge">42 answered questions</span>
            </div>

            <div className="product-detail__price-row">
              <span className="product-detail__sale-price">₹{product.salePrice.toLocaleString()}</span>
              {product.price !== product.salePrice && (
                <>
                  <span className="product-detail__original-price">₹{product.price.toLocaleString()}</span>
                  <span className="product-detail__discount">{discount}% OFF</span>
                </>
              )}
            </div>

            <p className="product-detail__description">{product.description}</p>

            {/* Quantity */}
            <div className="product-detail__quantity">
              <span className="product-detail__qty-label">Quantity</span>
              <div className="product-detail__qty-controls">
                <button className="product-detail__qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                  <FiMinus />
                </button>
                <span className="product-detail__qty-value">{quantity}</span>
                <button className="product-detail__qty-btn" onClick={() => setQuantity(q => q + 1)}>
                  <FiPlus />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="product-detail__actions">
              <button className="btn btn--primary" style={{ flex: 1 }} onClick={handleAddToCart}>
                <FiShoppingBag /> Add to Cart
              </button>
              <button className={`product-detail__wishlist-btn ${wishlisted ? 'wishlisted' : ''}`} onClick={handleToggleWishlist}>
                <FiHeart />
              </button>
            </div>

            {/* Amazon-Style Trust Badges Row */}
            {(() => {
              const badges = product.trustBadges || {}
              const isCod = badges.isCodAvailable !== false
              const returnText = badges.returnPolicy || '7 Days Replacement'
              const warrantyText = badges.warranty || '1 Year Warranty'
              const isFreeDelivery = badges.freeDelivery !== false
              const isTopBrand = badges.topBrand !== false
              const isSecure = badges.secureTransaction !== false

              return (
                <div className="product-detail__trust-strip">
                  {/* Return / Replacement */}
                  {returnText && returnText !== 'Non-Returnable' && (
                    <div className="product-detail__trust-item">
                      <div className="product-detail__trust-icon-wrap">
                        <FiRefreshCw className="product-detail__trust-icon" />
                      </div>
                      <span className="product-detail__trust-label">{returnText}</span>
                    </div>
                  )}

                  {/* Free Delivery */}
                  {isFreeDelivery && (
                    <div className="product-detail__trust-item">
                      <div className="product-detail__trust-icon-wrap">
                        <FiTruck className="product-detail__trust-icon" />
                      </div>
                      <span className="product-detail__trust-label">Free Delivery</span>
                    </div>
                  )}

                  {/* Warranty */}
                  {warrantyText && warrantyText !== 'No Warranty' && (
                    <div className="product-detail__trust-item">
                      <div className="product-detail__trust-icon-wrap">
                        <FiShield className="product-detail__trust-icon" />
                      </div>
                      <span className="product-detail__trust-label">{warrantyText}</span>
                    </div>
                  )}

                  {/* Pay on Delivery vs Online Payment Only */}
                  <div className="product-detail__trust-item">
                    <div className="product-detail__trust-icon-wrap">
                      {isCod ? (
                        <FiDollarSign className="product-detail__trust-icon" />
                      ) : (
                        <FiCreditCard className="product-detail__trust-icon" />
                      )}
                    </div>
                    <span className="product-detail__trust-label">
                      {isCod ? 'Pay on Delivery' : 'Prepaid Only (No COD)'}
                    </span>
                  </div>

                  {/* Top Brand */}
                  {isTopBrand && (
                    <div className="product-detail__trust-item">
                      <div className="product-detail__trust-icon-wrap">
                        <FiAward className="product-detail__trust-icon" />
                      </div>
                      <span className="product-detail__trust-label">Top Brand</span>
                    </div>
                  )}

                  {/* Secure Transaction */}
                  {isSecure && (
                    <div className="product-detail__trust-item">
                      <div className="product-detail__trust-icon-wrap">
                        <FiLock className="product-detail__trust-icon" />
                      </div>
                      <span className="product-detail__trust-label">Secure transaction</span>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Amazon-Style About this item */}
            {product.aboutItem && Array.isArray(product.aboutItem) && product.aboutItem.length > 0 && (
              <div className="product-detail__about-item">
                <h3 className="product-detail__about-title">About this item</h3>
                <ul className="product-detail__about-list">
                  {product.aboutItem.map((point, idx) => {
                    const match = point.match(/^\[?(.*?)\]?:\s*(.*)$/)
                    return (
                      <li key={idx}>
                        {match ? (
                          <>
                            <strong>{match[1].replace(/^\[|\]$/g, '')}:</strong> {match[2]}
                          </>
                        ) : (
                          point
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* Specs */}
            {product.specs && typeof product.specs === 'object' && Object.keys(product.specs).length > 0 && (
              <div className="product-detail__specs">
                <h3 className="product-detail__specs-title">Specifications</h3>
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="product-detail__spec-row">
                    <span className="product-detail__spec-label">{key}</span>
                    <span className="product-detail__spec-value">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Amazon-Style Customer Reviews Section */}
      <section id="customer-reviews" className="customer-reviews-section">
        <div className="customer-reviews__container">
          <div className="customer-reviews__layout">
            {/* Left Column: Rating breakdown */}
            <div className="customer-reviews__summary">
              <h2 className="customer-reviews__main-title">Customer Reviews</h2>
              
              <div className="customer-reviews__score-row">
                <div className="customer-reviews__stars-large">
                  <span className="star-filled">★</span>
                  <span className="star-filled">★</span>
                  <span className="star-filled">★</span>
                  <span className="star-filled">★</span>
                  <span className="star-half">★</span>
                </div>
                <span className="customer-reviews__score-text">{ratingSummary.average} out of 5</span>
              </div>
              <p className="customer-reviews__global-count">
                {ratingSummary.totalRatings.toLocaleString()} global ratings
              </p>

              {/* Progress bars */}
              <div className="customer-reviews__breakdown-list">
                {ratingSummary.breakdown.map((row) => (
                  <div key={row.stars} className="customer-reviews__bar-row">
                    <span className="customer-reviews__bar-label">{row.stars} star</span>
                    <div className="customer-reviews__bar-track">
                      <div
                        className="customer-reviews__bar-fill"
                        style={{ width: `${row.percentage}%` }}
                      ></div>
                    </div>
                    <span className="customer-reviews__bar-pct">{row.percentage}%</span>
                  </div>
                ))}
              </div>

              <div className="customer-reviews__divider"></div>

              {/* Write review CTA */}
              <div className="customer-reviews__write-box">
                <h3 className="customer-reviews__write-title">Review this product</h3>
                <p className="customer-reviews__write-subtitle">
                  Share your thoughts with other customers
                </p>
                <button
                  type="button"
                  className="btn btn--outline-dark customer-reviews__write-btn"
                  onClick={() => notify.info('Review submission is enabled for verified orders.')}
                >
                  Write a product review
                </button>
              </div>
            </div>

            {/* Right Column: Customer Reviews Feed */}
            <div className="customer-reviews__feed">
              <div className="customer-reviews__feed-header">
                <h3 className="customer-reviews__feed-title">
                  Top reviews from India
                </h3>
                <span className="customer-reviews__feed-badge">
                  Verified POS & Online Customers
                </span>
              </div>

              <div className="customer-reviews__list">
                {dummyReviews.map((rev) => (
                  <article key={rev.id} className="customer-reviews__card">
                    {/* User profile */}
                    <div className="customer-reviews__user-row">
                      <img
                        src={rev.avatar}
                        alt={rev.author}
                        className="customer-reviews__avatar"
                      />
                      <span className="customer-reviews__author">{rev.author}</span>
                    </div>

                    {/* Rating & Review title */}
                    <div className="customer-reviews__rating-title-row">
                      <div className="customer-reviews__stars-sm">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={i < rev.rating ? 'star-filled' : 'star-empty'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <h4 className="customer-reviews__card-title">{rev.title}</h4>
                    </div>

                    {/* Date */}
                    <div className="customer-reviews__date">{rev.date}</div>

                    {/* Meta: Verified purchase & variant */}
                    <div className="customer-reviews__meta-row">
                      {rev.colorOption && (
                        <span className="customer-reviews__variant">
                          Colour: {rev.colorOption}
                        </span>
                      )}
                      {rev.verified && (
                        <>
                          <span className="customer-reviews__meta-sep">|</span>
                          <span className="customer-reviews__verified-badge">
                            Verified Purchase
                          </span>
                        </>
                      )}
                    </div>

                    {/* Review Content */}
                    <p className="customer-reviews__content">{rev.content}</p>

                    {/* Optional Images */}
                    {rev.images && rev.images.length > 0 && (
                      <div className="customer-reviews__images-row">
                        {rev.images.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="customer-reviews__user-img-wrap"
                            onClick={() => setPreviewImage({ url: imgUrl, author: rev.author, title: rev.title })}
                            title="Click to view full image"
                          >
                            <img
                              src={imgUrl}
                              alt="Customer upload"
                              className="customer-reviews__user-img"
                            />
                            <span className="customer-reviews__user-img-zoom">🔍</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Helpful count & actions */}
                    <div className="customer-reviews__actions">
                      <span className="customer-reviews__helpful-count">
                        {rev.helpfulCount} people found this helpful
                      </span>
                      <div className="customer-reviews__action-buttons">
                        <button
                          type="button"
                          className="customer-reviews__helpful-btn"
                          onClick={() => notify.success('Thank you for your feedback!')}
                        >
                          Helpful
                        </button>
                        <span className="customer-reviews__action-divider">|</span>
                        <button
                          type="button"
                          className="customer-reviews__report-btn"
                          onClick={() => notify.info('Report submitted.')}
                        >
                          Report
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="section section--gray">
          <div className="section__container">
            <div className="section__header">
              <p className="section__label">You may also like</p>
              <h2 className="section__title">Related Products</h2>
            </div>
            <div className="products-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id || p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

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
    </>
  )
}

export default ProductDetailPage

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiHeart, FiMinus, FiPlus, FiShoppingBag, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useNotification } from '../context/NotificationContext'
import staticProducts from '../data/products'
import ProductCard from '../components/ProductCard'
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

  useEffect(() => {
    setLoading(true)
    setQuantity(1)

    // Try static data first (integer IDs)
    const staticProduct = staticProducts.find(p => p.id === parseInt(id))
    if (staticProduct) {
      setProduct(staticProduct)
      setRelatedProducts(
        staticProducts.filter(p => p.category === staticProduct.category && p.id !== staticProduct.id).slice(0, 4)
      )
      setLoading(false)
      return
    }

    // Try API (MongoDB ObjectId)
    API.get(`/products/${id}`)
      .then(({ data }) => {
        const p = {
          ...data,
          id: data._id,
          image: data.images?.[0]?.url || 'https://via.placeholder.com/400?text=No+Image',
        }
        setProduct(p)
        // Fetch related
        return API.get(`/products?category=${data.category}&limit=5`)
          .then(({ data: related }) => {
            const prods = (related.products || related)
              .filter(r => r._id !== data._id)
              .slice(0, 4)
              .map(r => ({
                ...r,
                id: r._id,
                image: r.images?.[0]?.url || 'https://via.placeholder.com/400?text=No+Image',
              }))
            setRelatedProducts(prods)
          })
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

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
          {/* Gallery */}
          <div className="product-detail__gallery">
            <img src={product.image} alt={product.name} className="product-detail__main-image" />
          </div>

          {/* Info */}
          <div className="product-detail__info">
            <div className="product-detail__breadcrumb">
              <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / {product.name}
            </div>

            <div className="product-detail__brand">{product.brand}</div>
            <h1 className="product-detail__name">{product.name}</h1>

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

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.8rem', color: '#6b6b6b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiTruck style={{ color: '#c9a84c' }} /> Free Shipping
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiShield style={{ color: '#c9a84c' }} /> Authentic
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiRefreshCw style={{ color: '#c9a84c' }} /> 7-Day Returns
              </div>
            </div>

            {/* Specs */}
            {product.specs && typeof product.specs === 'object' && (
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

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="section section--gray">
          <div className="section__container">
            <div className="section__header">
              <p className="section__label">You may also like</p>
              <h2 className="section__title">Related Watches</h2>
            </div>
            <div className="products-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id || p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default ProductDetailPage

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiHeart, FiMinus, FiPlus, FiShoppingBag, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import products from '../data/products'
import ProductCard from '../components/ProductCard'

function ProductDetailPage() {
  const { id } = useParams()
  const product = products.find(p => p.id === parseInt(id))
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

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

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
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
                <button
                  className="product-detail__qty-btn"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  <FiMinus />
                </button>
                <span className="product-detail__qty-value">{quantity}</span>
                <button
                  className="product-detail__qty-btn"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="product-detail__actions">
              <button className="btn btn--primary" style={{ flex: 1 }} onClick={handleAddToCart}>
                <FiShoppingBag />
                {addedToCart ? 'Added!' : 'Add to Cart'}
              </button>
              <button
                className={`product-detail__wishlist-btn ${wishlisted ? 'wishlisted' : ''}`}
                onClick={() => toggleWishlist(product)}
              >
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
            {product.specs && (
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
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default ProductDetailPage

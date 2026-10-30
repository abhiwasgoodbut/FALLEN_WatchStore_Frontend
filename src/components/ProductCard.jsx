import { Link } from 'react-router-dom'
import { FiHeart, FiShoppingBag } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useNotification } from '../context/NotificationContext'
import { trackAddToCart, trackAddToWishlist } from '../utils/pixel'

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const notify = useNotification()

  if (!product) return null

  const productId = product.id || product._id
  const wishlisted = Boolean(isInWishlist(productId))

  const price = Number(product.price || 0)
  const salePrice = Number(product.salePrice ?? product.price ?? 0)
  const discount = price > 0 && price !== salePrice ? Math.round(((price - salePrice) / price) * 100) : 0
  const imageUrl = product.image || product.images?.[0]?.url || 'https://via.placeholder.com/400?text=No+Image'

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
    trackAddToCart(product, 1)
    notify.success(`${product.name || 'Product'} added to cart`)
  }

  const handleToggleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!wishlisted) {
      trackAddToWishlist(product)
    }
    toggleWishlist(product)
    notify.info(wishlisted ? `Removed from wishlist` : `${product.name || 'Product'} added to wishlist`)
  }

  return (
    <Link to={`/product/${productId}`} className="product-card">
      <div className="product-card__image-wrapper">
        <img src={imageUrl} alt={product.name || 'Product'} className="product-card__image" />
        {discount > 0 && (
          <span className="product-card__badge">Sale!</span>
        )}
        <div className="product-card__actions">
          <button
            className={`product-card__action-btn ${wishlisted ? 'wishlisted' : ''}`}
            onClick={handleToggleWishlist}
            aria-label="Add to wishlist"
          >
            <FiHeart />
          </button>
          <button
            className="product-card__action-btn"
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <FiShoppingBag />
          </button>
        </div>
      </div>
      <div className="product-card__info">
        <div className="product-card__brand">{product.brand || 'YOURCART'}</div>
        <h3 className="product-card__name">{product.name}</h3>
        <div className="product-card__price">
          <span className="product-card__sale-price">₹{salePrice.toLocaleString()}</span>
          {price > 0 && price !== salePrice && (
            <>
              <span className="product-card__original-price">₹{price.toLocaleString()}</span>
              {discount > 0 && <span className="product-card__discount">{discount}% OFF</span>}
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard

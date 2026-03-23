import { Link } from 'react-router-dom'
import { FiHeart, FiShoppingBag } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useNotification } from '../context/NotificationContext'

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const notify = useNotification()
  const productId = product.id || product._id
  const wishlisted = isInWishlist(productId)

  const discount = Math.round(((product.price - product.salePrice) / product.price) * 100)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
    notify.success(`${product.name} added to cart`)
  }

  const handleToggleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
    notify.info(wishlisted ? `Removed from wishlist` : `${product.name} added to wishlist`)
  }

  return (
    <Link to={`/product/${productId}`} className="product-card">
      <div className="product-card__image-wrapper">
        <img src={product.image} alt={product.name} className="product-card__image" />
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
        <div className="product-card__brand">{product.brand}</div>
        <h3 className="product-card__name">{product.name}</h3>
        <div className="product-card__price">
          <span className="product-card__sale-price">₹{product.salePrice.toLocaleString()}</span>
          {product.price !== product.salePrice && (
            <>
              <span className="product-card__original-price">₹{product.price.toLocaleString()}</span>
              <span className="product-card__discount">{discount}% OFF</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard

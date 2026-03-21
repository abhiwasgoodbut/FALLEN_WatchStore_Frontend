import { Link } from 'react-router-dom'
import { FiHeart } from 'react-icons/fi'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'

function WishlistPage() {
  const { wishlistItems, wishlistCount } = useWishlist()
  const { addToCart } = useCart()

  return (
    <>
      <div className="page-banner">
        <h1 className="page-banner__title">My Wishlist</h1>
        <p className="page-banner__breadcrumb">
          <Link to="/">Home</Link> / Wishlist
        </p>
      </div>

      <div className="wishlist-page">
        <div className="wishlist-page__container">
          {wishlistItems.length === 0 ? (
            <div className="wishlist-page__empty">
              <div className="wishlist-page__empty-icon"><FiHeart /></div>
              <p className="wishlist-page__empty-text">Your wishlist is empty</p>
              <Link to="/shop" className="btn btn--primary">Explore Watches</Link>
            </div>
          ) : (
            <>
              <h2 className="wishlist-page__title">Your Wishlist ({wishlistCount} items)</h2>
              <div className="products-grid">
                {wishlistItems.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default WishlistPage

import { Link } from 'react-router-dom'
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi'
import { useCart } from '../context/CartContext'

function CartPage() {
  const { cartItems, cartCount, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart()

  return (
    <>
      <div className="page-banner">
        <h1 className="page-banner__title">Shopping Cart</h1>
        <p className="page-banner__breadcrumb">
          <Link to="/">Home</Link> / Cart
        </p>
      </div>

      <div className="cart-page">
        <div className="cart-page__container">
          {cartItems.length === 0 ? (
            <div className="cart-page__empty">
              <div className="cart-page__empty-icon"><FiShoppingBag /></div>
              <p className="cart-page__empty-text">Your cart is empty</p>
              <Link to="/shop" className="btn btn--primary">Continue Shopping</Link>
            </div>
          ) : (
            <>
              <h2 className="cart-page__title">Your Cart ({cartCount} items)</h2>
              <div className="cart-page__layout">
                <div className="cart-page__items">
                  {cartItems.map(item => (
                    <div key={item.id} className="cart-item">
                      <Link to={`/product/${item.id}`} className="cart-item__image">
                        <img src={item.image} alt={item.name} />
                      </Link>
                      <div className="cart-item__info">
                        <div className="cart-item__brand">{item.brand}</div>
                        <Link to={`/product/${item.id}`} className="cart-item__name">{item.name}</Link>
                        <div className="cart-item__price">₹{item.salePrice.toLocaleString()}</div>
                        <div className="cart-item__controls">
                          <div className="cart-item__qty">
                            <button
                              className="cart-item__qty-btn"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <FiMinus />
                            </button>
                            <span className="cart-item__qty-value">{item.quantity}</span>
                            <button
                              className="cart-item__qty-btn"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <FiPlus />
                            </button>
                          </div>
                          <button
                            className="cart-item__remove"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <FiTrash2 /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <h3 className="cart-summary__title">Order Summary</h3>
                  <div className="cart-summary__row">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="cart-summary__row">
                    <span>Shipping</span>
                    <span>{cartTotal > 5000 ? 'Free' : '₹299'}</span>
                  </div>
                  <div className="cart-summary__row cart-summary__row--total">
                    <span>Total</span>
                    <span>₹{(cartTotal > 5000 ? cartTotal : cartTotal + 299).toLocaleString()}</span>
                  </div>
                  <div className="cart-summary__checkout">
                    <button className="btn btn--primary btn--full">Proceed to Checkout</button>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Link to="/shop" style={{ fontSize: '0.85rem', color: '#c9a84c' }}>
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CartPage

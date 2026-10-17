import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiCheckCircle, FiShield, FiTruck, FiLock, FiShare2, FiHeart } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { useNotification } from '../context/NotificationContext'

function CartPage() {
  const { cartItems, cartCount, cartTotal, updateQuantity, removeFromCart } = useCart()
  const { isAuthenticated } = useAuth()
  const { toggleWishlist } = useWishlist()
  const notify = useNotification()
  const navigate = useNavigate()
  const [isGift, setIsGift] = useState(false)

  const FREE_SHIPPING_THRESHOLD = 499
  const isFreeDelivery = cartTotal >= FREE_SHIPPING_THRESHOLD
  const amountToFreeDelivery = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal)

  const [checkingOut, setCheckingOut] = useState(false)

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      notify.warning('Please login to proceed to checkout')
      navigate('/login')
      return
    }

    setCheckingOut(true)
    try {
      // Check if cart contains Shopify/Dropdash products
      const { data: shopifyData } = await API.post('/orders/shopify-checkout', {
        cartItems: cartItems,
      })

      if (shopifyData?.isShopify && shopifyData?.checkoutUrl) {
        notify.success('Redirecting to checkout... 🛍️')
        clearCart()
        window.location.href = shopifyData.checkoutUrl
        return
      }
    } catch (e) {
      // Fallback to internal checkout page if network error or non-Shopify items
    } finally {
      setCheckingOut(false)
    }

    navigate('/checkout')
  }

  const handleRemove = (item) => {
    removeFromCart(item.id)
    notify.info(`${item.name} removed from cart`)
  }

  const handleSaveForLater = (item) => {
    toggleWishlist(item)
    removeFromCart(item.id)
    notify.success(`${item.name} moved to wishlist / saved for later`)
  }

  return (
    <div className="amazon-cart">
      <div className="amazon-cart__container">
        {cartItems.length === 0 ? (
          <div className="amazon-cart__empty-card">
            <div className="amazon-cart__empty-graphic">
              <div className="amazon-cart__empty-icon-circle">
                <FiShoppingBag />
              </div>
            </div>
            <div className="amazon-cart__empty-content">
              <h2>Your Shopping Cart is empty</h2>
              <p>Explore today's featured home deals and add items to your cart.</p>
              <div className="amazon-cart__empty-actions">
                <Link to="/shop" className="amazon-btn amazon-btn--yellow">
                  Continue Shopping
                </Link>
                {!isAuthenticated && (
                  <Link to="/login" className="amazon-btn amazon-btn--white">
                    Sign in to your account
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="amazon-cart__layout">
            {/* Left Column: Cart Main Container */}
            <div className="amazon-cart__main">
              {/* Free Delivery Banner */}
              <div className="amazon-cart__delivery-banner">
                <div className="amazon-cart__delivery-status">
                  <FiCheckCircle className="amazon-cart__check-icon" />
                  <div>
                    {isFreeDelivery ? (
                      <p className="amazon-cart__delivery-text">
                        <strong className="text-green">Your order qualifies for FREE Delivery!</strong> Choose this option at checkout.
                      </p>
                    ) : (
                      <p className="amazon-cart__delivery-text">
                        Add <strong>₹{amountToFreeDelivery.toLocaleString()}</strong> of eligible items to get <strong>FREE Delivery</strong>.
                      </p>
                    )}
                  </div>
                </div>
                {/* Progress bar towards free shipping */}
                <div className="amazon-cart__progress-track">
                  <div
                    className="amazon-cart__progress-fill"
                    style={{ width: `${Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Shopping Cart Items Card */}
              <div className="amazon-cart__items-card">
                <div className="amazon-cart__header">
                  <h1 className="amazon-cart__header-title">Shopping Cart</h1>
                  <span className="amazon-cart__price-label">Price</span>
                </div>

                <div className="amazon-cart__list">
                  {cartItems.map((item) => {
                    const originalPrice = item.price || Math.round(item.salePrice * 1.45)
                    const savings = Math.max(0, originalPrice - item.salePrice)

                    return (
                      <div key={item.id} className="amazon-cart__item">
                        {/* Product Image */}
                        <Link to={`/product/${item.id}`} className="amazon-cart__item-image-wrap">
                          <img src={item.image} alt={item.name} className="amazon-cart__item-image" />
                        </Link>

                        {/* Product Details */}
                        <div className="amazon-cart__item-details">
                          <div className="amazon-cart__item-title-row">
                            <Link to={`/product/${item.id}`} className="amazon-cart__item-title">
                              {item.name}
                            </Link>
                            <div className="amazon-cart__item-price-mobile">
                              ₹{(item.salePrice * item.quantity).toLocaleString()}
                            </div>
                          </div>

                          <div className="amazon-cart__item-brand">
                            by <span>{item.brand || 'SENVOX'}</span>
                          </div>

                          <div className="amazon-cart__stock-status">
                            <span className="amazon-cart__in-stock">In stock</span>
                            <span className="amazon-cart__eligible-badge">Eligible for FREE Shipping</span>
                          </div>

                          <div className="amazon-cart__gift-checkbox">
                            <label>
                              <input type="checkbox" /> This will be a gift
                            </label>
                          </div>

                          {/* Controls: Quantity Stepper, Delete, Save for Later */}
                          <div className="amazon-cart__item-actions">
                            <div className="amazon-cart__qty-stepper">
                              <button
                                type="button"
                                className="amazon-cart__qty-btn"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                aria-label="Decrease quantity"
                              >
                                {item.quantity === 1 ? <FiTrash2 /> : <FiMinus />}
                              </button>
                              <span className="amazon-cart__qty-num">Qty: {item.quantity}</span>
                              <button
                                type="button"
                                className="amazon-cart__qty-btn"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                aria-label="Increase quantity"
                              >
                                <FiPlus />
                              </button>
                            </div>

                            <span className="amazon-cart__action-sep">|</span>

                            <button
                              type="button"
                              className="amazon-cart__action-link"
                              onClick={() => handleRemove(item)}
                            >
                              Delete
                            </button>

                            <span className="amazon-cart__action-sep">|</span>

                            <button
                              type="button"
                              className="amazon-cart__action-link"
                              onClick={() => handleSaveForLater(item)}
                            >
                              Save for later
                            </button>

                            <span className="amazon-cart__action-sep">|</span>

                            <button
                              type="button"
                              className="amazon-cart__action-link"
                              onClick={() => {
                                navigator.clipboard?.writeText(window.location.origin + `/product/${item.id}`)
                                notify.success('Product link copied to clipboard!')
                              }}
                            >
                              Share
                            </button>
                          </div>
                        </div>

                        {/* Right-aligned Price */}
                        <div className="amazon-cart__item-price-col">
                          <div className="amazon-cart__item-price">
                            ₹{(item.salePrice * item.quantity).toLocaleString()}
                          </div>
                          {savings > 0 && (
                            <div className="amazon-cart__item-savings">
                              <span className="amazon-cart__item-original">
                                M.R.P.: ₹{(originalPrice * item.quantity).toLocaleString()}
                              </span>
                              <span className="amazon-cart__item-discount-badge">
                                Save ₹{(savings * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Subtotal row inside cart box */}
                <div className="amazon-cart__subtotal-footer">
                  Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'}):{' '}
                  <span className="amazon-cart__subtotal-amount">₹{cartTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Checkout Summary Box */}
            <div className="amazon-cart__sidebar">
              <div className="amazon-cart__summary-card">
                {/* Free Delivery Tag */}
                <div className="amazon-cart__summary-delivery-note">
                  <FiCheckCircle className="amazon-cart__check-icon" />
                  <span>
                    {isFreeDelivery ? (
                      <>
                        <strong className="text-green">Part of your order qualifies for FREE Delivery.</strong> Choose FREE Delivery at checkout.
                      </>
                    ) : (
                      <>
                        Add <strong>₹{amountToFreeDelivery.toLocaleString()}</strong> of items for <strong>FREE Delivery</strong>.
                      </>
                    )}
                  </span>
                </div>

                {/* Subtotal Header */}
                <div className="amazon-cart__summary-subtotal">
                  Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'}):{' '}
                  <span className="amazon-cart__summary-price">₹{cartTotal.toLocaleString()}</span>
                </div>

                {/* Gift Option */}
                <div className="amazon-cart__summary-gift">
                  <label>
                    <input
                      type="checkbox"
                      checked={isGift}
                      onChange={(e) => setIsGift(e.target.checked)}
                    />
                    This order contains a gift
                  </label>
                </div>

                {/* Yellow Checkout Button */}
                <button
                  type="button"
                  className="amazon-btn amazon-btn--yellow amazon-btn--full amazon-btn--lg"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                >
                  {checkingOut ? 'Preparing Checkout...' : 'Proceed to Buy'}
                </button>

                {/* Trust Badges under checkout button */}
                <div className="amazon-cart__trust-guarantee">
                  <div className="amazon-cart__trust-line">
                    <FiLock className="amazon-cart__trust-icon" />
                    <span>Secure transaction</span>
                  </div>
                  <div className="amazon-cart__trust-line">
                    <FiTruck className="amazon-cart__trust-icon" />
                    <span>5 - 7 Days Guaranteed Delivery</span>
                  </div>
                  <div className="amazon-cart__trust-line">
                    <FiShield className="amazon-cart__trust-icon" />
                    <span>7 Days Replacement Policy</span>
                  </div>
                </div>
              </div>

              {/* Continue Shopping Link Card */}
              <div className="amazon-cart__continue-card">
                <Link to="/shop" className="amazon-cart__continue-link">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartPage


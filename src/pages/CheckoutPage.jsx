import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiLock, FiTruck, FiShield, FiCheckCircle } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useNotification } from '../context/NotificationContext'
import API from '../api/axios'

function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const notify = useNotification()
  const [loading, setLoading] = useState(true)
  const [checkoutUrl, setCheckoutUrl] = useState('')
  const [error, setError] = useState(null)

  const FREE_SHIPPING_THRESHOLD = 499
  const shippingCharge = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99
  const totalAmount = cartTotal + shippingCharge

  const initiateShopifyCheckout = async () => {
    if (cartItems.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const { data: shopifyData } = await API.post('/orders/shopify-checkout', {
        cartItems: cartItems,
      })

      if (shopifyData?.isShopify && shopifyData?.checkoutUrl) {
        setCheckoutUrl(shopifyData.checkoutUrl)
        notify.success('Redirecting to official Shopify checkout... 🛍️')
        setTimeout(() => {
          window.location.assign(shopifyData.checkoutUrl)
        }, 150)
        return
      } else {
        setError(shopifyData?.message || 'No Shopify checkout session could be created.')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Could not connect to Shopify checkout. Please try again.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (cartItems.length > 0) {
      initiateShopifyCheckout()
    }
  }, [])

  if (cartItems.length === 0 && !checkoutUrl) {
    return (
      <div className="amazon-checkout-page">
        <div className="amazon-checkout__container" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div className="amazon-checkout__empty-card">
            <h2>Your cart is empty</h2>
            <p style={{ color: '#565959', margin: '8px 0 20px' }}>No items to check out.</p>
            <Link to="/shop" className="amazon-btn amazon-btn--yellow">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="amazon-checkout-page">
      {/* Amazon Minimal Checkout Header with Padlock */}
      <header className="amazon-checkout-header">
        <div className="amazon-checkout-header__container">
          <Link to="/" className="amazon-checkout-header__logo">
            YOUR<span>CART</span>
          </Link>
          <h1 className="amazon-checkout-header__title">
            Secure Checkout <span className="amazon-checkout-header__count">({cartItems.length} items)</span>
          </h1>
          <div className="amazon-checkout-header__security">
            <FiLock className="amazon-checkout-header__lock-icon" />
            <span>Official Shopify Powered</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="amazon-checkout__container">
        <div className="amazon-checkout__layout">
          {/* Left Column: Direct Shopify Gateway Card */}
          <div className="amazon-checkout__steps">
            <div className="amazon-step-card active" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
              <div style={{ maxWidth: '520px', margin: '0 auto' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  margin: '0 auto 1.25rem',
                }}>
                  {loading ? (
                    <span style={{
                      width: '32px',
                      height: '32px',
                      border: '3px solid #d97706',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      display: 'inline-block',
                    }} />
                  ) : (
                    <FiCheckCircle style={{ color: '#10b981' }} />
                  )}
                </div>

                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f1111', marginBottom: '8px' }}>
                  {loading ? 'Connecting to Official Shopify Checkout...' : 'Your Checkout Session is Ready'}
                </h2>

                <p style={{ color: '#565959', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                  To ensure maximum security and avoid entering your details twice, delivery address and payment (Cash on Delivery & Online) will be completed directly on the official Shopify checkout page.
                </p>

                {error && (
                  <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {checkoutUrl ? (
                    <a
                      href={checkoutUrl}
                      className="amazon-btn amazon-btn--yellow amazon-btn--lg"
                      style={{ width: '100%', fontSize: '1rem', fontWeight: 700, padding: '14px', textDecoration: 'none', display: 'block', textAlign: 'center' }}
                      onClick={() => clearCart()}
                    >
                      ⚡ Proceed to Shopify Checkout Now
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="amazon-btn amazon-btn--yellow amazon-btn--lg"
                      style={{ width: '100%', fontSize: '1rem', fontWeight: 700, padding: '14px' }}
                      onClick={() => initiateShopifyCheckout()}
                      disabled={loading}
                    >
                      {loading ? 'Preparing Checkout...' : '⚡ Retry Shopify Checkout'}
                    </button>
                  )}

                  <Link to="/cart" style={{ color: '#007185', fontSize: '0.9rem', textDecoration: 'none', marginTop: '6px' }}>
                    ← Return to Shopping Cart
                  </Link>
                </div>

                {/* Items in order */}
                <div style={{ marginTop: '2rem', textAlign: 'left', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#0f1111' }}>
                    Items in your order ({cartItems.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {cartItems.map((item) => (
                      <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e5e7eb' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#0f1111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#565959' }}>
                            Qty: {item.quantity} · ₹{(item.salePrice * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <aside className="amazon-checkout__sidebar">
            <div className="amazon-checkout__summary-card">
              {checkoutUrl ? (
                <a
                  href={checkoutUrl}
                  className="amazon-btn amazon-btn--yellow amazon-btn--full amazon-btn--lg"
                  style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}
                  onClick={() => clearCart()}
                >
                  Proceed to Checkout
                </a>
              ) : (
                <button
                  type="button"
                  className="amazon-btn amazon-btn--yellow amazon-btn--full amazon-btn--lg"
                  onClick={() => initiateShopifyCheckout()}
                  disabled={loading}
                >
                  {loading ? 'Preparing...' : 'Proceed to Checkout'}
                </button>
              )}

              <div className="amazon-checkout__summary-divider"></div>

              <h3 className="amazon-checkout__summary-title">Order Summary</h3>

              <div className="amazon-checkout__summary-row">
                <span>Items ({cartItems.length}):</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>

              <div className="amazon-checkout__summary-row">
                <span>Delivery:</span>
                <span>{shippingCharge === 0 ? <strong className="text-green">FREE</strong> : `₹${shippingCharge}`}</span>
              </div>

              <div className="amazon-checkout__summary-divider"></div>

              <div className="amazon-checkout__summary-total-row">
                <span>Order Total:</span>
                <span className="amazon-checkout__total-price">₹{totalAmount.toLocaleString()}</span>
              </div>

              {/* Guarantees Box */}
              <div className="amazon-checkout__trust-box">
                <div className="amazon-checkout__trust-item">
                  <FiTruck className="amazon-checkout__trust-icon" />
                  <span>5 - 7 Days Fast Delivery across India</span>
                </div>
                <div className="amazon-checkout__trust-item">
                  <FiShield className="amazon-checkout__trust-icon" />
                  <span>Cash on Delivery (COD) Available</span>
                </div>
                <div className="amazon-checkout__trust-item">
                  <FiLock className="amazon-checkout__trust-icon" />
                  <span>256-Bit SSL Encrypted Shopify Checkout</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default CheckoutPage

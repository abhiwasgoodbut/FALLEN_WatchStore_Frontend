import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiLock, FiCheck, FiTruck, FiShield, FiCreditCard, FiChevronDown, FiAlertCircle } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import API from '../api/axios'

function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const notify = useNotification()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // Amazon Multi-Step state: 1 = Address, 2 = Payment, 3 = Review
  const [currentStep, setCurrentStep] = useState(1)

  const [address, setAddress] = useState({
    fullName: user?.firstName ? `${user.firstName} ${user.lastName}` : '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  })

  // Payment method selection: 'razorpay' (UPI, Cards, NetBanking) or 'cod' (Cash on Delivery)
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [deliverySpeed, setDeliverySpeed] = useState('standard')

  // Free delivery threshold: ₹499
  const FREE_SHIPPING_THRESHOLD = 499
  const shippingCharge = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : 99
  const codFee = paymentMethod === 'cod' ? 11 : 0
  const totalAmount = cartTotal + shippingCharge + codFee

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value })
  }

  const isAddressComplete =
    Boolean(address.fullName && address.phone && address.addressLine1 && address.city && address.state && address.pincode)

  const handleAddressSubmit = (e) => {
    e.preventDefault()
    if (!isAddressComplete) {
      notify.warning('Please fill in all required address fields')
      return
    }
    setCurrentStep(2)
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  // Check if cart contains any Shopify synced products
  const hasShopifyProducts = cartItems.some(item => Boolean(item.shopifyProductId || item.shopifyVariantId))

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return

    if (!isAddressComplete) {
      notify.warning('Please complete your delivery address first.')
      setCurrentStep(1)
      return
    }

    setLoading(true)

    try {
      // 1. Check with Backend if any items in the cart are Shopify products
      const { data: shopifyData } = await API.post('/orders/shopify-checkout', {
        cartItems: cartItems,
        shippingAddress: address,
      })

      // If backend confirms it's a Shopify product with a checkout URL, redirect immediately
      if (shopifyData?.isShopify && shopifyData?.checkoutUrl) {
        notify.success('Redirecting to official Shopify Checkout... 🛍️')
        clearCart()
        window.location.href = shopifyData.checkoutUrl
        return
      }

      // 2. Normal / Custom Products: Proceed with our Backend (COD or Razorpay)
      if (paymentMethod === 'cod') {
        const { data } = await API.post('/orders', {
          shippingAddress: address,
          cartItems: cartItems,
          paymentMethod: 'cod',
        })
        clearCart()
        notify.success('Order placed successfully via Cash on Delivery! 🎉')
        navigate('/track-order')
        return
      }

      // Online Razorpay Checkout for Normal Products
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        notify.error('Failed to load payment gateway. Please check your internet connection.')
        setLoading(false)
        return
      }

      // Create order on backend
      const { data } = await API.post('/orders', {
        shippingAddress: address,
        cartItems: cartItems,
        paymentMethod: 'razorpay',
      })

      // Open Razorpay checkout modal
      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: 'INR',
        name: 'YourCart Home & Kitchen',
        description: `Order #${data.order?._id?.slice(-6) || 'New'} — ${cartItems.length} item(s)`,
        order_id: data.razorpayOrderId,
        handler: async function (response) {
          try {
            await API.post('/orders/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            clearCart()
            notify.success('Payment verified! Order placed successfully 🎉')
            navigate('/track-order')
          } catch (err) {
            notify.error('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: address.fullName,
          contact: address.phone,
          email: user?.email || '',
        },
        theme: {
          color: '#f59e0b',
        },
        modal: {
          ondismiss: async function () {
            try {
              await API.put(`/orders/${data.order._id}/cancel`)
            } catch (e) { /* ignore */ }
            notify.info('Payment cancelled — you can retry whenever ready.')
            setLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to initialize order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
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
            Checkout <span className="amazon-checkout-header__count">({cartItems.length} items)</span>
          </h1>
          <div className="amazon-checkout-header__security">
            <FiLock className="amazon-checkout-header__lock-icon" />
            <span>100% Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* Main Multi-Step Layout */}
      <main className="amazon-checkout__container">
        <div className="amazon-checkout__layout">
          {/* Left Column: Multi-Step Accordion Form */}
          <div className="amazon-checkout__steps">
            
            {/* STEP 1: DELIVERY ADDRESS */}
            <section className={`amazon-step-card ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <div className="amazon-step-card__header">
                <span className="amazon-step-card__num">
                  {currentStep > 1 ? <FiCheck /> : '1'}
                </span>
                <div className="amazon-step-card__title-wrap">
                  <h2 className="amazon-step-card__title">Select a delivery address</h2>
                  {currentStep > 1 && isAddressComplete && (
                    <p className="amazon-step-card__summary">
                      {address.fullName}, {address.addressLine1}, {address.city}, {address.state} - {address.pincode}
                    </p>
                  )}
                </div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="amazon-step-card__change-btn"
                    onClick={() => setCurrentStep(1)}
                  >
                    Change
                  </button>
                )}
              </div>

              {currentStep === 1 && (
                <form className="amazon-step-card__body" onSubmit={handleAddressSubmit}>
                  <div className="amazon-form__row amazon-form__row--2">
                    <div className="amazon-form__group">
                      <label className="amazon-form__label">Full Name *</label>
                      <input
                        className="amazon-form__input"
                        name="fullName"
                        placeholder="e.g. Rahul Sharma"
                        value={address.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="amazon-form__group">
                      <label className="amazon-form__label">Mobile Number *</label>
                      <input
                        className="amazon-form__input"
                        name="phone"
                        placeholder="10-digit mobile number"
                        value={address.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="amazon-form__group">
                    <label className="amazon-form__label">Flat, House no., Building, Apartment *</label>
                    <input
                      className="amazon-form__input"
                      name="addressLine1"
                      placeholder="e.g. Flat 402, Royal Enclave"
                      value={address.addressLine1}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="amazon-form__group">
                    <label className="amazon-form__label">Area, Street, Sector, Village (optional)</label>
                    <input
                      className="amazon-form__input"
                      name="addressLine2"
                      placeholder="e.g. Sector 14, Near Metro Station"
                      value={address.addressLine2}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="amazon-form__row amazon-form__row--3">
                    <div className="amazon-form__group">
                      <label className="amazon-form__label">City / Town *</label>
                      <input
                        className="amazon-form__input"
                        name="city"
                        placeholder="e.g. Jaipur"
                        value={address.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="amazon-form__group">
                      <label className="amazon-form__label">State *</label>
                      <input
                        className="amazon-form__input"
                        name="state"
                        placeholder="e.g. Rajasthan"
                        value={address.state}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="amazon-form__group">
                      <label className="amazon-form__label">Pincode *</label>
                      <input
                        className="amazon-form__input"
                        name="pincode"
                        placeholder="6 digits [0-9]"
                        value={address.pincode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="amazon-step-card__footer">
                    <button type="submit" className="amazon-btn amazon-btn--yellow amazon-btn--md">
                      Use this address
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* STEP 2: PAYMENT METHOD */}
            <section className={`amazon-step-card ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className="amazon-step-card__header">
                <span className="amazon-step-card__num">
                  {currentStep > 2 ? <FiCheck /> : '2'}
                </span>
                <div className="amazon-step-card__title-wrap">
                  <h2 className="amazon-step-card__title">Payment method</h2>
                  {currentStep > 2 && (
                    <p className="amazon-step-card__summary">
                      {paymentMethod === 'razorpay'
                        ? 'Online Payment (UPI / Credit Card / Debit Card / NetBanking)'
                        : 'Cash on Delivery (Pay upon arrival)'}
                    </p>
                  )}
                </div>
                {currentStep > 2 && (
                  <button
                    type="button"
                    className="amazon-step-card__change-btn"
                    onClick={() => setCurrentStep(2)}
                  >
                    Change
                  </button>
                )}
              </div>

              {currentStep === 2 && (
                <div className="amazon-step-card__body">
                  <div className="amazon-payment-options">
                    {/* Razorpay Online */}
                    <label className={`amazon-payment-option ${paymentMethod === 'razorpay' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentOption"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                      />
                      <div className="amazon-payment-option__info">
                        <div className="amazon-payment-option__title-row">
                          <strong className="amazon-payment-option__name">UPI / Credit or Debit Card / NetBanking</strong>
                          <span className="amazon-payment-option__badge">Fast & Secure</span>
                        </div>
                        <p className="amazon-payment-option__desc">
                          Instant verification via Razorpay. Accepts Google Pay, PhonePe, Paytm, Visa, Mastercard, Rupay & NetBanking.
                        </p>
                      </div>
                    </label>

                    {/* Pay on Delivery Option */}
                    <label className={`amazon-payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentOption"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                      />
                      <div className="amazon-payment-option__info">
                        <div className="amazon-payment-option__title-row">
                          <strong className="amazon-payment-option__name">Pay on Delivery / Cash on Delivery</strong>
                          <span className="amazon-payment-option__badge" style={{ background: '#c45500' }}>+₹11 COD Fee</span>
                        </div>
                        <p className="amazon-payment-option__desc">
                          Pay cash or scan QR via UPI at your doorstep. Standard ₹11 Cash handling fee applies.
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="amazon-step-card__footer">
                    <button
                      type="button"
                      className="amazon-btn amazon-btn--yellow amazon-btn--md"
                      onClick={() => setCurrentStep(3)}
                    >
                      Use this payment method
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* STEP 3: REVIEW ITEMS AND DELIVERY */}
            <section className={`amazon-step-card ${currentStep === 3 ? 'active' : ''}`}>
              <div className="amazon-step-card__header">
                <span className="amazon-step-card__num">3</span>
                <div className="amazon-step-card__title-wrap">
                  <h2 className="amazon-step-card__title">Review items and delivery</h2>
                </div>
              </div>

              {currentStep === 3 && (
                <div className="amazon-step-card__body">
                  {/* Delivery Speed Options */}
                  <div className="amazon-review__delivery-box">
                    <div className="amazon-review__delivery-title">
                      <FiTruck className="text-green" /> Delivery Option
                    </div>
                    <label className="amazon-review__delivery-option">
                      <input
                        type="radio"
                        name="deliverySpeed"
                        checked={deliverySpeed === 'standard'}
                        onChange={() => setDeliverySpeed('standard')}
                      />
                      <span>
                        <strong className="text-green">
                          {shippingCharge === 0 ? 'FREE Guaranteed Delivery' : 'Guaranteed Delivery (₹99)'}
                        </strong>{' '}
                        — <strong>5 - 7 Days Guaranteed Delivery</strong> across India.
                      </span>
                    </label>
                  </div>

                  {/* Items List */}
                  <div className="amazon-review__items-list">
                    {cartItems.map((item) => (
                      <div key={item.id} className="amazon-review__item">
                        <img src={item.image} alt={item.name} className="amazon-review__item-img" />
                        <div className="amazon-review__item-info">
                          <h4 className="amazon-review__item-title">{item.name}</h4>
                          <div className="amazon-review__item-brand">by {item.brand || 'SENVOX'}</div>
                          <div className="amazon-review__item-price-row">
                            <span className="amazon-review__item-price">
                              ₹{(item.salePrice * item.quantity).toLocaleString()}
                            </span>
                            <span className="amazon-review__item-qty">Qty: {item.quantity}</span>
                          </div>
                          <span className="amazon-cart__in-stock">In stock</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="amazon-step-card__footer" style={{ borderTop: '1px solid #e7e7e7', paddingTop: '1.25rem' }}>
                    <button
                      type="button"
                      className="amazon-btn amazon-btn--yellow amazon-btn--lg"
                      onClick={handlePlaceOrder}
                      disabled={loading}
                    >
                      {loading
                        ? 'Processing...'
                        : hasShopifyProducts
                        ? `Proceed to Shopify Checkout (₹${totalAmount.toLocaleString()})`
                        : paymentMethod === 'cod'
                        ? `Place your COD order (₹${totalAmount.toLocaleString()})`
                        : `Place your order and Pay with Razorpay (₹${totalAmount.toLocaleString()})`}
                    </button>
                    <p className="amazon-checkout__policy-note">
                      By placing your order, you agree to YourCart's Conditions of Use & Sale and Privacy Notice.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Sticky Amazon Order Summary Card */}
          <aside className="amazon-checkout__sidebar">
            <div className="amazon-checkout__summary-card">
              <button
                type="button"
                className="amazon-btn amazon-btn--yellow amazon-btn--full amazon-btn--lg"
                onClick={() => {
                  if (currentStep < 3) {
                    if (!isAddressComplete) {
                      notify.warning('Please complete the delivery address first.')
                      setCurrentStep(1)
                      return
                    }
                    setCurrentStep(3)
                  } else {
                    handlePlaceOrder()
                  }
                }}
                disabled={loading}
              >
                {loading
                  ? 'Processing...'
                  : currentStep === 3
                  ? (hasShopifyProducts ? 'Proceed to Shopify Checkout' : (paymentMethod === 'cod' ? 'Place your COD order' : 'Pay with Razorpay'))
                  : `Continue to Step ${currentStep + 1}`}
              </button>

              <p className="amazon-checkout__terms-tiny">
                Choose a payment method to continue checking out. You will still have an opportunity to review and edit your order before it's final.
              </p>

              <div className="amazon-checkout__summary-divider"></div>

              <h3 className="amazon-checkout__summary-title">Order Summary</h3>

              <div className="amazon-checkout__summary-row">
                <span>Items ({cartItems.length}):</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>

              <div className="amazon-checkout__summary-row">
                <span>Delivery / Shipping:</span>
                <span>{shippingCharge === 0 ? <strong className="text-green">FREE</strong> : `₹${shippingCharge}`}</span>
              </div>

              {codFee > 0 && (
                <div className="amazon-checkout__summary-row">
                  <span>Cash on Delivery Fee:</span>
                  <span style={{ color: '#c45500', fontWeight: 600 }}>₹{codFee}</span>
                </div>
              )}

              <div className="amazon-checkout__summary-divider"></div>

              <div className="amazon-checkout__summary-total-row">
                <span>Order Total:</span>
                <span className="amazon-checkout__total-price">₹{totalAmount.toLocaleString()}</span>
              </div>

              {/* Guarantees Box */}
              <div className="amazon-checkout__trust-box">
                <div className="amazon-checkout__trust-item">
                  <FiTruck className="amazon-checkout__trust-icon" />
                  <span>5 - 7 Days Guaranteed Delivery across India</span>
                </div>
                <div className="amazon-checkout__trust-item">
                  <FiShield className="amazon-checkout__trust-icon" />
                  <span>100% Purchase Protection with genuine guarantee</span>
                </div>
                <div className="amazon-checkout__trust-item">
                  <FiLock className="amazon-checkout__trust-icon" />
                  <span>256-Bit SSL Encrypted & PCI-DSS Compliant</span>
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


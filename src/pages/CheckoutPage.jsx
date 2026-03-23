import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

  const shippingCharge = cartTotal >= 5000 ? 0 : 99
  const totalAmount = cartTotal + shippingCharge

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value })
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

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (cartItems.length === 0) return

    // Validate
    if (!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.state || !address.pincode) {
      notify.warning('Please fill in all required address fields')
      return
    }

    setLoading(true)

    try {
      // Load Razorpay SDK
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
      })

      // Open Razorpay checkout
      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: 'INR',
        name: 'FALLEN Watches',
        description: `Order — ${cartItems.length} item(s)`,
        order_id: data.razorpayOrderId,
        handler: async function (response) {
          try {
            await API.post('/orders/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            clearCart()
            notify.success('Payment successful! Your order has been placed 🎉')
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
          color: '#c9a84c',
        },
        modal: {
          ondismiss: async function () {
            // Cancel the unpaid order in DB
            try {
              await API.put(`/orders/${data.order._id}/cancel`)
            } catch (e) { /* ignore */ }
            notify.info('Payment cancelled — order has been removed')
            setLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      notify.error(error.response?.data?.message || 'Failed to create order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout">
        <div className="checkout__container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2>Your cart is empty</h2>
          <Link to="/shop" className="btn btn--primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="page-banner">
        <h1 className="page-banner__title">Checkout</h1>
        <p className="page-banner__breadcrumb">
          <Link to="/">Home</Link> / <Link to="/cart">Cart</Link> / Checkout
        </p>
      </div>

      <div className="checkout">
        <div className="checkout__container">
          <form onSubmit={handlePlaceOrder}>
            <div className="checkout__grid">
              {/* Left — Shipping Form */}
              <div>
                <div className="checkout__section">
                  <h3 className="checkout__section-title">Shipping Address</h3>
                  <div className="checkout__form">
                    <div className="checkout__row">
                      <input className="checkout__input" name="fullName" placeholder="Full Name *" value={address.fullName} onChange={handleChange} required />
                      <input className="checkout__input" name="phone" placeholder="Phone Number *" value={address.phone} onChange={handleChange} required />
                    </div>
                    <input className="checkout__input" name="addressLine1" placeholder="Address Line 1 *" value={address.addressLine1} onChange={handleChange} required />
                    <input className="checkout__input" name="addressLine2" placeholder="Address Line 2 (optional)" value={address.addressLine2} onChange={handleChange} />
                    <div className="checkout__row">
                      <input className="checkout__input" name="city" placeholder="City *" value={address.city} onChange={handleChange} required />
                      <input className="checkout__input" name="state" placeholder="State *" value={address.state} onChange={handleChange} required />
                    </div>
                    <div className="checkout__row">
                      <input className="checkout__input" name="pincode" placeholder="PIN Code *" value={address.pincode} onChange={handleChange} required />
                      <input className="checkout__input" name="country" placeholder="Country" value={address.country} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right — Summary */}
              <div className="checkout__summary">
                <h3 className="checkout__summary-title">Order Summary</h3>

                {cartItems.map(item => (
                  <div key={item.id} className="checkout__summary-item">
                    <img src={item.image} alt={item.name} className="checkout__summary-item-img" />
                    <span className="checkout__summary-item-name">
                      {item.name} <span style={{ color: '#999' }}>×{item.quantity}</span>
                    </span>
                    <span className="checkout__summary-item-price">
                      ₹{(item.salePrice * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}

                <div style={{ marginTop: '1rem' }}>
                  <div className="checkout__summary-row">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="checkout__summary-row">
                    <span>Shipping</span>
                    <span>{shippingCharge === 0 ? 'Free' : `₹${shippingCharge}`}</span>
                  </div>
                  <div className="checkout__summary-total">
                    <span>Total</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn--primary btn--full"
                  style={{ marginTop: '1.5rem' }}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString()}`}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default CheckoutPage

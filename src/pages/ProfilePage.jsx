import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiPhone, FiPackage, FiLogOut, FiChevronDown, FiChevronUp, FiMapPin } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import API from '../api/axios'

function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const notify = useNotification()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchOrders()
  }, [isAuthenticated])

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders/my')
      setOrders(data)
    } catch (error) {
      // If backend is down, just show empty
      setOrders([])
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleLogout = () => {
    logout()
    notify.info('Logged out successfully')
    navigate('/')
  }

  const statusSteps = ['processing', 'shipped', 'delivered']
  const statusConfig = {
    processing: { label: 'Processing', color: '#f39c12', icon: '🔄' },
    shipped:    { label: 'Shipped', color: '#3498db', icon: '🚚' },
    delivered:  { label: 'Delivered', color: '#27ae60', icon: '✅' },
    cancelled:  { label: 'Cancelled', color: '#e74c3c', icon: '❌' },
  }

  const getStepIndex = (status) => {
    if (status === 'cancelled') return -1
    return statusSteps.indexOf(status)
  }

  if (!isAuthenticated) return null

  return (
    <>
      <div className="page-banner">
        <h1 className="page-banner__title">My Account</h1>
        <p className="page-banner__breadcrumb">
          <Link to="/">Home</Link> / Profile
        </p>
      </div>

      <div className="profile">
        <div className="profile__container">
          <div className="profile__grid">
            {/* Left — User Info */}
            <div className="profile__sidebar">
              <div className="profile__card">
                <div className="profile__avatar">
                  {user.avatar?.url ? (
                    <img src={user.avatar.url} alt={user.firstName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <FiUser />
                  )}
                </div>
                <h2 className="profile__name">{user.firstName} {user.lastName}</h2>
                <span className="profile__role">{user.role === 'admin' ? '⭐ Admin' : 'Customer'}</span>

                <div className="profile__details">
                  <div className="profile__detail">
                    <FiMail />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="profile__detail">
                      <FiPhone />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>

                <div className="profile__stats">
                  <div className="profile__stat">
                    <span className="profile__stat-value">{orders.length}</span>
                    <span className="profile__stat-label">Orders</span>
                  </div>
                  <div className="profile__stat">
                    <span className="profile__stat-value">
                      {orders.filter(o => o.orderStatus === 'delivered').length}
                    </span>
                    <span className="profile__stat-label">Delivered</span>
                  </div>
                </div>

                <button className="btn btn--outline-dark btn--full" onClick={handleLogout} style={{ marginTop: '1.5rem' }}>
                  <FiLogOut /> Logout
                </button>
              </div>
            </div>

            {/* Right — Orders */}
            <div className="profile__orders">
              <h2 className="profile__orders-title">
                <FiPackage /> My Orders
              </h2>

              {loadingOrders ? (
                <div className="profile__loading">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="profile__empty-orders">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                  <h3>No orders yet</h3>
                  <p>Start shopping to see your orders here!</p>
                  <Link to="/shop" className="btn btn--primary" style={{ marginTop: '1rem' }}>
                    Shop Now
                  </Link>
                </div>
              ) : (
                <div className="profile__order-list">
                  {orders.map(order => {
                    const isExpanded = expandedOrder === order._id
                    const activeStep = getStepIndex(order.orderStatus)
                    const config = statusConfig[order.orderStatus]

                    return (
                      <div key={order._id} className="order-card">
                        {/* Order Header */}
                        <div
                          className="order-card__header"
                          onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                        >
                          <div className="order-card__header-left">
                            <div className="order-card__id">
                              {order.trackingId || order._id.slice(-8).toUpperCase()}
                            </div>
                            <div className="order-card__date">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </div>
                          </div>
                          <div className="order-card__header-right">
                            <span
                              className="order-card__status"
                              style={{ background: config.color + '18', color: config.color }}
                            >
                              {config.icon} {config.label}
                            </span>
                            <span className="order-card__total">₹{order.totalAmount?.toLocaleString()}</span>
                            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                          </div>
                        </div>

                        {/* Expanded Detail */}
                        {isExpanded && (
                          <div className="order-card__detail">
                            {/* Progress Bar */}
                            {order.orderStatus !== 'cancelled' && (
                              <div className="order-card__progress">
                                <div className="order-card__progress-track">
                                  <div
                                    className="order-card__progress-fill"
                                    style={{ width: `${((activeStep + 1) / statusSteps.length) * 100}%` }}
                                  ></div>
                                </div>
                                <div className="order-card__progress-steps">
                                  {statusSteps.map((step, i) => (
                                    <div key={step} className={`order-card__step ${i <= activeStep ? 'active' : ''}`}>
                                      <div className="order-card__step-dot">
                                        {i <= activeStep ? '✓' : i + 1}
                                      </div>
                                      <span className="order-card__step-label">
                                        {statusConfig[step].label}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Items */}
                            <div className="order-card__items">
                              <h4 className="order-card__items-title">Items</h4>
                              {order.orderItems.map((item, i) => (
                                <div key={i} className="order-card__item">
                                  <img
                                    src={item.image || 'https://via.placeholder.com/60'}
                                    alt={item.name}
                                    className="order-card__item-img"
                                  />
                                  <div className="order-card__item-info">
                                    <span className="order-card__item-name">{item.name}</span>
                                    <span className="order-card__item-qty">Qty: {item.quantity}</span>
                                  </div>
                                  <span className="order-card__item-price">
                                    ₹{(item.price * item.quantity).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Shipping Address */}
                            {order.shippingAddress && (
                              <div className="order-card__address">
                                <h4><FiMapPin /> Shipping Address</h4>
                                <p>
                                  {order.shippingAddress.fullName}<br />
                                  {order.shippingAddress.addressLine1}
                                  {order.shippingAddress.addressLine2 && <>, {order.shippingAddress.addressLine2}</>}<br />
                                  {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                                </p>
                              </div>
                            )}

                            {/* Summary */}
                            <div className="order-card__summary">
                              <div className="order-card__summary-row">
                                <span>Subtotal</span>
                                <span>₹{order.itemsTotal?.toLocaleString()}</span>
                              </div>
                              <div className="order-card__summary-row">
                                <span>Shipping</span>
                                <span>{order.shippingCharge === 0 ? 'Free' : `₹${order.shippingCharge}`}</span>
                              </div>
                              {order.discount > 0 && (
                                <div className="order-card__summary-row" style={{ color: '#27ae60' }}>
                                  <span>Discount</span>
                                  <span>-₹{order.discount.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="order-card__summary-row order-card__summary-total">
                                <span>Total</span>
                                <span>₹{order.totalAmount?.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfilePage

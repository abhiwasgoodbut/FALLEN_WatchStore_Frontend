import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiPhone, FiPackage, FiLogOut, FiMapPin, FiTruck, FiCheckCircle, FiClock, FiSearch, FiExternalLink, FiRepeat } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useNotification } from '../context/NotificationContext'
import API from '../api/axios'

function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const { addToCart } = useCart()
  const notify = useNotification()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

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

  const handleBuyAgain = (item) => {
    addToCart({
      id: item.product || item._id,
      name: item.name,
      salePrice: item.price,
      price: Math.round(item.price * 1.3),
      image: item.image,
    })
    notify.success(`${item.name} added to cart!`)
    navigate('/cart')
  }

  // Filter orders by tab & search query
  const filteredOrders = orders.filter((order) => {
    // Tab filter
    if (activeTab === 'delivered' && order.orderStatus !== 'delivered') return false
    if (activeTab === 'processing' && order.orderStatus !== 'processing' && order.orderStatus !== 'shipped') return false
    if (activeTab === 'cancelled' && order.orderStatus !== 'cancelled') return false

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchesId = (order.trackingId || order._id).toLowerCase().includes(q)
      const matchesItem = order.orderItems?.some((it) => it.name.toLowerCase().includes(q))
      return matchesId || matchesItem
    }
    return true
  })

  if (!isAuthenticated) return null

  return (
    <div className="amazon-profile-page">
      <div className="amazon-profile__container">
        {/* Breadcrumb */}
        <div className="amazon-profile__breadcrumb">
          <Link to="/">Your Account</Link> › <span className="active">Your Orders</span>
        </div>

        <div className="amazon-profile__layout">
          {/* Left Column: Account Profile Sidebar */}
          <aside className="amazon-profile__sidebar">
            <div className="amazon-profile__user-card">
              <div className="amazon-profile__avatar-wrap">
                {user.avatar?.url ? (
                  <img src={user.avatar.url} alt={user.firstName} className="amazon-profile__avatar-img" />
                ) : (
                  <div className="amazon-profile__avatar-fallback">
                    <FiUser />
                  </div>
                )}
              </div>

              <h2 className="amazon-profile__user-name">
                {user.firstName} {user.lastName}
              </h2>
              <span className="amazon-profile__user-role">
                {user.role === 'admin' ? '⭐ Verified Store Admin' : 'Prime Customer'}
              </span>

              <div className="amazon-profile__info-list">
                <div className="amazon-profile__info-item">
                  <FiMail className="amazon-profile__info-icon" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="amazon-profile__info-item">
                    <FiPhone className="amazon-profile__info-icon" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>

              {/* Quick metrics */}
              <div className="amazon-profile__metrics">
                <div className="amazon-profile__metric-box">
                  <strong>{orders.length}</strong>
                  <span>Orders</span>
                </div>
                <div className="amazon-profile__metric-box">
                  <strong>{orders.filter((o) => o.orderStatus === 'delivered').length}</strong>
                  <span>Delivered</span>
                </div>
              </div>

              <button
                type="button"
                className="amazon-btn amazon-btn--white amazon-btn--full amazon-profile__logout-btn"
                onClick={handleLogout}
              >
                <FiLogOut /> Sign Out
              </button>
            </div>
          </aside>

          {/* Right Column: Amazon Your Orders Content */}
          <main className="amazon-profile__main">
            <div className="amazon-orders-header">
              <h1 className="amazon-orders-header__title">Your Orders</h1>

              {/* Search Orders Input */}
              <div className="amazon-orders-search">
                <FiSearch className="amazon-orders-search__icon" />
                <input
                  type="text"
                  placeholder="Search all orders or products"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="amazon-orders-search__input"
                />
              </div>
            </div>

            {/* Filter Tabs like Amazon (Orders, Not Yet Shipped, Cancelled) */}
            <div className="amazon-orders-tabs">
              <button
                type="button"
                className={`amazon-orders-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                Orders ({orders.length})
              </button>
              <button
                type="button"
                className={`amazon-orders-tab ${activeTab === 'processing' ? 'active' : ''}`}
                onClick={() => setActiveTab('processing')}
              >
                Not Yet Shipped ({orders.filter((o) => o.orderStatus === 'processing' || o.orderStatus === 'shipped').length})
              </button>
              <button
                type="button"
                className={`amazon-orders-tab ${activeTab === 'delivered' ? 'active' : ''}`}
                onClick={() => setActiveTab('delivered')}
              >
                Delivered ({orders.filter((o) => o.orderStatus === 'delivered').length})
              </button>
              <button
                type="button"
                className={`amazon-orders-tab ${activeTab === 'cancelled' ? 'active' : ''}`}
                onClick={() => setActiveTab('cancelled')}
              >
                Cancelled Orders
              </button>
            </div>

            {/* Order Cards List */}
            {loadingOrders ? (
              <div className="amazon-orders__loading">
                <div className="amazon-orders__spinner"></div>
                <p>Loading your orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="amazon-orders__empty">
                <FiPackage className="amazon-orders__empty-icon" />
                <h3>No orders placed in this period</h3>
                <p>Looking for a past purchase? Search by item title or browse our home catalog.</p>
                <Link to="/shop" className="amazon-btn amazon-btn--yellow" style={{ marginTop: '1rem' }}>
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="amazon-orders__list">
                {filteredOrders.map((order) => {
                  const isDelivered = order.orderStatus === 'delivered'
                  const isCancelled = order.orderStatus === 'cancelled'
                  const isCOD = order.paymentInfo?.method === 'cod'

                  return (
                    <article key={order._id} className="amazon-order-card">
                      {/* Grey Amazon Top Order Bar */}
                      <div className="amazon-order-card__topbar">
                        <div className="amazon-order-card__meta-group">
                          <span className="amazon-order-card__meta-label">ORDER PLACED</span>
                          <span className="amazon-order-card__meta-val">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="amazon-order-card__meta-group">
                          <span className="amazon-order-card__meta-label">TOTAL</span>
                          <span className="amazon-order-card__meta-val">
                            ₹{order.totalAmount?.toLocaleString()}{' '}
                            {isCOD && <small className="amazon-order-card__cod-tag">(Cash on Delivery)</small>}
                          </span>
                        </div>

                        <div className="amazon-order-card__meta-group">
                          <span className="amazon-order-card__meta-label">SHIP TO</span>
                          <span className="amazon-order-card__meta-val amazon-order-card__shipto">
                            {order.shippingAddress?.fullName || user.firstName} ▾
                            <div className="amazon-order-card__address-popover">
                              <strong>{order.shippingAddress?.fullName}</strong>
                              <p>
                                {order.shippingAddress?.addressLine1}
                                {order.shippingAddress?.addressLine2 && <>, {order.shippingAddress.addressLine2}</>}<br />
                                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}<br />
                                Phone: {order.shippingAddress?.phone}
                              </p>
                            </div>
                          </span>
                        </div>

                        <div className="amazon-order-card__topbar-right">
                          <span className="amazon-order-card__meta-label">ORDER # {order.trackingId || order._id.slice(-8).toUpperCase()}</span>
                          <Link to={`/track-order`} className="amazon-order-card__link">
                            View order details
                          </Link>
                        </div>
                      </div>

                      {/* White Card Body */}
                      <div className="amazon-order-card__body">
                        {/* Status Headline */}
                        <div className="amazon-order-card__status-banner">
                          {(() => {
                            switch (order.orderStatus) {
                              case 'delivered':
                                return (
                                  <>
                                    <h3 className="amazon-order-card__status-title text-green">
                                      <FiCheckCircle /> Delivered{' '}
                                      {order.deliveredAt
                                        ? new Date(order.deliveredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                        : ''}
                                    </h3>
                                    <p className="amazon-order-card__status-sub">
                                      Package was handed directly to resident. Verified delivery completed.
                                    </p>
                                  </>
                                )
                              case 'out_for_delivery':
                                return (
                                  <>
                                    <h3 className="amazon-order-card__status-title" style={{ color: '#c45500' }}>
                                      <FiTruck /> Out for Delivery Today
                                    </h3>
                                    <p className="amazon-order-card__status-sub">
                                      Your delivery associate is out with your package and will deliver by 9 PM.
                                    </p>
                                  </>
                                )
                              case 'in_transit':
                                return (
                                  <>
                                    <h3 className="amazon-order-card__status-title" style={{ color: '#007185' }}>
                                      <FiTruck /> In Transit — On the way
                                    </h3>
                                    <p className="amazon-order-card__status-sub">
                                      Package has left the regional distribution hub and is heading towards your local delivery station.
                                    </p>
                                  </>
                                )
                              case 'dispatched':
                                return (
                                  <>
                                    <h3 className="amazon-order-card__status-title" style={{ color: '#007185' }}>
                                      <FiPackage /> Dispatched from Warehouse
                                    </h3>
                                    <p className="amazon-order-card__status-sub">
                                      Your package has been picked, packaged, and handed over to the courier partner.
                                    </p>
                                  </>
                                )
                              case 'confirmed':
                                return (
                                  <>
                                    <h3 className="amazon-order-card__status-title text-green">
                                      <FiCheckCircle /> Order Confirmed
                                    </h3>
                                    <p className="amazon-order-card__status-sub">
                                      We have received your order. Warehouse is preparing your items for dispatch.
                                    </p>
                                  </>
                                )
                              case 'cancelled':
                                return (
                                  <>
                                    <h3 className="amazon-order-card__status-title text-red">
                                      Cancelled
                                    </h3>
                                    <p className="amazon-order-card__status-sub">
                                      This order has been cancelled.
                                    </p>
                                  </>
                                )
                              case 'returned':
                                return (
                                  <>
                                    <h3 className="amazon-order-card__status-title" style={{ color: '#e67e22' }}>
                                      ↩ Return Processed
                                    </h3>
                                    <p className="amazon-order-card__status-sub">
                                      The return pickup has been completed and verified.
                                    </p>
                                  </>
                                )
                              case 'processing':
                              default:
                                return (
                                  <>
                                    <h3 className="amazon-order-card__status-title text-green">
                                      <FiClock /> Order Processing (5 - 7 Days Guaranteed Delivery)
                                    </h3>
                                    <p className="amazon-order-card__status-sub">
                                      Your order is being reviewed and packed by our fulfillment center.
                                    </p>
                                  </>
                                )
                            }
                          })()}
                        </div>

                        {/* Order Items & Action Buttons Grid */}
                        <div className="amazon-order-card__items-grid">
                          <div className="amazon-order-card__items-col">
                            {order.orderItems?.map((item, idx) => (
                              <div key={idx} className="amazon-order-item-row">
                                <img
                                  src={item.image || 'https://via.placeholder.com/90'}
                                  alt={item.name}
                                  className="amazon-order-item-row__img"
                                />
                                <div className="amazon-order-item-row__info">
                                  <h4 className="amazon-order-item-row__title">{item.name}</h4>
                                  <div className="amazon-order-item-row__meta">
                                    <span>Qty: {item.quantity}</span>
                                    <span>|</span>
                                    <span className="amazon-order-item-row__price">
                                      ₹{(item.price * item.quantity).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="amazon-order-item-row__actions">
                                    <button
                                      type="button"
                                      className="amazon-btn amazon-btn--yellow amazon-btn--sm"
                                      onClick={() => handleBuyAgain(item)}
                                    >
                                      <FiRepeat /> Buy it again
                                    </button>
                                    <Link to={`/shop`} className="amazon-btn amazon-btn--white amazon-btn--sm">
                                      View your item
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Right Action Column */}
                          <div className="amazon-order-card__actions-col">
                            <Link
                              to={`/track-order`}
                              className="amazon-btn amazon-btn--white amazon-btn--full amazon-order-btn"
                            >
                              Track package
                            </Link>
                            <Link
                              to={`/contact`}
                              className="amazon-btn amazon-btn--white amazon-btn--full amazon-order-btn"
                            >
                              Get product support
                            </Link>
                            <Link
                              to={`/shop`}
                              className="amazon-btn amazon-btn--white amazon-btn--full amazon-order-btn"
                            >
                              Write a product review
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  FiPackage,
  FiSearch,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiShield,
  FiArrowRight,
  FiExternalLink,
  FiCopy,
  FiCheck
} from 'react-icons/fi'
import API from '../api/axios'
import { useNotification } from '../context/NotificationContext'

function TrackOrderPage() {
  const [searchParams] = useSearchParams()
  const initialId = searchParams.get('id') || searchParams.get('trackingId') || ''

  const [trackingId, setTrackingId] = useState(initialId)
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const notify = useNotification()

  // Full Dropdash / Amazon Tracking Pipeline
  const trackingPipeline = [
    { key: 'processing', label: 'Ordered', desc: 'Order received & verified' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Dropdash supplier confirmed' },
    { key: 'dispatched', label: 'Dispatched', desc: 'Package left warehouse' },
    { key: 'in_transit', label: 'In Transit', desc: 'Moving with courier hub' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Courier out for delivery' },
    { key: 'delivered', label: 'Delivered', desc: 'Delivered to recipient' },
  ]

  const statusConfig = {
    processing: { label: 'Order Processing', step: 0, color: '#f59e0b', banner: 'Order Processing (5 - 7 Days Guaranteed Delivery)' },
    confirmed: { label: 'Order Confirmed', step: 1, color: '#007185', banner: 'Confirmed by Fulfillment Partner' },
    dispatched: { label: 'Dispatched', step: 2, color: '#007185', banner: 'Package Dispatched from Warehouse' },
    in_transit: { label: 'In Transit', step: 3, color: '#007185', banner: 'Package in Transit with Courier' },
    out_for_delivery: { label: 'Out for Delivery', step: 4, color: '#c45500', banner: 'Out for Delivery Today by 9 PM' },
    delivered: { label: 'Delivered', step: 5, color: '#067d62', banner: 'Package Delivered Successfully' },
    cancelled: { label: 'Cancelled', step: -1, color: '#b12704', banner: 'Order Cancelled' },
    returned: { label: 'Returned', step: -2, color: '#e67e22', banner: 'Return to Origin (RTO) Processed' },
  }

  // Quick lookup courier direct portal URL
  const getCourierTrackUrl = (courier, awb) => {
    if (!awb) return null
    const c = (courier || '').toLowerCase()
    if (c.includes('delhivery')) return `https://www.delhivery.com/track/package/${awb}`
    if (c.includes('blue')) return `https://www.bluedart.com/tracking?trackNumber=${awb}`
    if (c.includes('xpress')) return `https://www.xpressbees.com/shipment/tracking?awb=${awb}`
    if (c.includes('ecom')) return `https://ecomexpress.in/tracking/?awb_full_detail=${awb}`
    if (c.includes('shadowfax')) return `https://tracker.shadowfax.in/#/track/${awb}`
    if (c.includes('dtdc')) return `https://www.dtdc.in/tracking/shipment-tracking.asp`
    return null
  }

  const fetchTrackData = async (idToSearch) => {
    if (!idToSearch?.trim()) return
    setLoading(true)
    try {
      const { data } = await API.get(`/orders/track/${idToSearch.trim()}`)
      setOrderData(data)
    } catch (error) {
      notify.error(error.response?.data?.message || 'Shipment not found. Please check your Tracking ID or AWB.')
      setOrderData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialId) {
      fetchTrackData(initialId)
    }
  }, [initialId])

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchTrackData(trackingId)
  }

  const handleCopyAwb = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    notify.success('AWB Number copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const currentStatusInfo = orderData ? statusConfig[orderData.orderStatus] || statusConfig.processing : null
  const currentStep = currentStatusInfo ? currentStatusInfo.step : 0
  const courierExternalUrl = orderData ? getCourierTrackUrl(orderData.courierPartner, orderData.awbNumber) : null

  return (
    <div className="amazon-track-page">
      <div className="amazon-track__container">
        {/* Header Breadcrumb */}
        <div className="amazon-profile__breadcrumb" style={{ margin: '0 0 1.5rem' }}>
          <Link to="/">Home</Link> › <Link to="/profile">Your Orders</Link> › <span className="active">Track Package</span>
        </div>

        {/* Search Box Card */}
        <div className="amazon-track__card">
          <div className="amazon-track__header">
            <FiTruck className="amazon-track__header-icon" />
            <div>
              <h1 className="amazon-track__title">Track your package</h1>
              <p className="amazon-track__sub">
                Enter your <strong>Tracking ID</strong> (e.g. <code>TRK...</code>), <strong>Dropdash AWB</strong> (Air Waybill), or <strong>Order ID</strong>.
              </p>
            </div>
          </div>

          <form className="amazon-track__form" onSubmit={handleSubmit}>
            <div className="amazon-track__input-wrap">
              <FiSearch className="amazon-track__input-icon" />
              <input
                className="amazon-track__input"
                type="text"
                placeholder="Enter Tracking ID or AWB # (e.g. TRK12345 or 14892019)"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="amazon-btn amazon-btn--yellow amazon-track__submit-btn" disabled={loading}>
              {loading ? 'Tracking...' : 'Track Package'}
            </button>
          </form>
        </div>

        {/* Tracking Result Card */}
        {orderData && (
          <div className="amazon-track__result-card">
            {/* Status Headline Banner */}
            <div className="amazon-track__status-header">
              <div className="amazon-track__status-left">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="amazon-track__badge" style={{ background: currentStatusInfo.color }}>
                    {currentStatusInfo.label}
                  </span>
                  {orderData.courierPartner && (
                    <span className="dropdash-badge">
                      <FiTruck style={{ marginRight: '4px' }} />
                      Courier: {orderData.courierPartner}
                    </span>
                  )}
                  {orderData.dropdashOrderId && (
                    <span className="dropdash-subbadge">
                      Dropdash ID: {orderData.dropdashOrderId}
                    </span>
                  )}
                </div>

                <h2 className="amazon-track__headline">
                  {currentStatusInfo.banner}
                </h2>

                <p className="amazon-track__meta">
                  Tracking ID: <strong>{orderData.trackingId || orderData._id}</strong>
                  {orderData.awbNumber && (
                    <>
                      {' '}| Air Waybill (AWB):{' '}
                      <strong style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>{orderData.awbNumber}</strong>
                      <button
                        type="button"
                        onClick={() => handleCopyAwb(orderData.awbNumber)}
                        className="track-copy-btn"
                        title="Copy AWB Number"
                      >
                        {copied ? <FiCheck color="#067d62" /> : <FiCopy />}
                      </button>
                    </>
                  )}
                  {' '}| Placed on{' '}
                  {new Date(orderData.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="amazon-track__status-right">
                <span className="amazon-track__delivery-promise">
                  <FiClock /> 5 - 7 Days Guaranteed Delivery
                </span>
                {courierExternalUrl && (
                  <a
                    href={courierExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="track-courier-btn"
                  >
                    Track on {orderData.courierPartner} <FiExternalLink />
                  </a>
                )}
              </div>
            </div>

            {/* Stepper Progress Bar (for active orders) */}
            {orderData.orderStatus !== 'cancelled' && orderData.orderStatus !== 'returned' && (
              <div className="amazon-track__stepper">
                <div className="amazon-track__stepper-track">
                  <div
                    className="amazon-track__stepper-fill"
                    style={{ width: `${Math.min(100, (currentStep / (trackingPipeline.length - 1)) * 100)}%` }}
                  ></div>
                </div>

                <div className="amazon-track__stepper-nodes">
                  {trackingPipeline.map((pipe, idx) => {
                    const isPassed = idx <= currentStep
                    const isCurrent = idx === currentStep

                    return (
                      <div
                        key={pipe.key}
                        className={`amazon-track__node ${isPassed ? 'passed' : ''} ${isCurrent ? 'current' : ''}`}
                      >
                        <div className="amazon-track__node-circle">
                          {isPassed ? '✓' : idx + 1}
                        </div>
                        <span className="amazon-track__node-label">{pipe.label}</span>
                        <span className="amazon-track__node-desc">{pipe.desc}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Dropdash Activity Timeline (If scans or history updates exist) */}
            {orderData.trackingHistory && orderData.trackingHistory.length > 0 && (
              <div className="track-history-card">
                <h3 className="track-history-title">
                  <FiPackage /> Live Shipment Updates & Scans
                </h3>
                <div className="track-history-list">
                  {orderData.trackingHistory
                    .slice()
                    .reverse()
                    .map((item, index) => (
                      <div key={index} className="track-history-item">
                        <div className="track-history-point"></div>
                        <div className="track-history-content">
                          <div className="track-history-row">
                            <strong className="track-history-msg">{item.message}</strong>
                            <span className="track-history-time">
                              {new Date(item.timestamp).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {item.location && (
                            <span className="track-history-loc">
                              <FiMapPin /> {item.location}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Order Details & Address Grid */}
            <div className="amazon-track__details-grid">
              {/* Items List */}
              <div className="amazon-track__items-box">
                <h3 className="amazon-track__box-title">
                  Items in this shipment ({orderData.orderItems?.length || 0})
                </h3>
                <div className="amazon-track__items-list">
                  {orderData.orderItems?.map((item, idx) => (
                    <div key={idx} className="amazon-track__item-row">
                      <img
                        src={item.image || 'https://via.placeholder.com/70'}
                        alt={item.name}
                        className="amazon-track__item-img"
                      />
                      <div className="amazon-track__item-info">
                        <h4 className="amazon-track__item-name">{item.name}</h4>
                        <div className="amazon-track__item-meta">
                          <span>Qty: {item.quantity}</span>
                          <span>|</span>
                          <span className="amazon-track__item-price">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address & Summary */}
              <div className="amazon-track__info-box">
                {orderData.shippingAddress && (
                  <div className="amazon-track__address-block">
                    <h3 className="amazon-track__box-title">
                      <FiMapPin /> Delivery Address
                    </h3>
                    <p className="amazon-track__address-text">
                      <strong>{orderData.shippingAddress.fullName}</strong><br />
                      {orderData.shippingAddress.addressLine1}
                      {orderData.shippingAddress.addressLine2 && <>, {orderData.shippingAddress.addressLine2}</>}<br />
                      {orderData.shippingAddress.city}, {orderData.shippingAddress.state} - {orderData.shippingAddress.pincode}<br />
                      Phone: {orderData.shippingAddress.phone}
                    </p>
                  </div>
                )}

                <div className="amazon-track__payment-block">
                  <h3 className="amazon-track__box-title">Payment & Total</h3>
                  <p className="amazon-track__payment-text">
                    Method: <strong>{orderData.paymentInfo?.method === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment (Razorpay)'}</strong><br />
                    Total Paid: <strong>₹{orderData.totalAmount?.toLocaleString()}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Dropdash Info Help Banner */}
            <div className="dropdash-info-card">
              <div className="dropdash-info-header">
                <FiShield color="#007185" size={20} />
                <strong>Fulfillment Guarantee by Dropdash Logistics</strong>
              </div>
              <p className="dropdash-info-text">
                Your order is fulfilled and dispatched via verified Indian express courier partners (Delhivery / Blue Dart / XpressBees).
                If you have any questions or require real-time assistance with your package, reach out to our 24/7 customer support.
              </p>
            </div>

            {/* Back action */}
            <div className="amazon-track__footer">
              <button
                type="button"
                className="amazon-btn amazon-btn--white"
                onClick={() => { setOrderData(null); setTrackingId('') }}
              >
                Track another package
              </button>
              <Link to="/profile" className="amazon-btn amazon-btn--yellow">
                View all orders <FiArrowRight />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackOrderPage

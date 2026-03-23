import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiPackage, FiSearch } from 'react-icons/fi'
import API from '../api/axios'
import { useNotification } from '../context/NotificationContext'

function TrackOrderPage() {
  const [trackingId, setTrackingId] = useState('')
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(false)
  const notify = useNotification()

  const statusSteps = ['processing', 'shipped', 'delivered']
  const statusLabels = { processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' }

  const getStepIndex = (status) => {
    if (status === 'cancelled') return -1
    return statusSteps.indexOf(status)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!trackingId.trim()) return

    setLoading(true)
    try {
      const { data } = await API.get(`/orders/track/${trackingId.trim()}`)
      setOrderData(data)
    } catch (error) {
      notify.error(error.response?.data?.message || 'Order not found. Please check your tracking ID.')
      setOrderData(null)
    } finally {
      setLoading(false)
    }
  }

  const activeStep = orderData ? getStepIndex(orderData.orderStatus) : -1

  return (
    <>
      <div className="page-banner">
        <h1 className="page-banner__title">Track Your Order</h1>
        <p className="page-banner__breadcrumb">
          <Link to="/">Home</Link> / Track Order
        </p>
      </div>

      <div className="track-order">
        <div className="track-order__container">
          <div className="track-order__icon"><FiPackage /></div>
          <h2 className="track-order__title">Where's My Order?</h2>
          <p className="track-order__text">
            Enter your tracking ID to check the status of your order.
            You can find it in your order confirmation email.
          </p>

          <form className="track-order__form" onSubmit={handleSubmit}>
            <input
              className="track-order__input"
              type="text"
              placeholder="Tracking ID (e.g. FLN...)"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              required
            />
            <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
              <FiSearch /> {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>

          {orderData && (
            <div style={{
              padding: '2rem',
              background: '#f8f7f4',
              marginTop: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {orderData.orderStatus === 'cancelled' ? '❌' : '📦'}
              </div>
              <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                {orderData.orderStatus === 'cancelled'
                  ? 'Order Cancelled'
                  : `Order ${statusLabels[orderData.orderStatus]}`
                }
              </h3>
              <p style={{ color: '#6b6b6b', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                Tracking ID: <strong>{orderData.trackingId}</strong>
              </p>
              <p style={{ color: '#6b6b6b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Placed on: {new Date(orderData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>

              {orderData.orderStatus !== 'cancelled' && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  margin: '1.5rem 0'
                }}>
                  {statusSteps.map((step, i) => (
                    <div key={step} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flex: 1
                    }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: i <= activeStep ? '#c9a84c' : '#e8e8e8',
                        color: i <= activeStep ? '#000' : '#a0a0a0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {i <= activeStep ? '✓' : i + 1}
                      </div>
                      <span style={{
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: i <= activeStep ? '#1a1a1a' : '#a0a0a0',
                        fontWeight: i <= activeStep ? 600 : 400
                      }}>
                        {statusLabels[step]}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {orderData.orderItems && (
                <div style={{ textAlign: 'left', marginTop: '1rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Items:</p>
                  {orderData.orderItems.map((item, i) => (
                    <p key={i} style={{ fontSize: '0.85rem', color: '#555' }}>
                      {item.name} × {item.quantity}
                    </p>
                  ))}
                </div>
              )}

              <button
                className="btn btn--outline-dark btn--sm"
                onClick={() => { setOrderData(null); setTrackingId('') }}
                style={{ marginTop: '1.5rem' }}
              >
                Track Another Order
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default TrackOrderPage

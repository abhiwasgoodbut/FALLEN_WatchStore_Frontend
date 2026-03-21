import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiPackage, FiSearch } from 'react-icons/fi'

function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (orderId && email) {
      setSubmitted(true)
    }
  }

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
            Enter your order ID and email address to track the status of your order. 
            You can find your order ID in the confirmation email we sent you.
          </p>

          {!submitted ? (
            <form className="track-order__form" onSubmit={handleSubmit}>
              <input
                className="track-order__input"
                type="text"
                placeholder="Order ID (e.g. #CHR-2026-0001)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
              <input
                className="track-order__input"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn--primary btn--full">
                <FiSearch /> Track Order
              </button>
            </form>
          ) : (
            <div style={{
              padding: '2rem',
              background: '#f8f7f4',
              marginTop: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
              <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>Order Processing</h3>
              <p style={{ color: '#6b6b6b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Order <strong>{orderId}</strong> is currently being processed. 
                You will receive an email with tracking details once your order has been shipped.
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                margin: '1.5rem 0'
              }}>
                {['Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step, i) => (
                  <div key={step} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flex: 1
                  }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: i <= 1 ? '#c9a84c' : '#e8e8e8',
                      color: i <= 1 ? '#000' : '#a0a0a0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>
                      {i + 1}
                    </div>
                    <span style={{
                      fontSize: '0.65rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: i <= 1 ? '#1a1a1a' : '#a0a0a0',
                      fontWeight: i <= 1 ? 600 : 400
                    }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
              <button
                className="btn btn--outline-dark btn--sm"
                onClick={() => { setSubmitted(false); setOrderId(''); setEmail('') }}
                style={{ marginTop: '1rem' }}
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

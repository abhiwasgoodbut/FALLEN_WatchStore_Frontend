import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from 'react-icons/fi'

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: ''
  })
  const [sent, setSent] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 4000)
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
  }

  return (
    <>
      <div className="page-banner">
        <h1 className="page-banner__title">Contact Us</h1>
        <p className="page-banner__breadcrumb">
          <Link to="/">Home</Link> / Contact
        </p>
      </div>

      <div className="contact-page">
        <div className="contact-page__container">
          <div className="contact-page__header">
            <h2 className="contact-page__title">Get In Touch</h2>
            <p className="contact-page__subtitle">
              Need help? Our customer service team is here to assist you with any questions, 
              concerns, or feedback you may have.
            </p>
          </div>

          <div className="contact-page__grid">
            {/* Contact Info */}
            <div className="contact-info__cards">
              <div className="contact-info__card">
                <FiPhone className="contact-info__icon" />
                <div>
                  <div className="contact-info__label">Phone</div>
                  <div className="contact-info__value">+91 70163 43030</div>
                  <div style={{ fontSize: '0.8rem', color: '#a0a0a0', marginTop: '4px' }}>
                    Mon-Sat, 10:00 AM - 7:00 PM IST
                  </div>
                </div>
              </div>

              <div className="contact-info__card">
                <FiMail className="contact-info__icon" />
                <div>
                  <div className="contact-info__label">Email</div>
                  <div className="contact-info__value">support@chronox.in</div>
                  <div style={{ fontSize: '0.8rem', color: '#a0a0a0', marginTop: '4px' }}>
                    We reply within 24 hours
                  </div>
                </div>
              </div>

              <div className="contact-info__card">
                <FiMapPin className="contact-info__icon" />
                <div>
                  <div className="contact-info__label">Address</div>
                  <div className="contact-info__value">Mumbai, Maharashtra, India</div>
                </div>
              </div>

              <div className="contact-info__card">
                <FiClock className="contact-info__icon" />
                <div>
                  <div className="contact-info__label">Business Hours</div>
                  <div className="contact-info__value">Mon - Sat: 10AM - 7PM</div>
                  <div style={{ fontSize: '0.8rem', color: '#a0a0a0', marginTop: '4px' }}>
                    Sunday: Closed
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form__row">
                <input
                  className="contact-form__input"
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <input
                  className="contact-form__input"
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="contact-form__row">
                <input
                  className="contact-form__input"
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <input
                  className="contact-form__input"
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              <textarea
                className="contact-form__textarea"
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
              <button type="submit" className="btn btn--primary">
                <FiSend /> {sent ? 'Message Sent!' : 'Send Message'}
              </button>
              {sent && (
                <p style={{
                  textAlign: 'center',
                  color: '#27ae60',
                  fontSize: '0.9rem',
                  marginTop: '0.5rem'
                }}>
                  Thank you! We'll get back to you within 24 hours.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default ContactPage

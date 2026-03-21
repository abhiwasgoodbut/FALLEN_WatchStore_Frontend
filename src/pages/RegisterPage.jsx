import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'

function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    if (!agreed) {
      alert('Please agree to the Terms & Conditions')
      return
    }
    setSuccess(true)
    setTimeout(() => setSuccess(false), 4000)
  }

  return (
    <div className="auth-page">
      <div className="auth-page__bg-circle auth-page__bg-circle--1"></div>
      <div className="auth-page__bg-circle auth-page__bg-circle--2"></div>

      <button className="auth-back-btn" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back
      </button>

      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-card__logo">
          <Link to="/">
            FALLEN
          </Link>
        </div>

        <h1 className="auth-card__title">Create Account</h1>
        <p className="auth-card__subtitle">Join FALLEN and explore premium timepieces</p>

        {success && (
          <div className="auth-form__success">
            ✓ Account created successfully! Redirecting to login...
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__row">
            <div className="auth-form__group">
              <label className="auth-form__label">First Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="auth-form__input"
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', paddingLeft: '42px' }}
                />
                <FiUser style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: '#6b6b6b', fontSize: '1rem'
                }} />
              </div>
            </div>

            <div className="auth-form__group">
              <label className="auth-form__label">Last Name</label>
              <input
                className="auth-form__input"
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                required
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div className="auth-form__group">
            <label className="auth-form__label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                className="auth-form__input"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ width: '100%', paddingLeft: '42px' }}
              />
              <FiMail style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', color: '#6b6b6b', fontSize: '1rem'
              }} />
            </div>
          </div>

          <div className="auth-form__group">
            <label className="auth-form__label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <input
                className="auth-form__input"
                type="tel"
                name="phone"
                placeholder="+91 XXXXX XXXXX"
                value={formData.phone}
                onChange={handleChange}
                style={{ width: '100%', paddingLeft: '42px' }}
              />
              <FiPhone style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', color: '#6b6b6b', fontSize: '1rem'
              }} />
            </div>
          </div>

          <div className="auth-form__row">
            <div className="auth-form__group">
              <label className="auth-form__label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="auth-form__input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  style={{ width: '100%', paddingLeft: '42px' }}
                />
                <FiLock style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: '#6b6b6b', fontSize: '1rem'
                }} />
              </div>
            </div>

            <div className="auth-form__group">
              <label className="auth-form__label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="auth-form__input"
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)', color: '#6b6b6b', fontSize: '1rem',
                    background: 'none', border: 'none', cursor: 'pointer'
                  }}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
          </div>

          <div className="auth-form__options">
            <label>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              I agree to the <a href="#" style={{ marginLeft: '4px' }}>Terms & Conditions</a>
            </label>
          </div>

          <div className="auth-form__submit">
            <button type="submit" className="btn btn--primary btn--full">
              Create Account
            </button>
          </div>

          <div className="auth-form__divider">or sign up with</div>

          <div className="auth-form__social-btns">
            <button type="button" className="auth-form__social-btn">
              <FcGoogle size={18} /> Google
            </button>
          </div>
        </form>

        <div className="auth-card__footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage

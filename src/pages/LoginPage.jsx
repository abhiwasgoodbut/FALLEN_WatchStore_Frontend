import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { login, loading, googleLogin } = useAuth()
  const notify = useNotification()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(email, password)
    if (result.success) {
      notify.success('Welcome back! Logged in successfully')
      navigate('/')
    } else {
      notify.error(result.message)
    }
  }

  const handleGoogleSuccess = async (response) => {
    if (response.credential) {
      const result = await googleLogin(response.credential)
      if (result.success) {
        notify.success('Welcome back! Logged in with Google')
        navigate('/')
      } else {
        notify.error(result.message)
      }
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__bg-circle auth-page__bg-circle--1"></div>
      <div className="auth-page__bg-circle auth-page__bg-circle--2"></div>

      <button className="auth-back-btn" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back
      </button>

      <div className="auth-card">
        <div className="auth-card__logo">
          <Link to="/">
            FALLEN
          </Link>
        </div>

        <h1 className="auth-card__title">Welcome Back</h1>
        <p className="auth-card__subtitle">Sign in to your account to continue</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__group">
            <label className="auth-form__label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                className="auth-form__input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <label className="auth-form__label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="auth-form__input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', paddingLeft: '42px', paddingRight: '42px' }}
              />
              <FiLock style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', color: '#6b6b6b', fontSize: '1rem'
              }} />
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

          <div className="auth-form__options">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <a href="#">Forgot password?</a>
          </div>

          <div className="auth-form__submit">
            <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

          <div className="auth-form__divider">or continue with</div>

          <div className="auth-form__social-btns" style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => notify.error('Google Sign-In failed')}
              theme="outline"
              size="large"
              shape="pill"
            />
          </div>
        </form>

        <div className="auth-card__footer">
          Don't have an account? <Link to="/register">Create Account</Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

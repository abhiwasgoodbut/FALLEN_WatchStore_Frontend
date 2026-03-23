import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiSearch, FiHeart, FiShoppingBag, FiUser, FiX, FiGrid } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import products from '../data/products'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const { user, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
    { to: '/track-order', label: 'Track Order' },
    ...(isAdmin ? [{ to: '/admin', label: '⚙ Admin' }] : []),
  ]

  const searchResults = searchQuery.length > 1
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const handleSearchSelect = (id) => {
    setSearchOpen(false)
    setSearchQuery('')
    navigate(`/product/${id}`)
  }


  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar__container">
          <Link to="/" className="navbar__logo">
            FALLEN
          </Link>

          <div className="navbar__nav">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="navbar__icons">
            <button className="navbar__icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <FiSearch />
            </button>
            <Link to="/wishlist" className="navbar__icon-btn" aria-label="Wishlist">
              <FiHeart />
              {wishlistCount > 0 && <span className="navbar__badge">{wishlistCount}</span>}
            </Link>
            <Link to="/cart" className="navbar__icon-btn" aria-label="Cart">
              <FiShoppingBag />
              {cartCount > 0 && <span className="navbar__badge">{cartCount}</span>}
            </Link>
            {isAuthenticated ? (
              <Link to="/profile" className="navbar__icon-btn" aria-label="Profile" title={`${user.firstName}'s Profile`}>
                <FiUser />
              </Link>
            ) : (
              <Link to="/login" className="navbar__icon-btn" aria-label="Account">
                <FiUser />
              </Link>
            )}
            <button
              className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`navbar__mobile-menu ${menuOpen ? 'open' : ''}`}>
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="navbar__mobile-link"
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link to="/wishlist" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>
          Wishlist ({wishlistCount})
        </Link>
        <Link to="/cart" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>
          Cart ({cartCount})
        </Link>
        {isAuthenticated ? (
          <Link to="/profile" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>
            My Account ({user.firstName})
          </Link>
        ) : (
          <Link to="/login" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>
            Login
          </Link>
        )}
      </div>

      {/* Search Overlay */}
      <div className={`search-overlay ${searchOpen ? 'open' : ''}`}>
        <div className="search-overlay__content">
          <input
            className="search-overlay__input"
            type="text"
            placeholder="Search for watches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus={searchOpen}
          />
          <button className="search-overlay__close" onClick={() => { setSearchOpen(false); setSearchQuery('') }}>
            <FiX />
          </button>
          {searchResults.length > 0 && (
            <div className="search-overlay__results">
              {searchResults.map(product => (
                <div
                  key={product.id}
                  className="search-result-item"
                  onClick={() => handleSearchSelect(product.id)}
                >
                  <div className="search-result-item__image">
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <div className="search-result-item__name">{product.name}</div>
                    <div className="search-result-item__price">₹{product.salePrice.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Navbar

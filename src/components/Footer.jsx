import { Link } from 'react-router-dom'
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__grid">
          {/* Brand Column */}
          <div>
            <div className="footer__brand-name">
              FALLEN
            </div>
            <p className="footer__brand-text">
              Discover the finest collection of premium timepieces. Each watch in our collection is carefully curated 
              to bring you authentic luxury and unmatched craftsmanship.
            </p>
            <div className="footer__socials">
              <a href="#" className="footer__social-link" aria-label="Instagram"><FiInstagram /></a>
              <a href="#" className="footer__social-link" aria-label="Facebook"><FiFacebook /></a>
              <a href="#" className="footer__social-link" aria-label="Twitter"><FiTwitter /></a>
              <a href="#" className="footer__social-link" aria-label="YouTube"><FiYoutube /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer__heading">Quick Links</h4>
            <div className="footer__links">
              <Link to="/shop" className="footer__link">Shop All</Link>
              <Link to="/about" className="footer__link">About Us</Link>
              <Link to="/contact" className="footer__link">Contact</Link>
              <Link to="/track-order" className="footer__link">Track Order</Link>
              <Link to="/wishlist" className="footer__link">Wishlist</Link>
            </div>
          </div>

          {/* Policies */}
          <div>
            <h4 className="footer__heading">Policies</h4>
            <div className="footer__links">
              <a href="#" className="footer__link">Privacy Policy</a>
              <a href="#" className="footer__link">Refund Policy</a>
              <a href="#" className="footer__link">Shipping Policy</a>
              <a href="#" className="footer__link">Terms of Service</a>
              <a href="#" className="footer__link">COD Policy</a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer__heading">Contact Us</h4>
            <div className="footer__contact-item">
              <FiPhone className="footer__contact-icon" />
              <span>+91 70163 43030</span>
            </div>
            <div className="footer__contact-item">
              <FiMail className="footer__contact-icon" />
              <span>support@chronox.in</span>
            </div>
            <div className="footer__contact-item">
              <FiMapPin className="footer__contact-icon" />
              <span>Mumbai, Maharashtra, India</span>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          &copy; {new Date().getFullYear()} FALLEN. All Rights Reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer

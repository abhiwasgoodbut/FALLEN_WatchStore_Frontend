import { Link } from 'react-router-dom'
import { FiAward, FiShield, FiHeart, FiGlobe, FiArrowRight } from 'react-icons/fi'

function AboutPage() {
  const values = [
    {
      icon: <FiAward />,
      title: 'Authenticity Guaranteed',
      text: 'Every watch in our collection is 100% authentic. We source directly from authorized dealers and certified distributors to ensure genuine timepieces.'
    },
    {
      icon: <FiShield />,
      title: 'Quality Assurance',
      text: 'Each watch undergoes rigorous quality checks before it reaches you. Our team of horological experts inspects every detail for perfection.'
    },
    {
      icon: <FiHeart />,
      title: 'Customer First',
      text: 'Your satisfaction is our priority. From personalized recommendations to after-sales support, we ensure an exceptional experience at every step.'
    },
    {
      icon: <FiGlobe />,
      title: 'Worldwide Brands',
      text: 'Access an exclusive collection of watches from the most prestigious brands across the globe — all in one curated destination.'
    }
  ]

  const stats = [
    { number: '5,000+', label: 'Happy Customers' },
    { number: '50+', label: 'Premium Brands' },
    { number: '10,000+', label: 'Watches Delivered' },
    { number: '4.9★', label: 'Customer Rating' },
  ]

  return (
    <>
      {/* Hero */}
      <div className="about-page__hero">
        <p className="about-page__hero-label">Our Story</p>
        <h1 className="about-page__hero-title">The FALLEN Story</h1>
        <p className="about-page__hero-text">
          Born from a passion for horology, FALLEN was founded with a singular mission — 
          to make premium timepieces accessible to discerning collectors across India. 
          We believe that a watch is more than an accessory; it's a statement of character, 
          a mark of achievement, and a companion through life's greatest moments.
        </p>
      </div>

      <div className="about-page__container">
        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2rem',
          padding: '3rem 0',
          borderBottom: '1px solid #e8e8e8',
          marginBottom: '3rem',
          textAlign: 'center'
        }}>
          {stats.map(stat => (
            <div key={stat.label}>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#c9a84c',
                marginBottom: '0.5rem'
              }}>
                {stat.number}
              </div>
              <div style={{
                fontSize: '0.8rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#6b6b6b'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="section__header">
          <p className="section__label">What Drives Us</p>
          <h2 className="section__title">Our Values</h2>
        </div>
        <div className="about-page__values">
          {values.map(value => (
            <div key={value.title} className="about-value">
              <div className="about-value__icon">{value.icon}</div>
              <h3 className="about-value__title">{value.title}</h3>
              <p className="about-value__text">{value.text}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: '#f8f7f4',
          marginBottom: '3rem'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.8rem',
            marginBottom: '1rem'
          }}>
            Ready to Find Your Perfect Watch?
          </h2>
          <p style={{
            color: '#6b6b6b',
            maxWidth: '500px',
            margin: '0 auto 2rem',
            fontWeight: 300
          }}>
            Browse our curated collection and discover a timepiece that speaks to your style.
          </p>
          <Link to="/shop" className="btn btn--primary">
            Explore Collection <FiArrowRight />
          </Link>
        </div>
      </div>
    </>
  )
}

export default AboutPage

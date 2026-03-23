import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FiGrid, FiPackage, FiShoppingBag, FiUsers, FiTag, FiArrowLeft } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

function AdminLayout() {
  const { isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) navigate('/')
  }, [isAuthenticated, isAdmin])

  if (!isAuthenticated || !isAdmin) return null

  const links = [
    { to: '/admin', icon: <FiGrid />, label: 'Dashboard', end: true },
    { to: '/admin/orders', icon: <FiShoppingBag />, label: 'Orders' },
    { to: '/admin/products', icon: <FiPackage />, label: 'Products' },
    { to: '/admin/users', icon: <FiUsers />, label: 'Users' },
    { to: '/admin/coupons', icon: <FiTag />, label: 'Coupons' },
  ]

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__sidebar-header">
          <h2 className="admin__logo">FALLEN</h2>
          <span className="admin__logo-sub">Admin Panel</span>
        </div>
        <nav className="admin__nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `admin__nav-link ${isActive ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
        <button className="admin__back-btn" onClick={() => navigate('/')}>
          <FiArrowLeft /> Back to Store
        </button>
      </aside>
      <main className="admin__main">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout

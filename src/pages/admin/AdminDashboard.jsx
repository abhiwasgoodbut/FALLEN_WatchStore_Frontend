import { useState, useEffect } from 'react'
import { FiUsers, FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi'
import API from '../../api/axios'

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/admin/stats')
        setStats(data)
      } catch (e) {
        console.error('Failed to fetch stats:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div className="admin__loading">Loading dashboard...</div>
  if (!stats) return <div className="admin__loading">Failed to load dashboard</div>

  const { overview, ordersByStatus, recentOrders, lowStockProducts } = stats

  const statusMap = {}
  ordersByStatus.forEach(s => { statusMap[s._id] = s.count })

  return (
    <div className="admin-dash">
      <h1 className="admin__page-title">Dashboard</h1>

      {/* Stat Cards */}
      <div className="admin-dash__cards">
        <div className="stat-card stat-card--revenue">
          <div className="stat-card__icon"><FiDollarSign /></div>
          <div className="stat-card__info">
            <span className="stat-card__value">₹{(overview.totalRevenue || 0).toLocaleString()}</span>
            <span className="stat-card__label">Total Revenue</span>
          </div>
        </div>
        <div className="stat-card stat-card--orders">
          <div className="stat-card__icon"><FiShoppingBag /></div>
          <div className="stat-card__info">
            <span className="stat-card__value">{overview.totalOrders}</span>
            <span className="stat-card__label">Total Orders</span>
          </div>
        </div>
        <div className="stat-card stat-card--users">
          <div className="stat-card__icon"><FiUsers /></div>
          <div className="stat-card__info">
            <span className="stat-card__value">{overview.totalUsers}</span>
            <span className="stat-card__label">Total Users</span>
          </div>
        </div>
        <div className="stat-card stat-card--products">
          <div className="stat-card__icon"><FiPackage /></div>
          <div className="stat-card__info">
            <span className="stat-card__value">{overview.totalProducts}</span>
            <span className="stat-card__label">Products</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiTrendingUp /></div>
          <div className="stat-card__info">
            <span className="stat-card__value">₹{(overview.avgOrderValue || 0).toLocaleString()}</span>
            <span className="stat-card__label">Avg Order Value</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiUsers /></div>
          <div className="stat-card__info">
            <span className="stat-card__value">{overview.newUsersThisMonth}</span>
            <span className="stat-card__label">New Users (30d)</span>
          </div>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="admin-dash__row">
        <div className="admin-dash__section">
          <h3 className="admin-dash__section-title">Order Status</h3>
          <div className="admin-dash__status-grid">
            {['processing', 'shipped', 'delivered', 'cancelled'].map(st => (
              <div key={st} className={`status-pill status-pill--${st}`}>
                <span className="status-pill__count">{statusMap[st] || 0}</span>
                <span className="status-pill__label">{st}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="admin-dash__section">
          <h3 className="admin-dash__section-title"><FiAlertTriangle /> Low Stock Alerts</h3>
          {lowStockProducts.length === 0 ? (
            <p className="admin-dash__empty">All products are well-stocked ✓</p>
          ) : (
            <div className="admin-dash__list">
              {lowStockProducts.map(p => (
                <div key={p._id} className="admin-dash__list-item">
                  <span>{p.name} — <strong>{p.brand}</strong></span>
                  <span className="admin-dash__stock-badge">{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="admin-dash__section" style={{ marginTop: '1.5rem' }}>
        <h3 className="admin-dash__section-title">Recent Orders</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order._id}>
                  <td className="admin-table__mono">{order.trackingId || order._id.slice(-8)}</td>
                  <td>{order.user?.firstName} {order.user?.lastName}</td>
                  <td>₹{order.totalAmount?.toLocaleString()}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${order.orderStatus}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge--${order.paymentInfo?.status}`}>
                      {order.paymentInfo?.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

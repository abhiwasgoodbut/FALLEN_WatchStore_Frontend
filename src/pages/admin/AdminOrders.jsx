import { useState, useEffect } from 'react'
import API from '../../api/axios'
import { useNotification } from '../../context/NotificationContext'

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const notify = useNotification()

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15 }
      if (statusFilter) params.status = statusFilter
      const { data } = await API.get('/orders', { params })
      setOrders(data.orders)
      setTotal(data.total)
    } catch (e) {
      notify.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [page, statusFilter])

  const updateStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus })
      notify.success(`Order updated to: ${newStatus}`)
      fetchOrders()
    } catch (e) {
      notify.error('Failed to update status')
    }
  }

  const totalPages = Math.ceil(total / 15)

  return (
    <div>
      <div className="admin__page-header">
        <h1 className="admin__page-title">Orders ({total})</h1>
        <select className="admin__filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="admin__loading">Loading orders...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td className="admin-table__mono">{order.trackingId || order._id.slice(-8)}</td>
                  <td>{order.user?.firstName} {order.user?.lastName}</td>
                  <td>{order.orderItems?.length || 0}</td>
                  <td>₹{order.totalAmount?.toLocaleString()}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${order.paymentInfo?.status}`}>
                      {order.paymentInfo?.status}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge--${order.orderStatus}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <select
                      className="admin__inline-select"
                      value={order.orderStatus}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                    >
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="admin__pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  )
}

export default AdminOrders

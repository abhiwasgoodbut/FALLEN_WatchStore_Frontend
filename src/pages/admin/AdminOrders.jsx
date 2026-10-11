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

  const [editingOrder, setEditingOrder] = useState(null)
  const [editForm, setEditForm] = useState({
    status: '',
    awbNumber: '',
    courierPartner: 'Delhivery',
    dropdashOrderId: '',
    trackingNote: '',
    location: '',
  })

  const openLogisticsModal = (order) => {
    setEditingOrder(order)
    setEditForm({
      status: order.orderStatus || 'processing',
      awbNumber: order.awbNumber || '',
      courierPartner: order.courierPartner || 'Delhivery',
      dropdashOrderId: order.dropdashOrderId || '',
      trackingNote: '',
      location: order.shippingAddress ? `${order.shippingAddress.city}, ${order.shippingAddress.state}` : '',
    })
  }

  const handleSaveLogistics = async (e) => {
    e.preventDefault()
    if (!editingOrder) return
    try {
      await API.put(`/orders/${editingOrder._id}/status`, editForm)
      notify.success('Logistics & status updated successfully')
      setEditingOrder(null)
      fetchOrders()
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to update logistics')
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
          <option value="confirmed">Order Confirmed</option>
          <option value="dispatched">Dispatched</option>
          <option value="in_transit">In Transit</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      {loading ? (
        <div className="admin__loading">Loading orders...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tracking ID / Dropdash</th>
                <th>Customer</th>
                <th>Courier & AWB</th>
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
                  <td className="admin-table__mono">
                    <strong>{order.trackingId || order._id.slice(-8)}</strong>
                    {order.dropdashOrderId && (
                      <div style={{ fontSize: '0.72rem', color: '#007185', marginTop: '2px' }}>
                        DD: {order.dropdashOrderId}
                      </div>
                    )}
                  </td>
                  <td>{order.user?.firstName} {order.user?.lastName}</td>
                  <td>
                    <div style={{ fontSize: '0.82rem' }}>
                      <span style={{ fontWeight: 600 }}>{order.courierPartner || 'Delhivery'}</span>
                      {order.awbNumber ? (
                        <div style={{ color: '#555', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          AWB: {order.awbNumber}
                        </div>
                      ) : (
                        <div style={{ color: '#999', fontSize: '0.72rem' }}>No AWB set</div>
                      )}
                    </div>
                  </td>
                  <td>{order.orderItems?.length || 0}</td>
                  <td>₹{order.totalAmount?.toLocaleString()}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${order.paymentInfo?.status}`}>
                      {order.paymentInfo?.status}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge--${order.orderStatus}`}>
                      {order.orderStatus?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <select
                        className="admin__inline-select"
                        value={order.orderStatus}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                      >
                        <option value="processing">Processing</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="in_transit">In Transit</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => openLogisticsModal(order)}
                        style={{
                          background: '#007185',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '5px 9px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Dropdash / AWB
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dropdash & Logistics Modal */}
      {editingOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '520px',
            padding: '1.75rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f1111' }}>
                Dropdash Logistics & Tracking
              </h2>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#666' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '1.25rem' }}>
              Update shipment info from your <strong>Dropdash</strong> seller dashboard or courier partner (Delhivery, BlueDart, XpressBees).
            </p>

            <form onSubmit={handleSaveLogistics}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Order Status
                </label>
                <select
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="processing">Processing (Pending Dropdash pickup)</option>
                  <option value="confirmed">Order Confirmed</option>
                  <option value="dispatched">Dispatched / Packed</option>
                  <option value="in_transit">In Transit (With Courier)</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned / RTO</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Courier Partner
                  </label>
                  <select
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    value={editForm.courierPartner}
                    onChange={(e) => setEditForm({ ...editForm, courierPartner: e.target.value })}
                  >
                    <option value="Delhivery">Delhivery</option>
                    <option value="Blue Dart">Blue Dart</option>
                    <option value="XpressBees">XpressBees</option>
                    <option value="Ecom Express">Ecom Express</option>
                    <option value="Shadowfax">Shadowfax</option>
                    <option value="DTDC">DTDC</option>
                    <option value="Dropdash Express">Dropdash Express</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Air Waybill (AWB #)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 14285930219"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    value={editForm.awbNumber}
                    onChange={(e) => setEditForm({ ...editForm, awbNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Dropdash Order ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. DD-89304"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  value={editForm.dropdashOrderId}
                  onChange={(e) => setEditForm({ ...editForm, dropdashOrderId: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Current Hub / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gurgaon Sorting Center"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Timeline Update Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Arrived at transit hub"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    value={editForm.trackingNote}
                    onChange={(e) => setEditForm({ ...editForm, trackingNote: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    background: '#f0f2f2',
                    border: '1px solid #d5d9d9',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '4px',
                    background: '#ffd814',
                    borderColor: '#fcd200',
                    border: '1px solid #a88734',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  Save & Update Tracking
                </button>
              </div>
            </form>
          </div>
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

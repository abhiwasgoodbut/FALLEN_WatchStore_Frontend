import { useState, useEffect } from 'react'
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi'
import API from '../../api/axios'
import { useNotification } from '../../context/NotificationContext'

function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    code: '', discountType: 'percentage', discountValue: '',
    minPurchase: '', maxDiscount: '', usageLimit: '', expiresAt: '',
  })
  const notify = useNotification()

  const fetchCoupons = async () => {
    try {
      const { data } = await API.get('/admin/coupons')
      setCoupons(data)
    } catch (e) {
      notify.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCoupons() }, [])

  const resetForm = () => {
    setForm({ code: '', discountType: 'percentage', discountValue: '', minPurchase: '', maxDiscount: '', usageLimit: '', expiresAt: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, code: form.code.toUpperCase() }
      if (editingId) {
        await API.put(`/admin/coupon/${editingId}`, payload)
        notify.success('Coupon updated!')
      } else {
        await API.post('/admin/coupon', payload)
        notify.success('Coupon created!')
      }
      resetForm()
      fetchCoupons()
    } catch (e) {
      notify.error(e.response?.data?.message || 'Failed to save coupon')
    }
  }

  const handleEdit = (c) => {
    setForm({
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      minPurchase: c.minPurchase || '', maxDiscount: c.maxDiscount || '',
      usageLimit: c.usageLimit || '', expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
    })
    setEditingId(c._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return
    try {
      await API.delete(`/admin/coupon/${id}`)
      notify.success('Coupon deleted')
      fetchCoupons()
    } catch (e) {
      notify.error('Failed to delete')
    }
  }

  return (
    <div>
      <div className="admin__page-header">
        <h1 className="admin__page-title">Coupons ({coupons.length})</h1>
        <button className="btn btn--primary btn--sm" onClick={() => { resetForm(); setShowForm(!showForm) }}>
          <FiPlus /> {showForm ? 'Cancel' : 'Create Coupon'}
        </button>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form__grid">
            <input className="admin-form__input" placeholder="Coupon Code *" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required style={{ textTransform: 'uppercase' }} />
            <select className="admin-form__input" value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
            <input className="admin-form__input" type="number" placeholder="Discount Value *" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} required />
            <input className="admin-form__input" type="number" placeholder="Min Purchase (₹)" value={form.minPurchase} onChange={e => setForm({ ...form, minPurchase: e.target.value })} />
            <input className="admin-form__input" type="number" placeholder="Max Discount (₹)" value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: e.target.value })} />
            <input className="admin-form__input" type="number" placeholder="Usage Limit" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} />
            <input className="admin-form__input" type="date" placeholder="Expires At" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
          </div>
          <button className="btn btn--primary btn--sm" style={{ marginTop: '1rem' }}>
            {editingId ? 'Update Coupon' : 'Create Coupon'}
          </button>
        </form>
      )}

      {loading ? <div className="admin__loading">Loading...</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min Purchase</th>
                <th>Used</th>
                <th>Limit</th>
                <th>Expires</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => {
                const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date()
                const isActive = c.isActive && !isExpired && (!c.usageLimit || c.usedCount < c.usageLimit)
                return (
                  <tr key={c._id} style={{ opacity: isActive ? 1 : 0.5 }}>
                    <td className="admin-table__mono" style={{ fontWeight: 700 }}>{c.code}</td>
                    <td>{c.discountType === 'percentage' ? '%' : '₹'}</td>
                    <td>{c.discountValue}{c.discountType === 'percentage' ? '%' : ''}</td>
                    <td>{c.minPurchase ? `₹${c.minPurchase.toLocaleString()}` : '—'}</td>
                    <td>{c.usedCount || 0}</td>
                    <td>{c.usageLimit || '∞'}</td>
                    <td>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : 'Never'}</td>
                    <td>
                      <span className={`admin-badge admin-badge--${isActive ? 'delivered' : 'cancelled'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="admin-action-btn" onClick={() => handleEdit(c)}><FiEdit2 /></button>
                        <button className="admin-action-btn admin-action-btn--danger" onClick={() => handleDelete(c._id)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminCoupons

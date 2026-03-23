import { useState, useEffect } from 'react'
import { FiTrash2, FiShield } from 'react-icons/fi'
import API from '../../api/axios'
import { useNotification } from '../../context/NotificationContext'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const notify = useNotification()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (search) params.search = search
      const { data } = await API.get('/admin/users', { params })
      setUsers(data.users)
      setTotal(data.total)
    } catch (e) {
      notify.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [page])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    if (!confirm(`Change role to ${newRole}?`)) return
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole })
      notify.success(`Role updated to ${newRole}`)
      fetchUsers()
    } catch (e) {
      notify.error('Failed to update role')
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm('Delete this user permanently?')) return
    try {
      await API.delete(`/admin/users/${userId}`)
      notify.success('User deleted')
      fetchUsers()
    } catch (e) {
      notify.error('Failed to delete user')
    }
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div>
      <div className="admin__page-header">
        <h1 className="admin__page-title">Users ({total})</h1>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <input className="admin-form__input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '260px' }} />
          <button className="btn btn--primary btn--sm" type="submit">Search</button>
        </form>
      </div>

      {loading ? <div className="admin__loading">Loading...</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '—'}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${u.role === 'admin' ? 'delivered' : 'processing'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="admin-action-btn" onClick={() => toggleRole(u._id, u.role)} title="Toggle Role">
                        <FiShield /> {u.role === 'admin' ? 'Demote' : 'Promote'}
                      </button>
                      <button className="admin-action-btn admin-action-btn--danger" onClick={() => deleteUser(u._id)}>
                        <FiTrash2 />
                      </button>
                    </div>
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

export default AdminUsers

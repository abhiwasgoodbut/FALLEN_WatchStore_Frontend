import { useState, useEffect } from 'react'
import { FiTrash2, FiPlus, FiMinus, FiUpload, FiX } from 'react-icons/fi'
import API from '../../api/axios'
import { useNotification } from '../../context/NotificationContext'

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    name: '', brand: '', price: '', salePrice: '', category: 'luxury',
    description: '', stock: '10', isFeatured: false, isBestseller: false,
    images: [], // array of { url, public_id }
  })
  const notify = useNotification()

  const fetchProducts = async () => {
    try {
      const { data } = await API.get('/products?limit=100')
      setProducts(data.products || data)
    } catch (e) {
      notify.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const resetForm = () => {
    setForm({ name: '', brand: '', price: '', salePrice: '', category: 'luxury', description: '', stock: '10', isFeatured: false, isBestseller: false, images: [] })
    setEditingId(null)
    setShowForm(false)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const { data } = await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setForm(prev => ({
        ...prev,
        images: [...prev.images, { url: data.url, public_id: data.public_id }],
      }))
      notify.success('Image uploaded!')
    } catch (err) {
      notify.error(err.response?.data?.message || 'Image upload failed')
    } finally {
      setUploading(false)
      e.target.value = '' // reset file input
    }
  }

  const removeImage = async (index) => {
    const img = form.images[index]
    try {
      if (img.public_id) {
        await API.delete(`/upload?public_id=${img.public_id}`)
      }
    } catch (e) { /* ignore */ }
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form }
      if (editingId) {
        await API.put(`/products/${editingId}`, payload)
        notify.success('Product updated!')
      } else {
        await API.post('/products', payload)
        notify.success('Product created!')
      }
      resetForm()
      fetchProducts()
    } catch (e) {
      notify.error(e.response?.data?.message || 'Failed to save product')
    }
  }

  const handleEdit = (p) => {
    setForm({
      name: p.name, brand: p.brand, price: p.price, salePrice: p.salePrice,
      category: p.category, description: p.description || '', stock: p.stock,
      isFeatured: p.isFeatured, isBestseller: p.isBestseller,
      images: p.images || [],
    })
    setEditingId(p._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await API.delete(`/products/${id}`)
      notify.success('Product deleted')
      fetchProducts()
    } catch (e) {
      notify.error('Failed to delete')
    }
  }

  const updateStock = async (productId, newStock) => {
    if (newStock < 0) return
    try {
      await API.put(`/products/${productId}`, { stock: newStock })
      setProducts(prev => prev.map(p => p._id === productId ? { ...p, stock: newStock } : p))
    } catch (e) {
      notify.error('Failed to update stock')
    }
  }

  return (
    <div>
      <div className="admin__page-header">
        <h1 className="admin__page-title">Products ({products.length})</h1>
        <button className="btn btn--primary btn--sm" onClick={() => { resetForm(); setShowForm(!showForm) }}>
          <FiPlus /> {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form__grid">
            <input className="admin-form__input" placeholder="Product Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input className="admin-form__input" placeholder="Brand *" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} required />
            <input className="admin-form__input" type="number" placeholder="Price (MRP) *" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            <input className="admin-form__input" type="number" placeholder="Sale Price *" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} required />
            <select className="admin-form__input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="luxury">Luxury</option>
              <option value="classic">Classic</option>
              <option value="sport">Sport</option>
              <option value="smart">Smart</option>
            </select>
            <input className="admin-form__input" type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
          </div>
          <textarea className="admin-form__input" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: '100%', marginTop: '0.75rem' }} />

          {/* Image Upload */}
          <div className="admin-form__images" style={{ marginTop: '1rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
              Product Images
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {form.images.map((img, i) => (
                <div key={i} className="admin-form__image-thumb">
                  <img src={img.url} alt={`Product ${i + 1}`} />
                  <button type="button" className="admin-form__image-remove" onClick={() => removeImage(i)}>
                    <FiX />
                  </button>
                </div>
              ))}
              <label className="admin-form__image-upload">
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ display: 'none' }} />
                {uploading ? (
                  <span>Uploading...</span>
                ) : (
                  <>
                    <FiUpload />
                    <span>Upload</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem' }}>
            <label><input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} /> Featured</label>
            <label><input type="checkbox" checked={form.isBestseller} onChange={e => setForm({ ...form, isBestseller: e.target.checked })} /> Bestseller</label>
          </div>
          <button className="btn btn--primary btn--sm" type="submit" style={{ marginTop: '1rem' }}>
            {editingId ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      )}

      {loading ? <div className="admin__loading">Loading...</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Sale Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td>
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} alt={p.name} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }} />
                    ) : (
                      <div style={{ width: '45px', height: '45px', background: '#f0f0f5', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#aaa' }}>No img</div>
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.brand}</td>
                  <td><span className="admin-badge">{p.category}</span></td>
                  <td>₹{p.price?.toLocaleString()}</td>
                  <td>₹{p.salePrice?.toLocaleString()}</td>
                  <td>
                    <div className="admin-stock-control">
                      <button className="admin-stock-btn" onClick={() => updateStock(p._id, p.stock - 1)}><FiMinus /></button>
                      <span style={{ color: p.stock <= 5 ? '#e74c3c' : 'inherit', fontWeight: 600, minWidth: '28px', textAlign: 'center' }}>
                        {p.stock}
                      </span>
                      <button className="admin-stock-btn" onClick={() => updateStock(p._id, p.stock + 1)}><FiPlus /></button>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="admin-action-btn" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="admin-action-btn admin-action-btn--danger" onClick={() => handleDelete(p._id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminProducts

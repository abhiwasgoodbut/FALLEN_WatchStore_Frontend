import { useState, useEffect } from 'react'
import { FiTrash2, FiPlus, FiMinus, FiUpload, FiX, FiVideo } from 'react-icons/fi'
import API from '../../api/axios'
import { useNotification } from '../../context/NotificationContext'
import ProductVideoPlayer from '../../components/ProductVideoPlayer'

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    name: '', brand: '', price: '', salePrice: '', category: 'luxury',
    description: '', stock: '10', isFeatured: false, isBestseller: false,
    videoUrl: '',
    videoPosition: 2,
    aboutItemText: '',
    trustBadges: {
      isCodAvailable: true,
      returnPolicy: '7 Days Replacement',
      warranty: '1 Year Warranty',
      freeDelivery: true,
      topBrand: true,
      secureTransaction: true,
    },
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
    setForm({
      name: '', brand: '', price: '', salePrice: '', category: 'luxury',
      description: '', stock: '10', isFeatured: false, isBestseller: false,
      videoUrl: '', videoPosition: 2, aboutItemText: '',
      trustBadges: {
        isCodAvailable: true,
        returnPolicy: '7 Days Replacement',
        warranty: '1 Year Warranty',
        freeDelivery: true,
        topBrand: true,
        secureTransaction: true,
      },
      images: [],
    })
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
      const aboutItem = form.aboutItemText
        ? form.aboutItemText.split('\n').map(l => l.trim()).filter(Boolean)
        : []
      const payload = { ...form, aboutItem }
      delete payload.aboutItemText

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
      videoUrl: p.videoUrl || '',
      videoPosition: p.videoPosition !== undefined ? p.videoPosition : 2,
      aboutItemText: Array.isArray(p.aboutItem) ? p.aboutItem.join('\n') : '',
      trustBadges: {
        isCodAvailable: p.trustBadges?.isCodAvailable ?? true,
        returnPolicy: p.trustBadges?.returnPolicy || '7 Days Replacement',
        warranty: p.trustBadges?.warranty || '1 Year Warranty',
        freeDelivery: p.trustBadges?.freeDelivery ?? true,
        topBrand: p.trustBadges?.topBrand ?? true,
        secureTransaction: p.trustBadges?.secureTransaction ?? true,
      },
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
          <textarea className="admin-form__input" placeholder="Short Summary / Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: '100%', marginTop: '0.75rem' }} />

          {/* About this item (Amazon Bullet Points / Specifications) */}
          <div style={{ marginTop: '1rem', background: '#fdfdfd', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '10px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', color: '#1a1a1a' }}>
              <span>📝 About this item (Amazon Bullet Points / Specifications)</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 400, color: '#718096' }}>1 bullet point per line</span>
            </label>
            <textarea
              className="admin-form__input"
              placeholder={`Paste your bullet points line by line, e.g.:\n[Microfiber Material]: Soft, washable, and reusable microfiber head for effective dust trapping.\n[Adjustable Extension Pole]: Comes with multiple detachable pole sections for customizable length.\n[Easy to Use]: Lightweight design allows effortless cleaning of hard-to-reach areas.`}
              value={form.aboutItemText}
              onChange={e => setForm({ ...form, aboutItemText: e.target.value })}
              rows={6}
              style={{ width: '100%', fontFamily: 'inherit', fontSize: '0.85rem', lineHeight: '1.5' }}
            />
            <p style={{ fontSize: '0.75rem', color: '#6b6b6b', marginTop: '0.4rem', marginBottom: 0 }}>
              💡 Use <code>[Feature Name]: Feature details</code> or <code>Feature: Details</code>. The headline will automatically be bolded like Amazon!
            </p>

            {form.aboutItemText && (
              <div style={{ marginTop: '0.85rem', padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c9a84c', display: 'block', marginBottom: '0.4rem' }}>
                  Live Preview on Product Page:
                </span>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.82rem', lineHeight: '1.6', color: '#334155' }}>
                  {form.aboutItemText.split('\n').map(l => l.trim()).filter(Boolean).map((bullet, idx) => {
                    const match = bullet.match(/^\[?(.*?)\]?:\s*(.*)$/)
                    return (
                      <li key={idx} style={{ marginBottom: '4px' }}>
                        {match ? (
                          <>
                            <strong style={{ color: '#0f172a' }}>{match[1].replace(/^\[|\]$/g, '')}:</strong> {match[2]}
                          </>
                        ) : (
                          bullet
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

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

          {/* Video (Mux / Stream / MP4 URL) */}
          <div style={{ marginTop: '1rem', background: '#f9f9fb', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e5e5ea' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', color: '#1a1a1a' }}>
              <FiVideo style={{ color: '#c9a84c' }} /> Product Video (Mux Stream URL, Playback ID, or MP4)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                className="admin-form__input"
                style={{ flex: 1, margin: 0 }}
                placeholder="e.g. https://stream.mux.com/YOUR_PLAYBACK_ID.m3u8 or Mux Playback ID"
                value={form.videoUrl}
                onChange={e => setForm({ ...form, videoUrl: e.target.value })}
              />
              {form.videoUrl && (
                <button
                  type="button"
                  className="btn btn--outline-dark btn--sm"
                  onClick={() => setForm({ ...form, videoUrl: '' })}
                  style={{ padding: '8px 14px' }}
                >
                  Clear
                </button>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b6b6b', marginTop: '0.4rem', marginBottom: 0 }}>
              💡 Supports <strong>Mux Stream URLs</strong> (e.g. <code>https://stream.mux.com/XXXXX.m3u8</code>), raw <strong>Mux Playback IDs</strong>, or direct <strong>MP4</strong> video links.
            </p>

            {/* Video Position in Gallery */}
            <div style={{ marginTop: '0.9rem', paddingTop: '0.85rem', borderTop: '1px solid #e5e5ea', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a1a1a', display: 'block', marginBottom: '0.25rem' }}>
                  Video Position in Gallery:
                </label>
                <p style={{ fontSize: '0.72rem', color: '#777', margin: 0 }}>
                  Choose which thumbnail slot displays the video relative to your photos
                </p>
              </div>
              <select
                className="admin-form__input"
                style={{ width: 'auto', minWidth: '260px', padding: '7px 12px', margin: 0, fontWeight: 500 }}
                value={form.videoPosition}
                onChange={e => setForm({ ...form, videoPosition: Number(e.target.value) })}
              >
                <option value={1}>1st Item (Before all photos)</option>
                <option value={2}>2nd Item (After 1st photo — Amazon Style ⭐)</option>
                <option value={3}>3rd Item (After 2nd photo)</option>
                <option value={4}>4th Item (After 3rd photo)</option>
                <option value={99}>Last Item (At the end of all photos)</option>
              </select>
            </div>

            {form.videoUrl && (
              <div style={{ marginTop: '0.9rem', maxWidth: '420px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#c9a84c', display: 'block', marginBottom: '0.4rem' }}>
                  Live Video Preview:
                </span>
                <ProductVideoPlayer videoUrl={form.videoUrl} />
              </div>
            )}
          </div>

          {/* Amazon-Style Trust Badges & Policies */}
          <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem', color: '#0f172a' }}>
              🛡️ Amazon-Style Trust Badges & Delivery Policies
            </label>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
              Configure Pay on Delivery (COD), replacement days, warranty, and security badges.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {/* Payment / COD Option */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: '#334155' }}>
                  Payment Option (COD) *
                </label>
                <select
                  className="admin-form__input"
                  style={{ width: '100%', margin: 0, fontWeight: 500 }}
                  value={form.trustBadges.isCodAvailable ? 'cod' : 'prepaid'}
                  onChange={e => setForm({
                    ...form,
                    trustBadges: { ...form.trustBadges, isCodAvailable: e.target.value === 'cod' }
                  })}
                >
                  <option value="cod">💵 Pay on Delivery Available (COD)</option>
                  <option value="prepaid">💳 Online Payment Only (No COD)</option>
                </select>
              </div>

              {/* Replacement Policy */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: '#334155' }}>
                  Return / Replacement Policy
                </label>
                <input
                  className="admin-form__input"
                  style={{ width: '100%', margin: 0 }}
                  placeholder="e.g. 10 days Replacement"
                  value={form.trustBadges.returnPolicy}
                  onChange={e => setForm({
                    ...form,
                    trustBadges: { ...form.trustBadges, returnPolicy: e.target.value }
                  })}
                />
              </div>

              {/* Warranty */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: '#334155' }}>
                  Warranty Info
                </label>
                <input
                  className="admin-form__input"
                  style={{ width: '100%', margin: 0 }}
                  placeholder="e.g. 1 Year Warranty"
                  value={form.trustBadges.warranty}
                  onChange={e => setForm({
                    ...form,
                    trustBadges: { ...form.trustBadges, warranty: e.target.value }
                  })}
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={form.trustBadges.freeDelivery}
                  onChange={e => setForm({
                    ...form,
                    trustBadges: { ...form.trustBadges, freeDelivery: e.target.checked }
                  })}
                />
                🚚 Free Delivery Badge
              </label>

              <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={form.trustBadges.topBrand}
                  onChange={e => setForm({
                    ...form,
                    trustBadges: { ...form.trustBadges, topBrand: e.target.checked }
                  })}
                />
                🏆 Top Brand Badge
              </label>

              <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={form.trustBadges.secureTransaction}
                  onChange={e => setForm({
                    ...form,
                    trustBadges: { ...form.trustBadges, secureTransaction: e.target.checked }
                  })}
                />
                🔒 Secure Transaction Badge
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
                  <td>
                    {p.name}
                    {p.videoUrl && (
                      <span className="admin-badge" style={{ background: '#7048e8', color: '#fff', marginLeft: '6px', fontSize: '0.65rem' }}>
                        🎥 Video
                      </span>
                    )}
                  </td>
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

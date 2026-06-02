import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api'
import { Plus, Pencil, Trash2, Package, X } from 'lucide-react'
import { confirmToast } from '../utils/confirmToast'

const emptyForm = { name: '', sku: '', price: '', quantity: '', description: '' }

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'add' | 'edit'
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    getProducts().then(r => setProducts(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(emptyForm); setEditing(null); setError(''); setModal('add') }
  const openEdit = (p) => {
    setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity, description: p.description || '' })
    setEditing(p)
    setError('')
    setModal('edit')
  }
  const closeModal = () => { setModal(null); setEditing(null); setError('') }

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.name || !form.sku || !form.price || form.quantity === '') {
      setError('Please fill in all required fields.')
      return
    }
    setSaving(true)
    setError('')
    const data = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) }
    try {
      if (modal === 'add') {
        await createProduct(data)
        toast.success('Product created successfully')
      } else {
        await updateProduct(editing.id, { name: data.name, price: data.price, quantity: data.quantity, description: data.description })
        toast.success('Product updated successfully')
      }
      closeModal()
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    const confirmed = await confirmToast(`Delete product "${name}"?`);
    if (!confirmed) return
    try {
      await deleteProduct(id)
      toast.success('Product deleted')
      load()
    } catch {
      toast.error('Failed to delete product')
    }
  }

  return (
    <>
      <div className="page-header">
        <h2>Products</h2>
        <p>Manage your product catalog and inventory</p>
      </div>
      <div className="page-content">
        <div className="card">
          <div className="table-header">
            <h3>All Products ({products.length})</h3>
            <button className="btn btn-primary" onClick={openAdd}><Plus />Add Product</button>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="empty-state"><Package /><p>No products yet. Add your first product!</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td className="td-primary">{p.name}</td>
                      <td className="td-mono">{p.sku}</td>
                      <td>₹{p.price.toFixed(2)}</td>
                      <td>{p.quantity}</td>
                      <td>
                        <span className={`badge ${p.quantity === 0 ? 'badge-red' : p.quantity < 10 ? 'badge-yellow' : 'badge-green'}`}>
                          {p.quantity === 0 ? 'Out of Stock' : p.quantity < 10 ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-icon" onClick={() => openEdit(p)} title="Edit"><Pencil size={14} /></button>
                          <button className="btn btn-danger btn-icon" onClick={() => handleDelete(p.id, p.name)} title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === 'add' ? 'Add Product' : 'Edit Product'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={closeModal}><X size={16} /></button>
            </div>
            {error && <div className="alert alert-red">{error}</div>}
            <div className="form-group">
              <label>Product Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Wireless Headphones" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>SKU / Code *</label>
                <input name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. WH-001" disabled={modal === 'edit'} />
              </div>
              <div className="form-group">
                <label>Price (₹) *</label>
                <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="0.00" />
              </div>
            </div>
            <div className="form-group">
              <label>Quantity in Stock *</label>
              <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input name="description" value={form.description} onChange={handleChange} placeholder="Optional description" />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving...' : modal === 'add' ? 'Create Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

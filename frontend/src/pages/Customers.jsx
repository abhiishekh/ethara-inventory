import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getCustomers, createCustomer, deleteCustomer } from '../api'
import { Plus, Trash2, Users, X } from 'lucide-react'

const emptyForm = { full_name: '', email: '', phone: '' }

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    getCustomers().then(r => setCustomers(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openModal = () => { setForm(emptyForm); setError(''); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setError('') }

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.full_name || !form.email) {
      setError('Name and email are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await createCustomer(form)
      toast.success('Customer added successfully')
      closeModal()
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete customer "${name}"?`)) return
    try {
      await deleteCustomer(id)
      toast.success('Customer deleted')
      load()
    } catch {
      toast.error('Failed to delete customer')
    }
  }

  return (
    <>
      <div className="page-header">
        <h2>Customers</h2>
        <p>Manage your customer database</p>
      </div>
      <div className="page-content">
        <div className="card">
          <div className="table-header">
            <h3>All Customers ({customers.length})</h3>
            <button className="btn btn-primary" onClick={openModal}><Plus />Add Customer</button>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : customers.length === 0 ? (
            <div className="empty-state"><Users /><p>No customers yet. Add your first customer!</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id}>
                      <td className="td-primary">{c.full_name}</td>
                      <td>{c.email}</td>
                      <td>{c.phone || '—'}</td>
                      <td>{new Date(c.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-danger btn-icon" onClick={() => handleDelete(c.id, c.full_name)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Customer</h3>
              <button className="btn btn-ghost btn-icon" onClick={closeModal}><X size={16} /></button>
            </div>
            {error && <div className="alert alert-red">{error}</div>}
            <div className="form-group">
              <label>Full Name *</label>
              <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="e.g. Rahul Sharma" />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="rahul@example.com" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Adding...' : 'Add Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

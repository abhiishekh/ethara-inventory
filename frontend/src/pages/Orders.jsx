import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getOrders, getCustomers, getProducts, createOrder, deleteOrder } from '../api'
import { Plus, Trash2, ShoppingCart, X, Eye } from 'lucide-react'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [viewOrder, setViewOrder] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Create order form state
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }])

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([getOrders(), getCustomers(), getProducts()])
      .then(([o, c, p]) => {
        setOrders(o.data)
        setCustomers(c.data)
        setProducts(p.data)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setCustomerId('')
    setItems([{ product_id: '', quantity: 1 }])
    setError('')
    setShowCreate(true)
  }
  const closeCreate = () => { setShowCreate(false); setError('') }

  const addItem = () => setItems(i => [...i, { product_id: '', quantity: 1 }])
  const removeItem = (idx) => setItems(i => i.filter((_, j) => j !== idx))
  const updateItem = (idx, field, value) => setItems(i => i.map((item, j) => j === idx ? { ...item, [field]: value } : item))

  const calcTotal = () => {
    return items.reduce((sum, item) => {
      const p = products.find(x => x.id === parseInt(item.product_id))
      return sum + (p ? p.price * (parseInt(item.quantity) || 0) : 0)
    }, 0)
  }

  const handleCreateOrder = async () => {
    if (!customerId) { setError('Please select a customer.'); return }
    if (items.some(i => !i.product_id || !i.quantity || i.quantity < 1)) {
      setError('Please fill all order items correctly.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await createOrder({
        customer_id: parseInt(customerId),
        items: items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) })),
      })
      toast.success('Order placed successfully!')
      closeCreate()
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create order.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Cancel this order? Stock will be restored.')) return
    try {
      await deleteOrder(id)
      toast.success('Order cancelled and stock restored')
      load()
    } catch {
      toast.error('Failed to cancel order')
    }
  }

  return (
    <>
      <div className="page-header">
        <h2>Orders</h2>
        <p>Create and manage customer orders</p>
      </div>
      <div className="page-content">
        <div className="card">
          <div className="table-header">
            <h3>All Orders ({orders.length})</h3>
            <button className="btn btn-primary" onClick={openCreate}><Plus />Create Order</button>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : orders.length === 0 ? (
            <div className="empty-state"><ShoppingCart /><p>No orders yet. Create your first order!</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="td-mono">#{o.id}</td>
                      <td className="td-primary">{o.customer?.full_name || '—'}</td>
                      <td>{o.items?.length || 0} item(s)</td>
                      <td>₹{o.total_amount.toFixed(2)}</td>
                      <td><span className="badge badge-green">{o.status}</span></td>
                      <td>{new Date(o.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-icon" onClick={() => setViewOrder(o)} title="View Details"><Eye size={14} /></button>
                          <button className="btn btn-danger btn-icon" onClick={() => handleDelete(o.id)} title="Cancel Order"><Trash2 size={14} /></button>
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

      {/* Create Order Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={closeCreate}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Order</h3>
              <button className="btn btn-ghost btn-icon" onClick={closeCreate}><X size={16} /></button>
            </div>
            {error && <div className="alert alert-red">{error}</div>}
            <div className="form-group">
              <label>Customer *</label>
              <select value={customerId} onChange={e => setCustomerId(e.target.value)}>
                <option value="">Select a customer...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Order Items *</label>
              <div className="order-items-list">
                {items.map((item, idx) => (
                  <div className="order-item-row" key={idx}>
                    <div>
                      <select value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)}>
                        <option value="">Select product...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Stock: {p.quantity}) — ₹{p.price}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="number" min="1" value={item.quantity}
                        onChange={e => updateItem(idx, 'quantity', e.target.value)}
                        placeholder="Qty"
                      />
                    </div>
                    <button
                      className="btn btn-danger btn-icon"
                      onClick={() => removeItem(idx)}
                      disabled={items.length === 1}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <button className="add-item-btn" onClick={addItem}><Plus size={14} /> Add Item</button>
            </div>

            {/* Live total preview */}
            <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '12px 14px', marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Estimated Total</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>₹{calcTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeCreate}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateOrder} disabled={saving}>
                {saving ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Order Detail Modal */}
      {viewOrder && (
        <div className="modal-overlay" onClick={() => setViewOrder(null)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order #{viewOrder.id}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setViewOrder(null)}><X size={16} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: 3 }}>CUSTOMER</div>
                <div style={{ fontWeight: 600 }}>{viewOrder.customer?.full_name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{viewOrder.customer?.email}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: 3 }}>ORDER DATE</div>
                <div style={{ fontWeight: 600 }}>{new Date(viewOrder.created_at).toLocaleDateString()}</div>
                <span className="badge badge-green" style={{ marginTop: 4 }}>{viewOrder.status}</span>
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Items</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Product ID</th>
                  <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Unit Price</th>
                  <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {viewOrder.items?.map(item => (
                  <tr key={item.id}>
                    <td style={{ padding: '8px 0', fontSize: '0.85rem', borderBottom: '1px solid var(--border)', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>#{item.product_id}</td>
                    <td style={{ padding: '8px 0', fontSize: '0.85rem', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>{item.quantity}</td>
                    <td style={{ padding: '8px 0', fontSize: '0.85rem', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>₹{item.unit_price.toFixed(2)}</td>
                    <td style={{ padding: '8px 0', fontSize: '0.85rem', textAlign: 'right', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>₹{(item.quantity * item.unit_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Amount</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--green)' }}>₹{viewOrder.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

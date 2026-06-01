import { useState, useEffect } from 'react'
import { getProducts, getCustomers, getOrders } from '../api'
import { Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react'

const LOW_STOCK_THRESHOLD = 10

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, lowStock: [] })
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    Promise.all([getProducts(), getCustomers(), getOrders()])
      .then(([p, c, o]) => {
        const products = p.data
        const lowStock = products.filter(x => x.quantity < LOW_STOCK_THRESHOLD)
        setStats({ products: products.length, customers: c.data.length, orders: o.data.length, lowStock })
        setRecentOrders(o.data.slice(0, 5))
      })
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Total Products', value: stats.products, icon: Package, color: '#4f8ef7', bg: 'var(--accent-glow)' },
    { label: 'Total Customers', value: stats.customers, icon: Users, color: '#34d399', bg: 'var(--green-bg)' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: '#a78bfa', bg: 'var(--purple-bg)' },
    { label: 'Low Stock Items', value: stats.lowStock.length, icon: AlertTriangle, color: '#fbbf24', bg: 'var(--yellow-bg)' },
  ]

  if (loading) return <div className="loading"><div className="spinner" /> Loading dashboard...</div>

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your inventory and orders</p>
      </div>
      <div className="page-content">
        <div className="stat-grid">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div className="stat-card" key={label}>
              <div className="stat-icon" style={{ background: bg }}>
                <Icon style={{ color }} />
              </div>
              <div className="stat-value" style={{ color }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          {/* Recent Orders */}
          <div className="card">
            <div className="table-header">
              <h3>Recent Orders</h3>
            </div>
            {recentOrders.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <ShoppingCart />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id}>
                        <td className="td-mono">#{order.id}</td>
                        <td className="td-primary">{order.customer?.full_name || '—'}</td>
                        <td>₹{order.total_amount.toFixed(2)}</td>
                        <td><span className="badge badge-green">{order.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Low Stock */}
          <div className="card">
            <div className="table-header">
              <h3>Low Stock Alert <span className="badge badge-yellow" style={{ marginLeft: 8 }}>{stats.lowStock.length}</span></h3>
            </div>
            {stats.lowStock.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <Package />
                <p>All products are well stocked</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.lowStock.map(p => (
                      <tr key={p.id}>
                        <td className="td-primary">{p.name}</td>
                        <td className="td-mono">{p.sku}</td>
                        <td>
                          <span className={`badge ${p.quantity === 0 ? 'badge-red' : 'badge-yellow'}`}>
                            {p.quantity} left
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

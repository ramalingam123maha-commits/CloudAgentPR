import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, ShoppingCart, Package, Users, TrendingUp } from 'lucide-react'
import api from '../../api/axios'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch(() => setStats({
        totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0,
        recentOrders: [], monthlyRevenue: []
      }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const statCards = [
    { label: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, bg: 'bg-blue-500', light: 'bg-blue-50 text-blue-700' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, bg: 'bg-purple-500', light: 'bg-purple-50 text-purple-700' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: Package, bg: 'bg-amber-500', light: 'bg-amber-50 text-amber-700' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, bg: 'bg-green-500', light: 'bg-green-50 text-green-700' },
  ]

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const monthly = stats?.monthlyRevenue?.slice(0, 6) || [0, 0, 0, 0, 0, 0]
  const maxRev = Math.max(...monthly, 1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, Admin</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/products" className="btn-primary text-sm">Manage Products</Link>
          <Link to="/admin/orders" className="btn-secondary text-sm">Manage Orders</Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map(({ label, value, icon: Icon, bg }) => (
          <div key={label} className="card p-6 flex items-center gap-4">
            <div className={`${bg} p-3 rounded-xl`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center gap-2 mb-6 font-bold text-gray-800">
            <TrendingUp className="w-5 h-5 text-primary-600" /> Monthly Revenue (Last 6 Months)
          </div>
          <div className="flex items-end gap-3 h-40">
            {monthly.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">${val > 999 ? `${(val / 1000).toFixed(1)}k` : val}</span>
                <div
                  className="w-full bg-primary-500 rounded-t-md transition-all duration-500"
                  style={{ height: `${Math.max(4, (val / maxRev) * 128)}px` }}
                />
                <span className="text-xs text-gray-400">{monthLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {(stats?.recentOrders || []).length === 0 ? (
            <p className="text-gray-400 text-sm">No recent orders.</p>
          ) : (
            <div className="space-y-3">
              {(stats?.recentOrders || []).slice(0, 5).map((order) => (
                <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-xs font-mono text-gray-600">{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{order.user?.name || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">${order.totalPrice?.toFixed(2)}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${order.isPaid ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

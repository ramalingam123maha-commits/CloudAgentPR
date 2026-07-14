import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', password: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  useEffect(() => {
    api.get('/orders/myorders')
      .then((res) => setOrders(res.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password && form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setSaving(true)
    try {
      const payload = { name: form.name, email: form.email }
      if (form.password) payload.password = form.password
      const { data } = await api.put('/users/profile', payload)
      updateUser(data)
      toast.success('Profile updated!')
      setForm({ ...form, password: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Update Profile */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4 font-bold text-gray-800">
            <User className="w-5 h-5 text-primary-600" /> Edit Profile
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="password" name="password" value={form.password} onChange={handleChange} className="input-field" placeholder="Leave blank to keep current" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="input-field" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Orders */}
        <div className="md:col-span-2 card p-6">
          <div className="flex items-center gap-2 mb-4 font-bold text-gray-800">
            <Package className="w-5 h-5 text-primary-600" /> Recent Orders
          </div>
          {loadingOrders ? (
            <p className="text-gray-500 text-sm">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-500 text-sm">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-2 font-medium">Order</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Total</th>
                    <th className="pb-2 font-medium">Paid</th>
                    <th className="pb-2 font-medium">Delivered</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 6).map((order) => (
                    <tr key={order._id} className="border-b border-gray-50">
                      <td className="py-2 font-mono text-xs">{order._id.slice(-8).toUpperCase()}</td>
                      <td className="py-2 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 font-semibold">${order.totalPrice?.toFixed(2)}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {order.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {order.isDelivered ? 'Delivered' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-2">
                        <Link to={`/orders/${order._id}`} className="text-primary-600 hover:underline text-xs">Details</Link>
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
  )
}

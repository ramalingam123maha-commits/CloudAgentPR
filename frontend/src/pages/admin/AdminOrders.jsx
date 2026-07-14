import { useEffect, useState } from 'react'
import { ShoppingCart, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const TABS = ['All', 'Pending', 'Paid', 'Delivered']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('All')

  const fetchOrders = () => {
    setLoading(true)
    api.get('/orders/admin/all')
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : res.data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [])

  const handleDeliver = async (id) => {
    try {
      await api.put(`/orders/${id}/deliver`)
      toast.success('Marked as delivered!')
      fetchOrders()
    } catch {
      toast.error('Failed to update')
    }
  }

  const filtered = orders.filter((o) => {
    if (tab === 'Paid') return o.isPaid && !o.isDelivered
    if (tab === 'Delivered') return o.isDelivered
    if (tab === 'Pending') return !o.isPaid
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-8">
        <ShoppingCart className="w-7 h-7 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">All Orders</h1>
        <span className="ml-2 bg-gray-100 text-gray-700 text-sm px-2 py-0.5 rounded-full">{orders.length}</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order ID', 'User', 'Date', 'Total', 'Paid', 'Delivered', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No orders found</td></tr>
              ) : filtered.map((order) => (
                <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{order._id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3 text-gray-700">{order.user?.name || order.user || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-bold">${order.totalPrice?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {order.isDelivered ? 'Delivered' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {!order.isDelivered && (
                      <button onClick={() => handleDeliver(order._id)} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Deliver
                      </button>
                    )}
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

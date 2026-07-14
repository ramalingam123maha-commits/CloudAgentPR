import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Package, MapPin, CreditCard, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  const fetchOrder = () => {
    setLoading(true)
    api.get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrder() }, [id])

  const handleMarkPaid = async () => {
    setPaying(true)
    try {
      await api.put(`/orders/${id}/pay`, {
        id: `DEMO_${Date.now()}`, status: 'COMPLETED', update_time: new Date().toISOString(), payer: { email_address: 'demo@example.com' }
      })
      toast.success('Order marked as paid!')
      fetchOrder()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update payment')
    } finally {
      setPaying(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found.</div>

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-6 h-6 text-primary-600" />
          Order #{order._id.slice(-8).toUpperCase()}
        </h1>
        <Link to="/orders" className="text-sm text-primary-600 hover:underline">← Back to Orders</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items + Shipping + Payment */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order Items */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-800 mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.orderItems?.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <img src={item.image || 'https://via.placeholder.com/56'} alt={item.name} className="w-14 h-14 object-cover rounded-lg" onError={(e) => { e.target.src = 'https://via.placeholder.com/56' }} />
                  <Link to={`/products/${item.product}`} className="flex-1 text-sm font-medium text-gray-700 hover:text-primary-600">{item.name}</Link>
                  <span className="text-sm text-gray-500">{item.qty} × ${item.price?.toFixed(2)}</span>
                  <span className="font-bold text-sm">${(item.qty * item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-2 font-bold text-gray-800">
              <MapPin className="w-4 h-4 text-primary-600" /> Shipping Address
            </div>
            <p className="text-gray-600 text-sm">{order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}</p>
            <div className="mt-2">
              {order.isDelivered ? (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Delivered on {new Date(order.deliveredAt).toLocaleDateString()}</span>
              ) : (
                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">Not Delivered</span>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-2 font-bold text-gray-800">
              <CreditCard className="w-4 h-4 text-primary-600" /> Payment
            </div>
            <p className="text-gray-600 text-sm">Method: <span className="font-medium">{order.paymentMethod}</span></p>
            <div className="mt-2">
              {order.isPaid ? (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Paid on {new Date(order.paidAt).toLocaleDateString()}</span>
              ) : (
                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">Not Paid</span>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit">
          <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Items</span><span>${order.itemsPrice?.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : `$${order.shippingPrice?.toFixed(2)}`}</span></div>
            <div className="flex justify-between text-gray-600"><span>Tax</span><span>${order.taxPrice?.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-2 mt-2"><span>Total</span><span>${order.totalPrice?.toFixed(2)}</span></div>
          </div>

          {!order.isPaid && (
            <button onClick={handleMarkPaid} disabled={paying} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" /> {paying ? 'Processing...' : 'Mark as Paid (Demo)'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

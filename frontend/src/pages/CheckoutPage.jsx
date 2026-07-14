import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, CreditCard, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useCart } from '../context/CartContext'

const STEPS = ['Shipping', 'Payment', 'Review']

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cartItems, cartTotal, clearCart } = useCart()
  const [step, setStep] = useState(0)
  const [shipping, setShipping] = useState({ address: '', city: '', postalCode: '', country: '' })
  const [paymentMethod, setPaymentMethod] = useState('Credit Card')
  const [placing, setPlacing] = useState(false)

  const shipping_cost = cartTotal >= 100 ? 0 : 10
  const tax = +(cartTotal * 0.15).toFixed(2)
  const total = +(cartTotal + shipping_cost + tax).toFixed(2)

  const handleShippingSubmit = (e) => {
    e.preventDefault()
    setStep(1)
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    setStep(2)
  }

  const handlePlaceOrder = async () => {
    setPlacing(true)
    try {
      const { data } = await api.post('/orders', {
        orderItems: cartItems.map((i) => ({
          name: i.name, qty: i.qty, image: i.image, price: i.price, product: i._id
        })),
        shippingAddress: shipping,
        paymentMethod,
        itemsPrice: cartTotal,
        shippingPrice: shipping_cost,
        taxPrice: tax,
        totalPrice: total,
      })
      clearCart()
      toast.success('Order placed successfully!')
      navigate(`/orders/${data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Step Indicator */}
      <div className="flex items-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm transition-colors ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
            </div>
            <span className={`ml-2 text-sm font-medium ${i === step ? 'text-primary-600' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 0: Shipping */}
      {step === 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4 font-bold text-gray-800">
            <MapPin className="w-5 h-5 text-primary-600" /> Shipping Address
          </div>
          <form onSubmit={handleShippingSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} className="input-field" placeholder="123 Main St" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input type="text" value={shipping.postalCode} onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })} className="input-field" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input type="text" value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })} className="input-field" required />
            </div>
            <button type="submit" className="btn-primary w-full py-3">Continue to Payment</button>
          </form>
        </div>
      )}

      {/* Step 1: Payment */}
      {step === 1 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4 font-bold text-gray-800">
            <CreditCard className="w-5 h-5 text-primary-600" /> Payment Method
          </div>
          <form onSubmit={handlePaymentSubmit} className="space-y-3">
            {['Credit Card', 'PayPal', 'Cash on Delivery'].map((method) => (
              <label key={method} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === method ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="text-primary-600" />
                <span className="font-medium text-gray-700">{method}</span>
              </label>
            ))}
            <div className="flex gap-3 mt-4">
              <button type="button" onClick={() => setStep(0)} className="btn-secondary flex-1 py-3">Back</button>
              <button type="submit" className="btn-primary flex-1 py-3">Review Order</button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="font-bold text-gray-800 mb-3">Order Items</h3>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <img src={item.image || 'https://via.placeholder.com/48'} alt={item.name} className="w-12 h-12 object-cover rounded-lg" onError={(e) => { e.target.src = 'https://via.placeholder.com/48' }} />
                  <span className="flex-1 text-sm text-gray-700">{item.name} × {item.qty}</span>
                  <span className="font-semibold text-sm">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Shipping Address</h3>
              <p className="text-gray-600">{shipping.address}, {shipping.city}, {shipping.postalCode}, {shipping.country}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Payment Method</h3>
              <p className="text-gray-600">{paymentMethod}</p>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-gray-800 mb-3">Price Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{shipping_cost === 0 ? 'Free' : `$${shipping_cost.toFixed(2)}`}</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax (15%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-lg text-gray-900 border-t border-gray-100 pt-2 mt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">Back</button>
            <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary flex-1 py-3 text-base font-bold">
              {placing ? 'Placing Order...' : '🎉 Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

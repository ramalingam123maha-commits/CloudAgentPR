import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, cartTotal, cartCount } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const shipping = cartTotal >= 100 ? 0 : cartItems.length > 0 ? 10 : 0
  const tax = +(cartTotal * 0.15).toFixed(2)
  const total = +(cartTotal + shipping + tax).toFixed(2)

  const handleCheckout = () => {
    if (!user) navigate('/login?redirect=checkout')
    else navigate('/checkout')
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-primary">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item._id} className="card p-4 flex gap-4 items-center">
              <img
                src={item.image || 'https://via.placeholder.com/80'}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg shrink-0"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/80' }}
              />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item._id}`} className="font-semibold text-gray-800 hover:text-primary-600 line-clamp-1">{item.name}</Link>
                <p className="text-gray-500 text-sm mt-0.5">${item.price?.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateQty(item._id, item.qty - 1)}
                  disabled={item.qty <= 1}
                  className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center font-medium">{item.qty}</span>
                <button
                  onClick={() => updateQty(item._id, item.qty + 1)}
                  disabled={item.qty >= item.countInStock}
                  className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-gray-900">${(item.price * item.qty).toFixed(2)}</div>
                <button onClick={() => removeFromCart(item._id)} className="text-red-400 hover:text-red-600 mt-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <Link to="/products" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium mt-2">
            ← Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="card p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated Shipping</span>
              <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated Tax (15%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-gray-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          {cartTotal < 100 && (
            <p className="text-xs text-gray-400 mt-2">Add ${(100 - cartTotal).toFixed(2)} more for free shipping!</p>
          )}
          <button
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
            className="btn-primary w-full mt-6 py-3 text-base"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  )
}

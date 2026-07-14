import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, Star, Headphones, Shirt, BookOpen, Home } from 'lucide-react'
import api from '../api/axios'
import ProductCard from '../components/common/ProductCard'
import LoadingSpinner from '../components/common/LoadingSpinner'

const CATEGORIES = [
  { name: 'Electronics', icon: <Headphones className="w-8 h-8" />, color: 'bg-blue-50 text-blue-600', link: '/products?category=Electronics' },
  { name: 'Clothing', icon: <Shirt className="w-8 h-8" />, color: 'bg-purple-50 text-purple-600', link: '/products?category=Clothing' },
  { name: 'Books', icon: <BookOpen className="w-8 h-8" />, color: 'bg-green-50 text-green-600', link: '/products?category=Books' },
  { name: 'Home & Garden', icon: <Home className="w-8 h-8" />, color: 'bg-orange-50 text-orange-600', link: '/products?category=Home%20%26%20Garden' },
]

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/products?limit=8')
      .then((res) => setProducts(res.data.products || res.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <ShoppingBag className="w-14 h-14 text-primary-200" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Discover Amazing Products
          </h1>
          <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Shop the latest trends and best deals across thousands of products, delivered right to your door.
          </p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors text-lg">
            Shop Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={cat.link}
              className={`card flex flex-col items-center justify-center gap-3 py-8 hover:shadow-md transition-shadow cursor-pointer ${cat.color}`}
            >
              {cat.icon}
              <span className="font-semibold text-sm">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* Stats */}
      <section className="bg-primary-600 text-white py-14">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { value: '10k+', label: 'Products' },
            { value: '50k+', label: 'Happy Customers' },
            { value: '24/7', label: 'Support' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-extrabold mb-1">{s.value}</div>
              <div className="text-primary-200 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

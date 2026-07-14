import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import StarRating from './StarRating'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    if (product.countInStock === 0) return
    addToCart(product, 1)
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <div className="card group hover:shadow-md transition-shadow duration-300 flex flex-col">
      <Link to={`/products/${product._id}`} className="block overflow-hidden">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image || 'https://via.placeholder.com/300'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/300' }}
          />
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        {product.category && (
          <span className="inline-block text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full mb-2 w-fit">
            {product.category}
          </span>
        )}

        <Link to={`/products/${product._id}`} className="mb-1">
          <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mb-2">
          <StarRating value={product.rating} numReviews={product.numReviews} />
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-gray-900">${product.price?.toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            disabled={product.countInStock === 0}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
          >
            <ShoppingCart className="w-3 h-3" />
            {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

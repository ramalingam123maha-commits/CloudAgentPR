import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShoppingCart, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import StarRating from '../components/common/StarRating'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const fetchProduct = () => {
    setLoading(true)
    api.get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProduct() }, [id])

  const handleAddToCart = () => {
    addToCart(product, qty)
    toast.success(`${product.name} added to cart!`)
    navigate('/cart')
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setSubmittingReview(true)
    try {
      await api.post(`/products/${id}/reviews`, { rating: reviewRating, comment: reviewComment })
      toast.success('Review submitted!')
      setReviewComment('')
      fetchProduct()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const alreadyReviewed = product?.reviews?.some((r) => r.user === user?._id)

  if (loading) return <LoadingSpinner />
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found.</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
        {/* Image */}
        <div className="card overflow-hidden">
          <img
            src={product.image || 'https://via.placeholder.com/500'}
            alt={product.name}
            className="w-full aspect-square object-cover"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/500' }}
          />
        </div>

        {/* Details */}
        <div>
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{product.category}</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-1">{product.name}</h1>
          <p className="text-gray-500 text-sm mb-3">Brand: <span className="font-medium text-gray-700">{product.brand}</span></p>
          <div className="mb-4">
            <StarRating value={product.rating} numReviews={product.numReviews} />
          </div>
          <div className="text-4xl font-extrabold text-gray-900 mb-4">${product.price?.toFixed(2)}</div>

          <div className="mb-4">
            <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${product.countInStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {product.countInStock > 0 ? `In Stock (${product.countInStock})` : 'Out of Stock'}
            </span>
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

          {product.countInStock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold transition-colors">−</button>
                <span className="px-4 py-2 text-gray-900 font-medium">{qty}</span>
                <button onClick={() => setQty(Math.min(product.countInStock, qty + 1))} className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold transition-colors">+</button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary flex items-center gap-2 flex-1 justify-center py-3">
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="max-w-3xl">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
        {product.reviews?.length === 0 ? (
          <p className="text-gray-500 mb-6">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4 mb-8">
            {product.reviews?.map((review) => (
              <div key={review._id} className="card p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-800">{review.name}</span>
                  <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="mb-2"><StarRating value={review.rating} /></div>
                <p className="text-gray-600 text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Review Form */}
        {user ? (
          alreadyReviewed ? (
            <div className="card p-4 bg-blue-50 border-blue-100 text-blue-700 text-sm">You have already reviewed this product.</div>
          ) : (
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="input-field"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Share your experience..."
                    required
                  />
                </div>
                <button type="submit" disabled={submittingReview} className="btn-primary w-full">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )
        ) : (
          <div className="card p-4 text-center text-gray-600 text-sm">
            Please <a href="/login" className="text-primary-600 hover:underline">login</a> to write a review.
          </div>
        )}
      </div>
    </div>
  )
}

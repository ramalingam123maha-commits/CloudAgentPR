import { Star } from 'lucide-react'

export default function StarRating({ value = 0, numReviews = 0 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value >= star
        const half = !filled && value >= star - 0.5
        return (
          <span key={star} className="relative inline-block">
            <Star className="w-4 h-4 text-gray-200" fill="currentColor" />
            {(filled || half) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? '100%' : '50%' }}
              >
                <Star className="w-4 h-4 text-accent-500" fill="currentColor" />
              </span>
            )}
          </span>
        )
      })}
      {numReviews !== undefined && (
        <span className="text-xs text-gray-500 ml-1">({numReviews})</span>
      )}
    </div>
  )
}

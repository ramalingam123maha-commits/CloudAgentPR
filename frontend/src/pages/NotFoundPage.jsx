import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-9xl mb-6">🔍</div>
      <h1 className="text-6xl font-extrabold text-gray-800 mb-3">404</h1>
      <p className="text-2xl font-semibold text-gray-600 mb-2">Page Not Found</p>
      <p className="text-gray-400 mb-8 max-w-sm">Oops! The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
        <Home className="w-5 h-5" /> Go Home
      </Link>
    </div>
  )
}

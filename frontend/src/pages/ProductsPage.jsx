import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import api from '../api/axios'
import ProductCard from '../components/common/ProductCard'
import Pagination from '../components/common/Pagination'
import LoadingSpinner from '../components/common/LoadingSpinner'

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home & Garden']

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const [pages, setPages] = useState(1)
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [searchInput, setSearchInput] = useState(searchParams.get('keyword') || '')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', page)
    if (keyword) params.set('keyword', keyword)
    if (category && category !== 'All') params.set('category', category)

    api.get(`/products?${params.toString()}`)
      .then((res) => {
        setProducts(res.data.products || res.data || [])
        setPages(res.data.pages || 1)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [page, keyword, category])

  const handleSearch = (e) => {
    e.preventDefault()
    setKeyword(searchInput)
    setPage(1)
  }

  const handleCategory = (cat) => {
    setCategory(cat)
    setPage(1)
  }

  const handlePageChange = (p) => setPage(p)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Products</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-56 shrink-0">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4 font-semibold text-gray-700">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</p>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategory(cat)}
                  className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm mb-0.5 transition-colors ${
                    category === cat
                      ? 'bg-primary-600 text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="input-field pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <button type="submit" className="btn-primary">Search</button>
          </form>

          {loading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No products found.</p>
              <button onClick={() => { setKeyword(''); setSearchInput(''); setCategory('All'); setPage(1) }} className="mt-4 btn-secondary text-sm">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              <Pagination page={page} pages={pages} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'

const EMPTY_FORM = { name: '', brand: '', category: '', description: '', price: '', countInStock: '', image: '' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const fetchProducts = () => {
    setLoading(true)
    api.get(`/products?page=${page}&pageSize=10`)
      .then((res) => {
        setProducts(res.data.products || res.data)
        setPages(res.data.pages || 1)
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [page])

  const openCreate = () => {
    setEditForm(EMPTY_FORM)
    setEditId(null)
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditForm({
      name: product.name || '',
      brand: product.brand || '',
      category: product.category || '',
      description: product.description || '',
      price: product.price || '',
      countInStock: product.countInStock || '',
      image: product.image || '',
    })
    setEditId(product._id)
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editId) {
        await api.put(`/products/${editId}`, editForm)
        toast.success('Product updated!')
      } else {
        await api.post('/products', editForm)
        toast.success('Product created!')
      }
      setModalOpen(false)
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${deleteId}`)
      toast.success('Product deleted')
      setDeleteId(null)
      fetchProducts()
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Product
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="card overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Image', 'Name', 'Brand', 'Category', 'Price', 'Stock', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img src={p.image || 'https://via.placeholder.com/40'} alt={p.name} className="w-10 h-10 object-cover rounded-lg" onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }} />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.brand}</td>
                    <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{p.category}</span></td>
                    <td className="px-4 py-3 font-bold">${p.price?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${p.countInStock > 0 ? 'text-green-600' : 'text-red-500'}`}>{p.countInStock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(p._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </>
      )}

      {/* Edit/Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg">{editId ? 'Edit Product' : 'Create Product'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {[
                { label: 'Name', key: 'name', type: 'text', required: true },
                { label: 'Brand', key: 'brand', type: 'text' },
                { label: 'Image URL', key: 'image', type: 'text' },
                { label: 'Price', key: 'price', type: 'number', step: '0.01', required: true },
                { label: 'Stock', key: 'countInStock', type: 'number', required: true },
              ].map(({ label, key, ...rest }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input {...rest} value={editForm[key]} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} className="input-field" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="input-field">
                  <option value="">Select category</option>
                  {['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Other'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="input-field resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete Product?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

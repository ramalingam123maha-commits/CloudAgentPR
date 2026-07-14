import { useEffect, useState } from 'react'
import { Users, Shield, ShieldOff, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)

  const fetchUsers = () => {
    setLoading(true)
    api.get('/users/admin/all')
      .then((res) => setUsers(Array.isArray(res.data) ? res.data : res.data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const toggleAdmin = async (user) => {
    try {
      await api.put(`/users/admin/${user._id}`, { isAdmin: !user.isAdmin })
      toast.success(`${user.name} is ${!user.isAdmin ? 'now an admin' : 'no longer an admin'}`)
      fetchUsers()
    } catch {
      toast.error('Failed to update user')
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/users/admin/${deleteId}`)
      toast.success('User deleted')
      setDeleteId(null)
      fetchUsers()
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Users className="w-7 h-7 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <span className="ml-2 bg-gray-100 text-gray-700 text-sm px-2 py-0.5 rounded-full">{users.length}</span>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name', 'Email', 'Role', 'Registered', 'Toggle Admin', 'Delete'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No users found</td></tr>
              ) : users.map((user) => (
                <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleAdmin(user)} className={`flex items-center gap-1 text-xs font-medium transition-colors ${user.isAdmin ? 'text-orange-500 hover:text-orange-700' : 'text-purple-600 hover:text-purple-700'}`}>
                      {user.isAdmin ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                      {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDeleteId(user._id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete User?</h3>
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

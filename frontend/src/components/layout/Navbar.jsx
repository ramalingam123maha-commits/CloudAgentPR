import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, ShoppingCart, User, Menu, X, ChevronDown, LayoutDashboard, LogOut, Package, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [keyword, setKeyword] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (keyword.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(keyword.trim())}`)
      setKeyword('')
    } else {
      navigate('/products')
    }
  }

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-primary-600 font-bold text-xl">
            <ShoppingBag className="w-6 h-6" />
            <span>ShopNow</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Home</Link>
            <Link to="/products" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Products</Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs mx-6">
            <div className="relative w-full">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search products..."
                className="input-field pr-10 py-1.5 text-sm"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-4">
            {/* Cart */}
            <Link to="/cart" className="relative text-gray-600 hover:text-primary-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm">{user.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    {user.isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium text-sm transition-colors">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <Link to="/cart" className="relative text-gray-600">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-600">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-2">
            <form onSubmit={handleSearch} className="flex items-center mb-3">
              <div className="relative w-full">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search products..."
                  className="input-field pr-10 py-1.5 text-sm"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>
            <Link to="/" onClick={() => setMenuOpen(false)} className="block px-2 py-1.5 text-gray-700 hover:text-primary-600 font-medium">Home</Link>
            <Link to="/products" onClick={() => setMenuOpen(false)} className="block px-2 py-1.5 text-gray-700 hover:text-primary-600 font-medium">Products</Link>
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-2 py-1.5 text-gray-700">Profile</Link>
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="block px-2 py-1.5 text-gray-700">My Orders</Link>
                {user.isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-2 py-1.5 text-gray-700">Admin</Link>}
                <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="block px-2 py-1.5 text-red-600 font-medium w-full text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-2 py-1.5 text-gray-700">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-2 py-1.5 text-gray-700">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

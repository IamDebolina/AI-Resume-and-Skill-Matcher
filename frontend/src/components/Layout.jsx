import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Layout({ children, title }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4">
        <h2 className="text-lg font-bold mb-6">AI Recruitment</h2>
        <nav className="space-y-1">
          <Link
            to="/dashboard"
            className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Dashboard
          </Link>
          <Link
            to="/match"
            className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Job Matching
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Admin
            </Link>
          )}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b dark:border-gray-700 flex items-center justify-between px-6 bg-white dark:bg-gray-800">
          <h1 className="text-xl font-semibold">{title}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">{user?.name}</span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

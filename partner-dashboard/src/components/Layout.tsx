import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { partnerApi } from '../lib/partner-api'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await partnerApi.post('/api/partner/logout')
    } finally {
      localStorage.removeItem('partnerToken')
      localStorage.removeItem('partner')
    }
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex h-screen bg-light">
      {/* Sidebar */}
      <aside className="w-64 bg-dark text-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">CapiLoop</h1>
          <p className="text-sm text-gray-400">Portal de Parceiros</p>
        </div>

        <nav className="mt-8">
          <Link
            to="/dashboard"
            className={`block px-6 py-3 transition-colors ${
              isActive('/dashboard') ? 'bg-primary text-dark font-semibold' : 'text-gray-300 hover:bg-dark/50'
            }`}
          >
            📊 Dashboard
          </Link>
          <Link
            to="/bags"
            className={`block px-6 py-3 transition-colors ${
              isActive('/bags') ? 'bg-primary text-dark font-semibold' : 'text-gray-300 hover:bg-dark/50'
            }`}
          >
            🛍️ Minhas Sacolas
          </Link>
          <Link
            to="/reservations"
            className={`block px-6 py-3 transition-colors ${
              isActive('/reservations') ? 'bg-primary text-dark font-semibold' : 'text-gray-300 hover:bg-dark/50'
            }`}
          >
            📋 Reservas do dia
          </Link>
          <Link
            to="/pickup"
            className={`block px-6 py-3 transition-colors ${
              isActive('/pickup') ? 'bg-primary text-dark font-semibold' : 'text-gray-300 hover:bg-dark/50'
            }`}
          >
            ✓ Confirmar retirada
          </Link>
          <Link
            to="/settings"
            className={`block px-6 py-3 transition-colors ${
              isActive('/settings') ? 'bg-primary text-dark font-semibold' : 'text-gray-300 hover:bg-dark/50'
            }`}
          >
            ⚙️ Configurações
          </Link>
        </nav>

        <button
          onClick={() => void handleLogout()}
          className="w-full mt-auto px-6 py-3 text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-colors text-left"
        >
          🚪 Sair
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import BagsPage from './pages/BagsPage'
import SettingsPage from './pages/SettingsPage'
import PickupPage from './pages/PickupPage'
import ReservationsPage from './pages/ReservationsPage'
import { partnerApi } from './lib/partner-api'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const validateSession = async () => {
      try {
        if (!localStorage.getItem('partnerToken')) return
        await partnerApi.get('/api/partner/me')
        setIsAuthenticated(true)
      } catch {
        localStorage.removeItem('partnerToken')
        localStorage.removeItem('partner')
      } finally {
        setLoading(false)
      }
    }
    void validateSession()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-light">Carregando...</div>
  }

  return (
    <BrowserRouter basename="/partners">
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage onLogin={() => setIsAuthenticated(true)} /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/signup"
          element={!isAuthenticated ? <SignupPage /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/bags"
          element={isAuthenticated ? <BagsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/settings"
          element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/pickup"
          element={isAuthenticated ? <PickupPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/reservations"
          element={isAuthenticated ? <ReservationsPage /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  )
}

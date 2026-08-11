import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import axios from 'axios'

interface DashboardStats {
  totalBags: number
  totalReservations: number
  totalRevenue: number
  co2Saved: number
  recentReservations: any[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBags: 0,
    totalReservations: 0,
    totalRevenue: 0,
    co2Saved: 0,
    recentReservations: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('partnerToken')
        const response = await axios.get('/api/partner/stats', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setStats(response.data)
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <Layout><div>Carregando...</div></Layout>
  }

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-4xl font-bold text-dark">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Sacolas Criadas</p>
            <p className="text-3xl font-bold text-primary mt-2">{stats.totalBags}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Reservas Recebidas</p>
            <p className="text-3xl font-bold text-primary mt-2">{stats.totalReservations}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Receita Total</p>
            <p className="text-3xl font-bold text-primary mt-2">R$ {stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">CO₂ Evitado (kg)</p>
            <p className="text-3xl font-bold text-primary mt-2">{stats.co2Saved.toFixed(1)}</p>
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-dark mb-4">Reservas Recentes</h2>
          {stats.recentReservations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-300">
                  <tr>
                    <th className="pb-3 font-semibold text-dark">Código</th>
                    <th className="pb-3 font-semibold text-dark">Cliente</th>
                    <th className="pb-3 font-semibold text-dark">Sacola</th>
                    <th className="pb-3 font-semibold text-dark">Status</th>
                    <th className="pb-3 font-semibold text-dark">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentReservations.map((res) => (
                    <tr key={res.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 font-mono text-sm">{res.code}</td>
                      <td className="py-3">{res.customerName}</td>
                      <td className="py-3">{res.bagCategory}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          res.status === 'picked_up' ? 'bg-green-100 text-green-800' :
                          res.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-600">{new Date(res.createdAt).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">Nenhuma reserva ainda.</p>
          )}
        </div>
      </div>
    </Layout>
  )
}

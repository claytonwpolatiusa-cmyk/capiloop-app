import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { partnerApi } from '../lib/partner-api'

type ReservationStatus = 'pending' | 'confirmed' | 'picked_up' | 'cancelled'
type DailyReservation = {
  id: number
  code: string
  status: ReservationStatus
  pickupTime?: string | null
  customerName: string
  bag: { category: string; expectedItems: string; salePrice: number }
}

const statusLabel: Record<ReservationStatus, string> = { pending: 'Pagamento pendente', confirmed: 'A retirar', picked_up: 'Retirada concluída', cancelled: 'Cancelada' }
const statusClass: Record<ReservationStatus, string> = { pending: 'bg-amber-100 text-amber-800', confirmed: 'bg-blue-100 text-blue-800', picked_up: 'bg-green-100 text-green-800', cancelled: 'bg-gray-100 text-gray-700' }

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<DailyReservation[]>([])
  const [summary, setSummary] = useState({ total: 0, pending: 0, confirmed: 0, pickedUp: 0 })
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'picked_up'>('all')

  const loadReservations = async () => {
    setLoading(true); setError('')
    try {
      const response = await partnerApi.get('/api/partner/reservations/today')
      setReservations(response.data.reservations ?? [])
      setSummary(response.data.summary ?? { total: 0, pending: 0, confirmed: 0, pickedUp: 0 })
      setDate(response.data.date ?? '')
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Não foi possível carregar as reservas do dia.')
    } finally { setLoading(false) }
  }

  useEffect(() => { void loadReservations() }, [])
  const visibleReservations = useMemo(() => filter === 'all' ? reservations : reservations.filter((reservation) => reservation.status === filter), [filter, reservations])
  const formattedDate = date ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' }).format(new Date(`${date}T12:00:00`)) : 'hoje'

  return <Layout><div className="space-y-6">
    <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-bold uppercase tracking-widest text-primary">Operação do dia</p><h1 className="mt-2 text-4xl font-bold text-dark">Reservas de {formattedDate}</h1><p className="mt-2 text-gray-600">Acompanhe os pedidos programados e priorize as retiradas confirmadas.</p></div><button onClick={() => void loadReservations()} disabled={loading} className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-dark hover:bg-gray-50 disabled:opacity-50">Atualizar lista</button></header>
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[['Total', summary.total, 'bg-dark text-white'], ['A retirar', summary.confirmed, 'bg-blue-50 text-blue-950'], ['Concluídas', summary.pickedUp, 'bg-green-50 text-green-950'], ['Pendentes', summary.pending, 'bg-amber-50 text-amber-950']].map(([label, value, colors]) => <div key={label as string} className={`rounded-2xl p-5 ${colors as string}`}><p className="text-sm font-semibold opacity-75">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</section>
    <div className="flex flex-wrap gap-2" aria-label="Filtrar reservas">{[['all', 'Todas'], ['confirmed', 'A retirar'], ['picked_up', 'Concluídas']].map(([value, label]) => <button key={value} onClick={() => setFilter(value as typeof filter)} className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === value ? 'bg-primary text-dark' : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'}`}>{label}</button>)}</div>
    {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
    {loading ? <div className="rounded-2xl bg-white p-10 text-center text-gray-600">Carregando reservas do dia...</div> : visibleReservations.length === 0 ? <div className="rounded-2xl bg-white p-12 text-center text-gray-600">Nenhuma reserva encontrada para este filtro.</div> : <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"><div className="overflow-x-auto"><table className="min-w-full text-left"><thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-5 py-4">Horário</th><th className="px-5 py-4">Sacola</th><th className="px-5 py-4">Cliente</th><th className="px-5 py-4">Comprovante</th><th className="px-5 py-4">Status</th></tr></thead><tbody className="divide-y divide-gray-100">{visibleReservations.map((reservation) => <tr key={reservation.id}><td className="whitespace-nowrap px-5 py-4 font-bold text-dark">{reservation.pickupTime ?? 'A combinar'}</td><td className="px-5 py-4"><p className="font-semibold text-dark">{reservation.bag.category}</p><p className="mt-1 text-sm text-gray-500">{reservation.bag.expectedItems}</p></td><td className="px-5 py-4 text-sm text-gray-700">{reservation.customerName}</td><td className="px-5 py-4 font-mono text-sm font-bold text-dark">{reservation.code}</td><td className="px-5 py-4"><span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${statusClass[reservation.status]}`}>{statusLabel[reservation.status]}</span></td></tr>)}</tbody></table></div></section>}
  </div></Layout>
}

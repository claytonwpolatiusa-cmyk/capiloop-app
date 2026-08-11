import { useEffect, useState, type FormEvent } from 'react'
import Layout from '../components/Layout'
import { partnerApi } from '../lib/partner-api'

interface Bag {
  id: number
  category: string
  originalPrice: number
  salePrice: number
  expectedItems: string
  pickupStartTime: string
  pickupEndTime: string
  quantity: number
  reserved: number
  co2Kg: number
  status: string
}

const emptyBag = {
  category: '', originalPrice: '', salePrice: '', expectedItems: '',
  pickupStartTime: '', pickupEndTime: '', quantity: '1', co2Kg: '',
}

export default function BagsPage() {
  const [bags, setBags] = useState<Bag[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(emptyBag)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchBags = async () => {
    try {
      setError('')
      const response = await partnerApi.get('/api/partner/bags')
      setBags(response.data.bags ?? [])
    } catch {
      setError('Não foi possível carregar suas sacolas. Atualize a página ou faça login novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchBags() }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await partnerApi.post('/api/partner/bags', formData)
      setFormData(emptyBag)
      setShowForm(false)
      await fetchBags()
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Não foi possível publicar a sacola. Verifique os dados e tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (bagId: number) => {
    if (!confirm('Tem certeza que deseja cancelar esta sacola?')) return
    try {
      await partnerApi.delete(`/api/partner/bags/${bagId}`)
      await fetchBags()
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Não foi possível cancelar esta sacola.')
    }
  }

  if (loading) return <Layout><div>Carregando suas sacolas...</div></Layout>

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div><h1 className="text-4xl font-bold text-dark">Minhas Sacolas</h1><p className="mt-1 text-gray-600">Publique o excedente do dia e acompanhe as reservas.</p></div>
          <button onClick={() => setShowForm((visible) => !visible)} className="rounded-lg bg-primary px-6 py-2 font-semibold text-dark hover:bg-primary/90">
            {showForm ? 'Cancelar' : '+ Nova Sacola'}
          </button>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

        {showForm && (
          <section className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-2xl font-bold text-dark">Criar nova sacola</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input required placeholder="Categoria (ex.: Padaria)" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-2" />
              <input required placeholder="Itens esperados" value={formData.expectedItems} onChange={(e) => setFormData({ ...formData, expectedItems: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-2" />
              <input required type="number" min="0.01" step="0.01" placeholder="Preço original (R$)" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-2" />
              <input required type="number" min="0.01" step="0.01" placeholder="Preço CapiLoop (R$)" value={formData.salePrice} onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-2" />
              <input required type="time" value={formData.pickupStartTime} onChange={(e) => setFormData({ ...formData, pickupStartTime: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-2" />
              <input required type="time" value={formData.pickupEndTime} onChange={(e) => setFormData({ ...formData, pickupEndTime: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-2" />
              <input required type="number" min="1" placeholder="Quantidade" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-2" />
              <input required type="number" min="0.01" step="0.01" placeholder="CO₂ evitado (kg)" value={formData.co2Kg} onChange={(e) => setFormData({ ...formData, co2Kg: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-2" />
              <button disabled={submitting} type="submit" className="rounded-lg bg-primary py-2 font-semibold text-dark disabled:opacity-50 md:col-span-2">{submitting ? 'Publicando...' : 'Publicar sacola'}</button>
            </form>
          </section>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bags.map((bag) => (
            <article key={bag.id} className="rounded-lg bg-white p-6 shadow">
              <div className="mb-4 flex items-start justify-between gap-3"><h3 className="text-xl font-bold text-dark">{bag.category}</h3><span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">{bag.status}</span></div>
              <div className="mb-4 space-y-2 text-sm text-gray-600"><p>{bag.expectedItems}</p><p><strong>Venda:</strong> R$ {bag.salePrice.toFixed(2)}</p><p><strong>Retirada:</strong> {bag.pickupStartTime}–{bag.pickupEndTime}</p><p><strong>Reservadas:</strong> {bag.reserved}/{bag.quantity}</p><p><strong>CO₂:</strong> {bag.co2Kg} kg</p></div>
              <button onClick={() => void handleDelete(bag.id)} className="w-full rounded-lg bg-red-100 py-2 text-sm font-semibold text-red-700 hover:bg-red-200">Cancelar sacola</button>
            </article>
          ))}
        </div>
        {bags.length === 0 && !showForm && <div className="py-12 text-center text-gray-600">Nenhuma sacola criada ainda. Crie a primeira sacola para aparecer no app CapiLoop.</div>}
      </div>
    </Layout>
  )
}

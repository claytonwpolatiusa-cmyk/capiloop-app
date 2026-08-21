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
  const [editingBagId, setEditingBagId] = useState<number | null>(null)
  const [formData, setFormData] = useState(emptyBag)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
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

  const closeForm = () => {
    setShowForm(false)
    setEditingBagId(null)
    setFormData(emptyBag)
  }

  const startEdit = (bag: Bag) => {
    if (bag.status !== 'active' || bag.reserved > 0) {
      setError('Sacolas com reservas ou fora de operação não podem ser alteradas.')
      return
    }
    setError('')
    setNotice('')
    setEditingBagId(bag.id)
    setFormData({
      category: bag.category,
      originalPrice: String(bag.originalPrice),
      salePrice: String(bag.salePrice),
      expectedItems: bag.expectedItems,
      pickupStartTime: bag.pickupStartTime,
      pickupEndTime: bag.pickupEndTime,
      quantity: String(bag.quantity),
      co2Kg: String(bag.co2Kg),
    })
    setShowForm(true)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setSubmitting(true)
    try {
      if (editingBagId) await partnerApi.put(`/api/partner/bags/${editingBagId}`, formData)
      else await partnerApi.post('/api/partner/bags', formData)
      setNotice(editingBagId ? 'Sacola atualizada com sucesso.' : 'Sacola publicada com sucesso.')
      closeForm()
      await fetchBags()
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Não foi possível salvar a sacola. Verifique os dados e tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (bag: Bag) => {
    if (!confirm(`Cancelar a sacola “${bag.category}”? Esta ação só é possível quando não há reservas vinculadas.`)) return
    setError('')
    setNotice('')
    try {
      await partnerApi.delete(`/api/partner/bags/${bag.id}`)
      setNotice('Sacola cancelada. Ela não aparecerá mais no catálogo.')
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
          <button onClick={() => { setError(''); setNotice(''); showForm ? closeForm() : setShowForm(true) }} className="rounded-lg bg-primary px-6 py-2 font-semibold text-dark hover:bg-primary/90">
            {showForm ? 'Fechar formulário' : '+ Nova Sacola'}
          </button>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
        {notice && <p role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-800">{notice}</p>}

        {showForm && (
          <section className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-1 text-2xl font-bold text-dark">{editingBagId ? 'Editar sacola' : 'Criar nova sacola'}</h2>
            <p className="mb-4 text-sm text-gray-600">Alterações e cancelamentos são permitidos apenas enquanto não houver reservas vinculadas.</p>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input required placeholder="Categoria (ex.: Padaria)" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-2" />
              <input required placeholder="Itens esperados" value={formData.expectedItems} onChange={(e) => setFormData({ ...formData, expectedItems: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-2" />
              <input required type="number" min="0.01" step="0.01" placeholder="Preço original (R$)" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-2" />
              <input required type="number" min="0.01" step="0.01" placeholder="Preço CapiLoop (R$)" value={formData.salePrice} onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-2" />
              <input required type="time" value={formData.pickupStartTime} onChange={(e) => setFormData({ ...formData, pickupStartTime: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-2" />
              <input required type="time" value={formData.pickupEndTime} onChange={(e) => setFormData({ ...formData, pickupEndTime: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-2" />
              <input required type="number" min="1" placeholder="Quantidade" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-2" />
              <input required type="number" min="0.01" step="0.01" placeholder="CO₂ evitado (kg)" value={formData.co2Kg} onChange={(e) => setFormData({ ...formData, co2Kg: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-2" />
              <div className="flex gap-3 md:col-span-2">
                <button disabled={submitting} type="submit" className="flex-1 rounded-lg bg-primary py-2 font-semibold text-dark disabled:opacity-50">{submitting ? 'Salvando...' : editingBagId ? 'Salvar alterações' : 'Publicar sacola'}</button>
                <button type="button" onClick={closeForm} className="rounded-lg border border-gray-300 px-5 py-2 font-semibold text-gray-700">Cancelar</button>
              </div>
            </form>
          </section>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bags.map((bag) => (
            <article key={bag.id} className="rounded-lg bg-white p-6 shadow">
              <div className="mb-4 flex items-start justify-between gap-3"><h3 className="text-xl font-bold text-dark">{bag.category}</h3><span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">{bag.status}</span></div>
              <div className="mb-4 space-y-2 text-sm text-gray-600"><p>{bag.expectedItems}</p><p><strong>Venda:</strong> R$ {bag.salePrice.toFixed(2)}</p><p><strong>Retirada:</strong> {bag.pickupStartTime}–{bag.pickupEndTime}</p><p><strong>Reservadas:</strong> {bag.reserved}/{bag.quantity}</p><p><strong>CO₂:</strong> {bag.co2Kg} kg</p></div>
              {bag.status === 'active' && bag.reserved === 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => startEdit(bag)} className="rounded-lg bg-dark/5 py-2 text-sm font-semibold text-dark hover:bg-dark/10">Editar</button>
                  <button onClick={() => void handleDelete(bag)} className="rounded-lg bg-red-100 py-2 text-sm font-semibold text-red-700 hover:bg-red-200">Cancelar</button>
                </div>
              ) : (
                <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs leading-5 text-gray-600">{bag.reserved > 0 ? 'Esta sacola possui reservas e está protegida contra alterações ou cancelamento.' : 'Esta sacola não está mais disponível para edição.'}</p>
              )}
            </article>
          ))}
        </div>
        {bags.length === 0 && !showForm && <div className="py-12 text-center text-gray-600">Nenhuma sacola criada ainda. Crie a primeira sacola para aparecer no app CapiLoop.</div>}
      </div>
    </Layout>
  )
}

import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import axios from 'axios'

interface PartnerSettings {
  businessName: string
  cnpj: string
  category: string
  address: string
  phone: string
  email: string
  latitude: string
  longitude: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PartnerSettings>({
    businessName: '',
    cnpj: '',
    category: '',
    address: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('partnerToken')
      const response = await axios.get('/api/partner/settings', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSettings(response.data)
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const token = localStorage.getItem('partnerToken')
      await axios.put('/api/partner/settings', settings, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessage('Configurações salvas com sucesso!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Layout><div>Carregando...</div></Layout>
  }

  return (
    <Layout>
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold text-dark mb-8">Configurações</h1>

        <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Nome do Negócio</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">CNPJ</label>
              <input
                type="text"
                value={settings.cnpj}
                onChange={(e) => setSettings({ ...settings, cnpj: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Categoria</label>
              <select
                value={settings.category}
                onChange={(e) => setSettings({ ...settings, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Selecione uma categoria</option>
                <option value="Padaria">Padaria</option>
                <option value="Café">Café</option>
                <option value="Mercado">Mercado</option>
                <option value="Restaurante">Restaurante</option>
                <option value="Confeitaria">Confeitaria</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Telefone</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark mb-2">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark mb-2">Endereço</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Latitude</label>
              <input
                type="text"
                value={settings.latitude}
                onChange={(e) => setSettings({ ...settings, latitude: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="-23.5505"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">Longitude</label>
              <input
                type="text"
                value={settings.longitude}
                onChange={(e) => setSettings({ ...settings, longitude: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="-46.6333"
              />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${message.includes('sucesso') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-dark font-semibold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </form>
      </div>
    </Layout>
  )
}

import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatCNPJ, isValidCNPJ } from '../utils/cnpj'
import { partnerApi } from '../lib/partner-api'

export default function SignupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'info' | 'cnpj' | 'account'>('info')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    businessName: '',
    cnpj: '',
    category: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 14) value = value.slice(0, 14)
    
    // Formatar enquanto digita
    if (value.length <= 14) {
      value = formatCNPJ(value)
    }
    
    setFormData({ ...formData, cnpj: value })
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)
    
    // Formatar: (XX) XXXXX-XXXX
    if (value.length <= 2) {
      value = value
    } else if (value.length <= 7) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`
    } else {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`
    }
    
    setFormData({ ...formData, phone: value })
  }

  const validateStep = (): boolean => {
    setError('')

    if (step === 'info') {
      if (!formData.businessName.trim()) {
        setError('Nome do negócio é obrigatório')
        return false
      }
      if (!formData.category) {
        setError('Categoria é obrigatória')
        return false
      }
      if (!formData.address.trim()) {
        setError('Endereço é obrigatório')
        return false
      }
      return true
    }

    if (step === 'cnpj') {
      const cleanCNPJ = formData.cnpj.replace(/\D/g, '')
      if (!cleanCNPJ) {
        setError('CNPJ é obrigatório')
        return false
      }
      if (!isValidCNPJ(cleanCNPJ)) {
        setError('CNPJ inválido')
        return false
      }
      if (!formData.phone.trim()) {
        setError('Telefone é obrigatório')
        return false
      }
      return true
    }

    if (step === 'account') {
      if (!formData.email.trim()) {
        setError('Email é obrigatório')
        return false
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Email inválido')
        return false
      }
      if (!formData.password || formData.password.length < 8) {
        setError('Senha deve ter no mínimo 8 caracteres')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Senhas não conferem')
        return false
      }
      return true
    }

    return false
  }

  const handleNext = () => {
    if (validateStep()) {
      if (step === 'info') setStep('cnpj')
      else if (step === 'cnpj') setStep('account')
    }
  }

  const handleBack = () => {
    if (step === 'cnpj') setStep('info')
    else if (step === 'account') setStep('cnpj')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateStep()) return

    setLoading(true)
    try {
      await partnerApi.post('/api/partner/signup', {
        businessName: formData.businessName,
        cnpj: formData.cnpj.replace(/\D/g, ''),
        category: formData.category,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
      })

      navigate('/login')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-dark/10 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-dark mb-2">CapiLoop</h1>
        <p className="text-gray-600 mb-8">Cadastro de Parceiros</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Informações do Negócio */}
          {step === 'info' && (
            <>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Nome do Negócio</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: Padaria do João"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                <label className="block text-sm font-medium text-dark mb-1">Endereço</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-primary text-dark font-semibold py-2 rounded-lg hover:bg-primary/90"
              >
                Próximo
              </button>
            </>
          )}

          {/* Step 2: CNPJ e Telefone */}
          {step === 'cnpj' && (
            <>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">CNPJ</label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={handleCNPJChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
                <p className="text-xs text-gray-500 mt-1">Será validado automaticamente</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Telefone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="(11) 99999-9999"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 text-dark font-semibold py-2 rounded-lg hover:bg-gray-300"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-primary text-dark font-semibold py-2 rounded-lg hover:bg-primary/90"
                >
                  Próximo
                </button>
              </div>
            </>
          )}

          {/* Step 3: Conta */}
          {step === 'account' && (
            <>
              <div>
                <label className="block text-sm font-medium text-dark mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Senha</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1">Confirmar Senha</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 text-dark font-semibold py-2 rounded-lg hover:bg-gray-300"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-dark font-semibold py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Criando conta...' : 'Criar Conta'}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Já tem uma conta? <Link to="/login" className="text-primary font-semibold">Faça login</Link>
        </p>
      </div>
    </div>
  )
}

import { FormEvent, useState } from 'react'
import Layout from '../components/Layout'
import { partnerApi } from '../lib/partner-api'

type PickupConfirmation = {
  code: string
  status: 'picked_up'
  pickupTime?: string | null
  bagCategory: string
}

export default function PickupPage() {
  const [code, setCode] = useState('')
  const [confirmation, setConfirmation] = useState<PickupConfirmation | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const normalizedCode = code.trim().toUpperCase()
    setError('')
    setConfirmation(null)
    if (!normalizedCode) {
      setError('Informe o código exibido no comprovante do cliente.')
      return
    }

    setSubmitting(true)
    try {
      const response = await partnerApi.post(`/api/partner/reservations/${encodeURIComponent(normalizedCode)}/confirm`)
      setConfirmation(response.data.reservation)
      setCode('')
    } catch (requestError: any) {
      setError(requestError.response?.data?.message ?? 'Não foi possível confirmar a retirada. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Retirada segura</p>
          <h1 className="mt-2 text-4xl font-bold text-dark">Confirmar retirada</h1>
          <p className="mt-2 text-gray-600">Digite o código do comprovante apresentado pelo cliente antes de entregar a sacola.</p>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="pickup-code" className="block text-sm font-semibold text-dark">Código do comprovante</label>
              <input
                id="pickup-code"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase().replace(/\s/g, ''))}
                placeholder="CPL-XXXXXXXX"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                maxLength={20}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-mono text-lg font-bold tracking-wider text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                aria-describedby="pickup-code-help"
              />
              <p id="pickup-code-help" className="mt-2 text-sm text-gray-500">A confirmação só é liberada para reservas deste estabelecimento com pagamento aprovado.</p>
            </div>

            <button disabled={submitting} type="submit" className="w-full rounded-xl bg-primary px-5 py-3 font-bold text-dark transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? 'Validando comprovante...' : 'Confirmar retirada'}
            </button>
          </form>
        </section>

        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-800">{error}</div>}

        {confirmation && (
          <section role="status" className="rounded-2xl border border-green-200 bg-green-50 p-6">
            <p className="text-sm font-bold uppercase tracking-widest text-green-700">Retirada confirmada</p>
            <h2 className="mt-2 text-2xl font-bold text-green-950">Sacola entregue com sucesso.</h2>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="font-semibold text-green-800">Código</dt><dd className="mt-1 font-mono font-bold text-green-950">{confirmation.code}</dd></div>
              <div><dt className="font-semibold text-green-800">Sacola</dt><dd className="mt-1 font-medium text-green-950">{confirmation.bagCategory}</dd></div>
              {confirmation.pickupTime && <div><dt className="font-semibold text-green-800">Horário previsto</dt><dd className="mt-1 font-medium text-green-950">{confirmation.pickupTime}</dd></div>}
            </dl>
          </section>
        )}

        <aside className="rounded-xl bg-dark/5 px-5 py-4 text-sm leading-6 text-gray-700">
          <strong className="text-dark">Como funciona:</strong> o portal verifica se o código pertence à sua loja, se o pagamento está concluído e se a retirada ainda não foi registrada. Em caso de erro, não entregue a sacola e peça ao cliente para atualizar o comprovante no aplicativo.
        </aside>
      </div>
    </Layout>
  )
}

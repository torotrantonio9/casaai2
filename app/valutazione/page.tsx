'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

interface ValuationResult {
  price_min: number
  price_max: number
  price_avg: number
  price_per_sqm: number
  positive_factors: string[]
  negative_factors: string[]
  market_trend: string
  confidence: string
  ai_analysis: string
}

const CITIES = ['Napoli', 'Salerno', 'Caserta', 'Avellino', 'Benevento', 'Pozzuoli', 'Sorrento', 'Ischia', 'Amalfi']
const ENERGY_CLASSES = ['A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G']

export default function ValutazionePage() {
  const [form, setForm] = useState({
    city: 'Napoli', zone: '', property_type: 'apartment',
    surface_sqm: 80, rooms: 3, floor: 2, total_floors: 5,
    year_built: 1980, energy_class: 'D',
    has_elevator: false, has_parking: false, has_garden: false, has_terrace: false,
  })
  const [result, setResult] = useState<ValuationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/ai/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data.data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore durante la valutazione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Valutazione AI del tuo immobile</h1>
            <p className="text-gray-500 mt-2">Ottieni una stima gratuita basata su dati reali del mercato campano</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="val_city" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Città *</label>
                  <select id="val_city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" style={{ color: '#111827', background: 'white' }}>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="val_zone" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Zona</label>
                  <input id="val_zone" type="text" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })}
                    placeholder="es. Vomero, Centro" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    style={{ color: '#111827', background: 'white' }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="val_type" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Tipo immobile</label>
                  <select id="val_type" value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" style={{ color: '#111827', background: 'white' }}>
                    <option value="apartment">Appartamento</option>
                    <option value="house">Casa</option>
                    <option value="villa">Villa</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="val_surface" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Superficie (mq) *</label>
                  <input id="val_surface" type="number" required min={10} value={form.surface_sqm}
                    onChange={(e) => setForm({ ...form, surface_sqm: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" style={{ color: '#111827', background: 'white' }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="val_rooms" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Locali *</label>
                  <input id="val_rooms" type="number" required min={1} value={form.rooms}
                    onChange={(e) => setForm({ ...form, rooms: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" style={{ color: '#111827', background: 'white' }} />
                </div>
                <div>
                  <label htmlFor="val_floor" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Piano</label>
                  <input id="val_floor" type="number" value={form.floor}
                    onChange={(e) => setForm({ ...form, floor: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" style={{ color: '#111827', background: 'white' }} />
                </div>
                <div>
                  <label htmlFor="val_year" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Anno</label>
                  <input id="val_year" type="number" value={form.year_built}
                    onChange={(e) => setForm({ ...form, year_built: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" style={{ color: '#111827', background: 'white' }} />
                </div>
              </div>

              <div>
                <label htmlFor="val_energy" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Classe energetica</label>
                <select id="val_energy" value={form.energy_class} onChange={(e) => setForm({ ...form, energy_class: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" style={{ color: '#111827', background: 'white' }}>
                  {ENERGY_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'has_elevator' as const, label: 'Ascensore' },
                  { key: 'has_parking' as const, label: 'Posto auto' },
                  { key: 'has_garden' as const, label: 'Giardino' },
                  { key: 'has_terrace' as const, label: 'Terrazzo' },
                ].map((f) => (
                  <label key={f.key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600" />
                    <span style={{ color: '#111827' }}>{f.label}</span>
                  </label>
                ))}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                {loading ? 'Analisi in corso...' : 'Valuta il mio immobile'}
              </button>
            </form>

            {/* Result */}
            <div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                  ⚠️ {error}
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                    <p className="text-sm text-gray-500 mb-2">Stima di mercato</p>
                    <p className="text-4xl font-bold text-[#1e40af]">
                      €{result.price_avg.toLocaleString('it-IT')}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Range: €{result.price_min.toLocaleString('it-IT')} — €{result.price_max.toLocaleString('it-IT')}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">€{result.price_per_sqm}/mq</p>
                    <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      Confidenza: {result.confidence}
                    </div>
                  </div>

                  {result.positive_factors.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <h3 className="font-semibold text-sm text-green-700 mb-2">✅ Fattori positivi</h3>
                      <ul className="space-y-1">
                        {result.positive_factors.map((f, i) => (
                          <li key={i} className="text-sm text-gray-600">+ {f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.negative_factors.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <h3 className="font-semibold text-sm text-red-700 mb-2">⚠️ Fattori negativi</h3>
                      <ul className="space-y-1">
                        {result.negative_factors.map((f, i) => (
                          <li key={i} className="text-sm text-gray-600">- {f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="font-semibold text-sm mb-2" style={{ color: '#111827' }}>📊 Trend di mercato</h3>
                    <p className="text-sm text-gray-600">{result.market_trend}</p>
                  </div>

                  {result.ai_analysis && (
                    <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                      <h3 className="font-semibold text-sm text-blue-700 mb-2">✦ Analisi AI</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{result.ai_analysis}</p>
                    </div>
                  )}
                </div>
              )}

              {!result && !error && (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <p className="text-4xl mb-4">🏠</p>
                  <p className="text-gray-500">Compila il form per ottenere una valutazione AI del tuo immobile</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

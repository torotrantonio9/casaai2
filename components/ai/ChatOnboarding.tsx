'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { WizardContext } from '@/types/chat'

const CITIES = [
  'Napoli', 'Salerno', 'Caserta', 'Avellino', 'Benevento',
  'Pozzuoli', 'Torre del Greco', 'Portici', 'Ercolano',
  'Giugliano in Campania', 'Castellammare di Stabia',
  'Sorrento', 'Ischia', 'Amalfi',
]

const MUST_HAVE_OPTIONS = [
  { id: 'Ascensore', label: '🛗 Ascensore' },
  { id: 'Posto auto', label: '🚗 Posto auto' },
  { id: 'Giardino', label: '🌿 Giardino' },
  { id: 'Terrazzo', label: '🏖 Terrazzo' },
  { id: 'Pet friendly', label: '🐕 Pet friendly' },
  { id: 'Accessibile', label: '♿ Accessibile' },
  { id: 'Cantina', label: '📦 Cantina' },
  { id: 'Classe A/B', label: '⚡ Classe A/B' },
  { id: 'Piano alto', label: '🌞 Piano alto' },
  { id: 'Zona silenziosa', label: '🔇 Zona silenziosa' },
  { id: 'Vicino metro', label: '🚇 Vicino metro' },
  { id: 'Vicino scuole', label: '🏫 Vicino scuole' },
  { id: 'Vicino ospedale', label: '🏥 Vicino ospedale' },
  { id: 'Zona verde', label: '🌳 Zona verde' },
]

interface ChatOnboardingProps {
  onComplete: (context: WizardContext) => void
  onSkip: () => void
}

export default function ChatOnboarding({ onComplete, onSkip }: ChatOnboardingProps) {
  const [step, setStep] = useState(1)
  const [context, setContext] = useState<WizardContext>({
    intent: 'sale',
    who_is_searching: 'solo',
    rooms_needed: 3,
    smart_working: false,
    budget_max: 200000,
    location_label: '',
    max_distance_km: 10,
    must_have: [],
    custom_note: '',
  })

  const [citySearch, setCitySearch] = useState('')
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)

  const filteredCities = CITIES.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  )

  const totalSteps = 6

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      onComplete(context)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const formatPrice = (value: number, isRent: boolean) => {
    if (isRent) return `€${value.toLocaleString('it-IT')}/mese`
    return `€${value.toLocaleString('it-IT')}`
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium" style={{ color: '#111827' }}>
          Passo {step}/{totalSteps}
        </span>
        <button
          onClick={onSkip}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Salta il wizard
        </button>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="min-h-[280px] transition-opacity duration-300">
        {/* Step 1: Buy or Rent */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>Cosa stai cercando?</h2>
            <p className="text-gray-500 mb-6">Scegli il tipo di ricerca</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'sale' as const, icon: '🏠', label: 'Acquisto', desc: 'Comprare casa' },
                { value: 'rent' as const, icon: '🔑', label: 'Affitto', desc: 'Prendere in affitto' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setContext({ ...context, intent: opt.value })}
                  className={cn(
                    'p-6 rounded-xl border-2 text-center transition-all hover:shadow-md',
                    context.intent === opt.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <span className="text-4xl block mb-2">{opt.icon}</span>
                  <span className="font-semibold text-lg block" style={{ color: '#111827' }}>{opt.label}</span>
                  <span className="text-sm text-gray-500">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Who */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>Chi cerca casa?</h2>
            <p className="text-gray-500 mb-6">Ci aiuta a trovare la soluzione migliore</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'solo' as const, icon: '👤', label: 'Solo' },
                { value: 'coppia' as const, icon: '👫', label: 'Coppia' },
                { value: 'famiglia' as const, icon: '👨‍👩‍👧‍👦', label: 'Famiglia' },
                { value: 'investimento' as const, icon: '💼', label: 'Investimento' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setContext({ ...context, who_is_searching: opt.value })}
                  className={cn(
                    'p-5 rounded-xl border-2 text-center transition-all hover:shadow-md',
                    context.who_is_searching === opt.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <span className="text-3xl block mb-2">{opt.icon}</span>
                  <span className="font-semibold" style={{ color: '#111827' }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Rooms */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>Quante stanze?</h2>
            <p className="text-gray-500 mb-6">Seleziona il numero di locali</p>
            <div className="flex gap-3 mb-6">
              {[
                { value: 1 as const, label: 'Monolocale' },
                { value: 2 as const, label: '2 locali' },
                { value: 3 as const, label: '3 locali' },
                { value: 4 as const, label: '4+ locali' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setContext({ ...context, rooms_needed: opt.value })}
                  className={cn(
                    'flex-1 p-4 rounded-xl border-2 text-center transition-all hover:shadow-md',
                    context.rooms_needed === opt.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <span className="font-semibold text-sm" style={{ color: '#111827' }}>{opt.label}</span>
                </button>
              ))}
            </div>
            <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={context.smart_working}
                onChange={(e) => setContext({ ...context, smart_working: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span style={{ color: '#111827' }}>Ho bisogno di uno studio per smart working</span>
            </label>
          </div>
        )}

        {/* Step 4: Budget */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>Budget massimo?</h2>
            <p className="text-gray-500 mb-6">Imposta il tuo limite di spesa</p>
            <div className="text-center mb-8">
              <span className="text-4xl font-bold text-blue-600">
                {formatPrice(context.budget_max, context.intent === 'rent')}
              </span>
            </div>
            <input
              type="range"
              min={context.intent === 'rent' ? 300 : 50000}
              max={context.intent === 'rent' ? 5000 : 1500000}
              step={context.intent === 'rent' ? 100 : 10000}
              value={context.budget_max}
              onChange={(e) => setContext({ ...context, budget_max: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>{formatPrice(context.intent === 'rent' ? 300 : 50000, context.intent === 'rent')}</span>
              <span>{formatPrice(context.intent === 'rent' ? 5000 : 1500000, context.intent === 'rent')}</span>
            </div>
          </div>
        )}

        {/* Step 5: Location */}
        {step === 5 && (
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>Dove vuoi cercare?</h2>
            <p className="text-gray-500 mb-6">Città e distanza massima</p>
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Cerca città..."
                value={citySearch || context.location_label}
                onChange={(e) => {
                  setCitySearch(e.target.value)
                  setShowCitySuggestions(true)
                }}
                onFocus={() => setShowCitySuggestions(true)}
                className="w-full p-4 rounded-xl border border-gray-200 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ color: '#111827', background: 'white' }}
              />
              {showCitySuggestions && citySearch && filteredCities.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {filteredCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setContext({ ...context, location_label: city })
                        setCitySearch('')
                        setShowCitySuggestions(false)
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors"
                      style={{ color: '#111827' }}
                    >
                      📍 {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: '#111827' }}>Distanza massima</p>
              <div className="flex gap-2">
                {[
                  { value: 5 as const, label: '5km' },
                  { value: 10 as const, label: '10km' },
                  { value: 20 as const, label: '20km' },
                  { value: 30 as const, label: '30km' },
                  { value: null, label: 'Ovunque' },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    onClick={() => setContext({ ...context, max_distance_km: opt.value })}
                    className={cn(
                      'flex-1 py-3 rounded-lg border text-sm font-medium transition-all',
                      context.max_distance_km === opt.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                    style={context.max_distance_km !== opt.value ? { color: '#111827' } : undefined}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Must-haves */}
        {step === 6 && (
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>Cosa non può mancare?</h2>
            <p className="text-gray-500 mb-6">Seleziona le caratteristiche importanti</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {MUST_HAVE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    const mustHave = context.must_have.includes(opt.id)
                      ? context.must_have.filter((m) => m !== opt.id)
                      : [...context.must_have, opt.id]
                    setContext({ ...context, must_have: mustHave })
                  }}
                  className={cn(
                    'px-4 py-2 rounded-full border text-sm transition-all',
                    context.must_have.includes(opt.id)
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                  style={!context.must_have.includes(opt.id) ? { color: '#111827' } : undefined}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <textarea
              placeholder="Esigenze speciali (opzionale)"
              value={context.custom_note}
              onChange={(e) => setContext({ ...context, custom_note: e.target.value })}
              className="w-full p-4 rounded-xl border border-gray-200 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ color: '#111827', background: 'white' }}
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className={cn(
            'px-6 py-3 rounded-xl font-medium transition-all',
            step === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          ← Indietro
        </button>
        <button
          onClick={handleNext}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25"
        >
          {step === totalSteps ? 'Avvia ricerca →' : 'Avanti →'}
        </button>
      </div>
    </div>
  )
}

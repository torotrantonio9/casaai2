'use client'

import { useState } from 'react'
import ChatOnboarding from './ChatOnboarding'
import ChatWidget from './ChatWidget'
import type { WizardContext } from '@/types/chat'

export default function HomeChatSection() {
  const [phase, setPhase] = useState<'wizard' | 'chat'>('wizard')
  const [contextId, setContextId] = useState<string | null>(null)
  const [welcomeMessage, setWelcomeMessage] = useState('')

  const handleWizardComplete = async (context: WizardContext) => {
    try {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`

      const response = await fetch('/api/chat/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          intent: context.intent,
          who_is_searching: context.who_is_searching,
          rooms_needed: context.rooms_needed,
          smart_working: context.smart_working,
          budget_max: context.budget_max,
          location_label: context.location_label,
          location_lat: context.location_lat,
          location_lng: context.location_lng,
          max_distance_km: context.max_distance_km,
          must_have: context.must_have,
          custom_note: context.custom_note,
        }),
      })

      if (!response.ok) throw new Error('Errore salvataggio contesto')

      const data = await response.json()
      setContextId(data.context_id)

      // Build welcome message
      const typeLabel = context.intent === 'sale' ? 'acquisto' : 'affitto'
      const budgetFormatted = context.budget_max.toLocaleString('it-IT')
      const budgetSuffix = context.intent === 'rent' ? '/mese' : ''
      const locationPart = context.location_label ? ` a ${context.location_label}` : ''
      const roomsPart = context.rooms_needed === 1 ? 'un monolocale' : `un ${context.rooms_needed} locali`

      setWelcomeMessage(
        `Perfetto! Cerco ${roomsPart} in ${typeLabel}${locationPart} con budget massimo €${budgetFormatted}${budgetSuffix}. ` +
        `${context.must_have.length > 0 ? `Caratteristiche richieste: ${context.must_have.join(', ')}. ` : ''}` +
        `Sto cercando gli annunci migliori per te...`
      )

      setPhase('chat')
    } catch (error: unknown) {
      console.error('Error saving context:', error)
      // Go to chat anyway without context
      setPhase('chat')
    }
  }

  const handleSkip = () => {
    setWelcomeMessage('Ciao! Sono CasaAI, il tuo assistente immobiliare. Dimmi cosa cerchi e troverò gli annunci migliori per te.')
    setPhase('chat')
  }

  return (
    <div className="w-full">
      {phase === 'wizard' && (
        <ChatOnboarding onComplete={handleWizardComplete} onSkip={handleSkip} />
      )}

      {phase === 'chat' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
              AI
            </div>
            <div>
              <p className="font-semibold text-white">CasaAI</p>
              <p className="text-xs text-blue-100">Assistente immobiliare intelligente</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-blue-100">Online</span>
            </div>
          </div>

          <ChatWidget contextId={contextId} initialMessage={welcomeMessage} />
        </div>
      )}
    </div>
  )
}

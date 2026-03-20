'use client'

import { useState } from 'react'
import ChatOnboarding from './ChatOnboarding'
import ChatWidget from './ChatWidget'
import type { WizardContext } from '@/types/chat'

function buildWelcomeMessage(ctx: WizardContext): string {
  const parts: string[] = []
  if (ctx.intent === 'sale') parts.push('acquisto')
  if (ctx.intent === 'rent') parts.push('affitto')
  if (ctx.budget_max) parts.push(`budget massimo €${ctx.budget_max.toLocaleString('it-IT')}${ctx.intent === 'rent' ? '/mese' : ''}`)
  if (ctx.location_label) parts.push(`zona ${ctx.location_label}`)
  if (ctx.rooms_needed) parts.push(`${ctx.rooms_needed} locali`)
  if (ctx.must_have?.includes('Ascensore')) parts.push('con ascensore')
  if (ctx.must_have?.includes('Posto auto')) parts.push('con posto auto')
  if (ctx.must_have?.includes('Giardino')) parts.push('con giardino')
  if (ctx.must_have?.includes('Terrazzo')) parts.push('con terrazzo')

  return parts.length > 0
    ? `Cerca immobili per ${parts.join(', ')}`
    : 'Mostrami le migliori proposte disponibili'
}

export default function HomeChatSection() {
  const [showWizard, setShowWizard] = useState(true)
  const [contextId, setContextId] = useState<string | null>(null)
  const [autoMessage, setAutoMessage] = useState('')
  const [welcomeText, setWelcomeText] = useState('')

  const handleWizardComplete = async (context: WizardContext) => {
    console.log('[HomeChatSection] wizard complete:', JSON.stringify(context).slice(0, 200))

    // Build display text for welcome bubble
    const typeLabel = context.intent === 'sale' ? 'acquisto' : 'affitto'
    const budgetFormatted = context.budget_max.toLocaleString('it-IT')
    const budgetSuffix = context.intent === 'rent' ? '/mese' : ''
    const locationPart = context.location_label ? ` a ${context.location_label}` : ''
    const roomsPart = context.rooms_needed === 1 ? 'un monolocale' : `un ${context.rooms_needed} locali`

    setWelcomeText(
      `Perfetto! Cerco ${roomsPart} in ${typeLabel}${locationPart} con budget massimo €${budgetFormatted}${budgetSuffix}. ` +
      `${context.must_have.length > 0 ? `Caratteristiche richieste: ${context.must_have.join(', ')}. ` : ''}` +
      `Sto cercando gli annunci migliori per te...`
    )

    // Save context to API
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

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      console.log('[HomeChatSection] context saved, id:', data.context_id)
      setContextId(data.context_id)
    } catch (error: unknown) {
      console.error('[HomeChatSection] Context save failed:', error)
      // Continue without context — chat will still work
    }

    // Hide wizard, show chat
    setShowWizard(false)

    // Auto-trigger search after chat mounts
    const triggerText = buildWelcomeMessage(context)
    console.log('[HomeChatSection] will trigger:', triggerText)
    setTimeout(() => {
      setAutoMessage(triggerText)
    }, 700)
  }

  const handleSkip = () => {
    setWelcomeText('Ciao! Sono CasaAI, il tuo assistente immobiliare. Dimmi cosa cerchi e troverò gli annunci migliori per te.')
    setShowWizard(false)
  }

  return (
    <div className="w-full">
      {showWizard ? (
        <ChatOnboarding onComplete={handleWizardComplete} onSkip={handleSkip} />
      ) : (
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

          <ChatWidget
            contextId={contextId}
            initialMessage={welcomeText}
            triggerMessage={autoMessage}
            onTriggerConsumed={() => setAutoMessage('')}
          />
        </div>
      )}
    </div>
  )
}

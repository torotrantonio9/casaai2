import { askJSON, AIError } from './claude'
import type { IntentResult, ConversationFilters, ChatMessage } from '@/types/chat'
import type { ChatContext } from '@/types/database'

const INTENT_SYSTEM_PROMPT = `Rispondi SEMPRE in italiano.
Analizza il messaggio dell'utente nel contesto di una ricerca immobiliare italiana.
Ritorna SOLO un oggetto JSON valido con i seguenti campi:
- intent: "new_search" | "refine_filters" | "show_cards" | "question" | "request_contact" | "compare"
- filter_updates: oggetto con i filtri da aggiornare (listing_type, city, max_price, rooms_min, has_elevator, has_parking, has_garden, has_terrace)
- exclude_shown: boolean (true se l'utente vuole vedere altri annunci diversi)
- answer_from_shown: boolean (true se la domanda riguarda annunci già mostrati)

Esempi:
- "cerca con ascensore" → {"intent":"refine_filters","filter_updates":{"has_elevator":true},"exclude_shown":false,"answer_from_shown":false}
- "solo Napoli" → {"intent":"refine_filters","filter_updates":{"city":"Napoli"},"exclude_shown":false,"answer_from_shown":false}
- "altri annunci" → {"intent":"show_cards","filter_updates":{},"exclude_shown":true,"answer_from_shown":false}
- "quanto costa al mq?" → {"intent":"question","filter_updates":{},"exclude_shown":false,"answer_from_shown":true}
- "mostrami gli annunci" → {"intent":"show_cards","filter_updates":{},"exclude_shown":false,"answer_from_shown":false}
- "cerco trilocale in affitto a Salerno sotto 800 euro" → {"intent":"new_search","filter_updates":{"listing_type":"rent","city":"Salerno","max_price":800,"rooms_min":3},"exclude_shown":false,"answer_from_shown":false}
- "voglio contattare l'agenzia" → {"intent":"request_contact","filter_updates":{},"exclude_shown":false,"answer_from_shown":true}
- "confronta i primi due" → {"intent":"compare","filter_updates":{},"exclude_shown":false,"answer_from_shown":true}

Non aggiungere testo fuori dal JSON.`

export async function detectIntent(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  context: ChatContext | null
): Promise<IntentResult> {
  try {
    const contextInfo = context
      ? `\nContesto utente: ${context.intent === 'sale' ? 'acquisto' : 'affitto'}, budget ${context.budget_max}€, zona ${context.location_label || 'non specificata'}, ${context.rooms_needed || '?'} locali`
      : ''

    const recentMessages = conversationHistory
      .slice(-4)
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n')

    const prompt = `${contextInfo}\n\nConversazione recente:\n${recentMessages}\n\nMessaggio da analizzare: "${userMessage}"`

    const result = await askJSON<IntentResult>(prompt, INTENT_SYSTEM_PROMPT)

    // Validate and sanitize
    const validIntents = ['new_search', 'refine_filters', 'show_cards', 'question', 'request_contact', 'compare'] as const
    if (!validIntents.includes(result.intent as typeof validIntents[number])) {
      result.intent = 'show_cards'
    }

    if (!result.filter_updates) {
      result.filter_updates = {}
    }

    // Sanitize filter values
    const filters = result.filter_updates as Partial<ConversationFilters>
    if (filters.max_price && typeof filters.max_price !== 'number') {
      filters.max_price = Number(filters.max_price) || undefined
    }
    if (filters.rooms_min && typeof filters.rooms_min !== 'number') {
      filters.rooms_min = Number(filters.rooms_min) || undefined
    }

    return {
      intent: result.intent,
      filter_updates: filters,
      exclude_shown: Boolean(result.exclude_shown),
      answer_from_shown: Boolean(result.answer_from_shown),
    }
  } catch (error: unknown) {
    console.error('[intent] Error detecting intent:', error instanceof Error ? error.message : error)
    // Fallback: treat as show_cards
    return {
      intent: 'show_cards',
      filter_updates: {},
      exclude_shown: false,
      answer_from_shown: false,
    }
  }
}

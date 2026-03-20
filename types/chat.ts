// CasaAI v2.0 — Chat Types

export type SSEEvent =
  | { type: 'listings'; data: ListingCard[] }
  | { type: 'text'; content: string }
  | { type: 'suggestions'; data: string[] }
  | { type: 'done' }
  | { type: 'error'; message: string }

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  type: 'text' | 'listings' | 'suggestions'
  content: string
  listings?: ListingCard[]
  suggestions?: string[]
  timestamp: Date
}

export interface ListingCard {
  id: string
  title: string
  price: number
  price_period?: string
  address: string
  city: string
  surface_sqm?: number
  rooms?: number
  floor?: number
  property_type: string
  has_elevator: boolean
  has_parking: boolean
  has_garden: boolean
  has_terrace: boolean
  photos: string[]
  match_score: number
  ai_reason: string
}

export interface ConversationFilters {
  listing_type?: 'sale' | 'rent'
  city?: string
  max_price?: number
  rooms_min?: number
  has_elevator?: boolean
  has_parking?: boolean
  has_garden?: boolean
  has_terrace?: boolean
}

export interface IntentResult {
  intent: 'new_search' | 'refine_filters' | 'show_cards' | 'question' | 'request_contact' | 'compare'
  filter_updates: Partial<ConversationFilters>
  exclude_shown: boolean
  answer_from_shown: boolean
}

export interface WizardContext {
  intent: 'sale' | 'rent'
  who_is_searching: 'solo' | 'coppia' | 'famiglia' | 'investimento'
  rooms_needed: 1 | 2 | 3 | 4
  smart_working: boolean
  budget_max: number
  location_label: string
  location_lat?: number
  location_lng?: number
  max_distance_km: 5 | 10 | 20 | 30 | null
  must_have: string[]
  custom_note: string
}

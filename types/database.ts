// CasaAI v2.0 — Database Types

export type ListingType = 'sale' | 'rent'
export type ListingStatus = 'active' | 'sold' | 'rented' | 'draft' | 'expired'
export type PropertyType = 'apartment' | 'house' | 'villa' | 'land' | 'commercial' | 'garage' | 'other'
export type EnergyClass = 'A4' | 'A3' | 'A2' | 'A1' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'pending'
export type UserRole = 'buyer' | 'agent' | 'agency_admin' | 'admin'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'negotiation' | 'closed_won' | 'closed_lost'
export type LeadSource = 'chat' | 'form' | 'phone' | 'whatsapp' | 'email' | 'portal' | 'other'
export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'enterprise'
export type ImportJobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  agency_id: string | null
  created_at: string
  updated_at: string
}

export interface Agency {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  address: string | null
  city: string | null
  province: string | null
  phone: string | null
  email: string | null
  website: string | null
  vat_number: string | null
  subscription_plan: SubscriptionPlan
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  max_listings: number
  max_agents: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  agency_id: string
  agent_id: string | null
  title: string
  description: string | null
  ai_description: string | null
  listing_type: ListingType
  property_type: PropertyType
  status: ListingStatus
  price: number
  price_period: string | null
  price_per_sqm: number | null
  condominium_fees: number | null
  address: string
  city: string
  province: string | null
  cap: string | null
  zone: string | null
  lat: number | null
  lng: number | null
  surface_sqm: number | null
  rooms: number | null
  bedrooms: number | null
  bathrooms: number
  floor: number | null
  total_floors: number | null
  year_built: number | null
  energy_class: EnergyClass
  has_elevator: boolean
  has_parking: boolean
  has_garden: boolean
  has_terrace: boolean
  has_balcony: boolean
  has_cellar: boolean
  has_air_conditioning: boolean
  has_heating: boolean
  is_furnished: boolean
  pet_friendly: boolean
  is_accessible: boolean
  photos: string[]
  virtual_tour_url: string | null
  video_url: string | null
  slug: string | null
  is_featured: boolean
  views_count: number
  contacts_count: number
  external_id: string | null
  external_source: string | null
  external_url: string | null
  published_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface ChatContext {
  id: string
  session_id: string
  user_id: string | null
  intent: ListingType | null
  who_is_searching: string | null
  rooms_needed: number | null
  smart_working: boolean
  budget_max: number | null
  location_label: string | null
  location_lat: number | null
  location_lng: number | null
  max_distance_km: number | null
  must_have: string[]
  custom_note: string | null
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  listing_id: string
  agency_id: string
  full_name: string
  email: string
  phone: string | null
  message: string | null
  status: LeadStatus
  source: LeadSource
  ai_score: number | null
  ai_score_reason: string | null
  ai_draft_reply: string | null
  is_read: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  lead_id: string
  sender_id: string | null
  sender_role: string
  content: string
  is_read: boolean
  created_at: string
}

export interface SavedListing {
  id: string
  user_id: string
  listing_id: string
  created_at: string
}

export interface ListingView {
  id: string
  listing_id: string
  viewer_id: string | null
  session_id: string | null
  ip_address: string | null
  created_at: string
}

export interface ListingPriceHistory {
  id: string
  listing_id: string
  old_price: number | null
  new_price: number
  changed_at: string
}

export interface ImportJob {
  id: string
  agency_id: string
  source: string
  status: ImportJobStatus
  total_items: number
  imported_items: number
  errors: Record<string, unknown>[]
  metadata: Record<string, unknown>
  created_at: string
  completed_at: string | null
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ListingWithAgency extends Listing {
  agency?: Agency
  agent?: Profile
}

export interface LeadWithDetails extends Lead {
  listing?: Listing
  agency?: Agency
}

import { supabaseAdmin } from '@/lib/supabase/admin'
import type { IntentResult, ConversationFilters, ListingCard } from '@/types/chat'
import type { ChatContext, Listing } from '@/types/database'

export async function searchListings(
  contextData: ChatContext | null,
  intentResult: IntentResult,
  shownIds: string[]
): Promise<ListingCard[]> {
  // 1. Merge filters: context base + intentResult.filter_updates
  const baseFilters: ConversationFilters = {}

  if (contextData) {
    if (contextData.intent) baseFilters.listing_type = contextData.intent
    if (contextData.location_label) baseFilters.city = contextData.location_label
    if (contextData.budget_max) baseFilters.max_price = Number(contextData.budget_max)
    if (contextData.rooms_needed) baseFilters.rooms_min = contextData.rooms_needed
    if (contextData.must_have?.includes('Ascensore')) baseFilters.has_elevator = true
    if (contextData.must_have?.includes('Posto auto')) baseFilters.has_parking = true
    if (contextData.must_have?.includes('Giardino')) baseFilters.has_garden = true
    if (contextData.must_have?.includes('Terrazzo')) baseFilters.has_terrace = true
  }

  const mergedFilters: ConversationFilters = {
    ...baseFilters,
    ...intentResult.filter_updates,
  }

  // 2. Build dynamic Supabase query
  let query = supabaseAdmin
    .from('listings')
    .select('*')
    .eq('status', 'active')

  if (mergedFilters.listing_type) {
    query = query.eq('listing_type', mergedFilters.listing_type)
  }
  if (mergedFilters.city) {
    query = query.ilike('city', `%${mergedFilters.city}%`)
  }
  if (mergedFilters.max_price) {
    query = query.lte('price', mergedFilters.max_price)
  }
  if (mergedFilters.rooms_min) {
    query = query.gte('rooms', mergedFilters.rooms_min)
  }
  if (mergedFilters.has_elevator) {
    query = query.eq('has_elevator', true)
  }
  if (mergedFilters.has_parking) {
    query = query.eq('has_parking', true)
  }
  if (mergedFilters.has_garden) {
    query = query.eq('has_garden', true)
  }
  if (mergedFilters.has_terrace) {
    query = query.eq('has_terrace', true)
  }

  // 3. Exclude already shown IDs
  if (intentResult.exclude_shown && shownIds.length > 0) {
    query = query.not('id', 'in', `(${shownIds.join(',')})`)
  }

  // 4. Order by featured, then newest
  query = query
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6)

  console.log('[search] merged filters:', JSON.stringify(mergedFilters))
  console.log('[search] excluded IDs:', shownIds.length)

  const { data: listings, error } = await query

  if (error) {
    console.error('[search] Supabase error:', error.message)
    return []
  }

  console.log('[search] query returned:', listings?.length || 0, 'results')

  if (!listings || listings.length === 0) {
    console.log('[search] trying fallback query (no filters)...')
    // Fallback: try without strict filters
    const { data: fallbackListings } = await supabaseAdmin
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6)

    console.log('[search] fallback returned:', fallbackListings?.length || 0)
    if (!fallbackListings || fallbackListings.length === 0) return []

    return fallbackListings.map((l: Listing) => toListingCard(l, mergedFilters))
  }

  return listings.map((l: Listing) => toListingCard(l, mergedFilters))
}

function toListingCard(listing: Listing, filters: ConversationFilters): ListingCard {
  const matchScore = calculateMatchScore(listing, filters)
  const aiReason = generateAiReason(listing, filters)

  return {
    id: listing.id,
    title: listing.title,
    price: Number(listing.price),
    price_period: listing.price_period || undefined,
    address: listing.address,
    city: listing.city,
    surface_sqm: listing.surface_sqm || undefined,
    rooms: listing.rooms || undefined,
    floor: listing.floor || undefined,
    property_type: listing.property_type,
    has_elevator: listing.has_elevator,
    has_parking: listing.has_parking,
    has_garden: listing.has_garden,
    has_terrace: listing.has_terrace,
    photos: listing.photos || [],
    match_score: matchScore,
    ai_reason: aiReason,
  }
}

function calculateMatchScore(listing: Listing, filters: ConversationFilters): number {
  let score = 100

  // Price over budget
  if (filters.max_price && Number(listing.price) > filters.max_price) {
    const overPercent = ((Number(listing.price) - filters.max_price) / filters.max_price) * 100
    score -= Math.round(overPercent)
  }

  // Feature penalties
  if (filters.has_elevator && !listing.has_elevator) score -= 20
  if (filters.has_parking && !listing.has_parking) score -= 15
  if (filters.has_garden && !listing.has_garden) score -= 10
  if (filters.has_terrace && !listing.has_terrace) score -= 10

  // Rooms
  if (filters.rooms_min && listing.rooms && listing.rooms < filters.rooms_min) {
    score -= (filters.rooms_min - listing.rooms) * 10
  }

  // City mismatch
  if (filters.city && listing.city.toLowerCase() !== filters.city.toLowerCase()) {
    score -= 30
  }

  return Math.max(35, Math.min(99, score))
}

function generateAiReason(listing: Listing, filters: ConversationFilters): string {
  const reasons: string[] = []

  // Price analysis
  if (filters.max_price) {
    const priceRatio = Number(listing.price) / filters.max_price
    if (priceRatio < 0.85) {
      reasons.push(`Prezzo ${Math.round((1 - priceRatio) * 100)}% sotto budget`)
    } else if (priceRatio <= 1) {
      reasons.push('Nel budget')
    }
  }

  // Features
  if (filters.has_elevator && listing.has_elevator) reasons.push('ascensore presente')
  if (filters.has_parking && listing.has_parking) reasons.push('posto auto incluso')
  if (filters.has_garden && listing.has_garden) reasons.push('con giardino')
  if (filters.has_terrace && listing.has_terrace) reasons.push('con terrazzo')

  // Rooms
  if (filters.rooms_min && listing.rooms && listing.rooms >= filters.rooms_min) {
    reasons.push(`${listing.rooms} locali come richiesto`)
  }

  // Location
  if (listing.zone) reasons.push(`zona ${listing.zone}`)

  // Energy
  if (listing.energy_class && ['A4', 'A3', 'A2', 'A1', 'B'].includes(listing.energy_class)) {
    reasons.push(`classe energetica ${listing.energy_class}`)
  }

  // Fallback
  if (reasons.length === 0) {
    if (listing.surface_sqm) reasons.push(`${listing.surface_sqm}mq`)
    reasons.push(listing.city)
    if (listing.rooms) reasons.push(`${listing.rooms} locali`)
  }

  // Join and cap at ~12 words
  const text = reasons.slice(0, 4).join(', ') + '.'
  return text.charAt(0).toUpperCase() + text.slice(1)
}

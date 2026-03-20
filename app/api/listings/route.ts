import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'

const listingSchema = z.object({
  agency_id: z.string().uuid(),
  agent_id: z.string().uuid().optional(),
  title: z.string().min(5),
  description: z.string().optional(),
  ai_description: z.string().optional(),
  listing_type: z.enum(['sale', 'rent']),
  property_type: z.enum(['apartment', 'house', 'villa', 'land', 'commercial', 'garage', 'other']).default('apartment'),
  status: z.enum(['active', 'sold', 'rented', 'draft', 'expired']).default('active'),
  price: z.number().positive(),
  price_period: z.string().optional(),
  condominium_fees: z.number().optional(),
  address: z.string().min(3),
  city: z.string().min(2),
  province: z.string().optional(),
  cap: z.string().optional(),
  zone: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  surface_sqm: z.number().positive().optional(),
  rooms: z.number().min(1).optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().default(1),
  floor: z.number().optional(),
  total_floors: z.number().optional(),
  year_built: z.number().optional(),
  energy_class: z.string().default('pending'),
  has_elevator: z.boolean().default(false),
  has_parking: z.boolean().default(false),
  has_garden: z.boolean().default(false),
  has_terrace: z.boolean().default(false),
  has_balcony: z.boolean().default(false),
  has_cellar: z.boolean().default(false),
  has_air_conditioning: z.boolean().default(false),
  has_heating: z.boolean().default(false),
  is_furnished: z.boolean().default(false),
  pet_friendly: z.boolean().default(false),
  is_accessible: z.boolean().default(false),
  photos: z.array(z.string()).default([]),
  is_featured: z.boolean().default(false),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('per_page') || '20')
    const agencyId = searchParams.get('agency_id')

    let query = supabaseAdmin
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1)

    if (agencyId) {
      query = query.eq('agency_id', agencyId)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage),
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Errore sconosciuto'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = listingSchema.parse(body)

    // Calculate price_per_sqm
    const pricePerSqm = validated.surface_sqm
      ? Math.round(validated.price / validated.surface_sqm)
      : null

    // Generate slug
    const slug = `${validated.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`

    const { data, error } = await supabaseAdmin
      .from('listings')
      .insert({
        ...validated,
        price_per_sqm: pricePerSqm,
        slug,
        published_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dati non validi', details: error.issues }, { status: 400 })
    }
    const msg = error instanceof Error ? error.message : 'Errore sconosciuto'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

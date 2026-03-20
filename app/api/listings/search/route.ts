import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const listingType = searchParams.get('listing_type')
    const priceMin = searchParams.get('price_min')
    const priceMax = searchParams.get('price_max')
    const roomsMin = searchParams.get('rooms_min')
    const surfaceMin = searchParams.get('surface_min')
    const propertyType = searchParams.get('property_type')
    const hasElevator = searchParams.get('has_elevator')
    const hasParking = searchParams.get('has_parking')
    const hasGarden = searchParams.get('has_garden')
    const hasTerrace = searchParams.get('has_terrace')
    const energyClass = searchParams.get('energy_class')
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('per_page') || '20')
    const sort = searchParams.get('sort') || 'newest'

    let query = supabaseAdmin
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('status', 'active')

    if (city) query = query.ilike('city', `%${city}%`)
    if (listingType) query = query.eq('listing_type', listingType)
    if (priceMin) query = query.gte('price', parseFloat(priceMin))
    if (priceMax) query = query.lte('price', parseFloat(priceMax))
    if (roomsMin) query = query.gte('rooms', parseInt(roomsMin))
    if (surfaceMin) query = query.gte('surface_sqm', parseInt(surfaceMin))
    if (propertyType) query = query.eq('property_type', propertyType)
    if (hasElevator === 'true') query = query.eq('has_elevator', true)
    if (hasParking === 'true') query = query.eq('has_parking', true)
    if (hasGarden === 'true') query = query.eq('has_garden', true)
    if (hasTerrace === 'true') query = query.eq('has_terrace', true)
    if (energyClass) query = query.eq('energy_class', energyClass)

    // Sorting
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'surface_desc':
        query = query.order('surface_sqm', { ascending: false })
        break
      default:
        query = query
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
    }

    query = query.range((page - 1) * perPage, page * perPage - 1)

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

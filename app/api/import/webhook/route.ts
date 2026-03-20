import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    // Verifica secret header per sicurezza
    const secret = request.headers.get('x-scraper-secret')
    if (secret !== process.env.SCRAPER_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { job_id, agency_id, listings, status, error } = body

    if (status === 'error') {
      await supabaseAdmin
        .from('import_jobs')
        .update({
          status: 'failed' as const,
          errors: [{ reason: error }],
          completed_at: new Date().toISOString(),
        })
        .eq('id', job_id)
      return NextResponse.json({ ok: true })
    }

    if (!Array.isArray(listings) || listings.length === 0) {
      return NextResponse.json({ error: 'No listings provided' }, { status: 400 })
    }

    // Inserisci listings nel DB
    let imported = 0
    const errors: Array<{ title: string; reason: string }> = []

    for (const listing of listings) {
      try {
        const { error: insertError } = await supabaseAdmin
          .from('listings')
          .upsert(
            {
              agency_id,
              title: listing.title,
              listing_type: listing.listing_type || 'sale',
              property_type: listing.property_type || 'apartment',
              price: listing.price,
              address: listing.address,
              city: listing.city,
              province: listing.province || '',
              surface_sqm: listing.surface_sqm,
              rooms: listing.rooms,
              floor: listing.floor,
              has_elevator: listing.has_elevator || false,
              has_parking: listing.has_parking || false,
              has_garden: listing.has_garden || false,
              has_terrace: listing.has_terrace || false,
              description: listing.description,
              photos: listing.photos || [],
              lat: listing.lat,
              lng: listing.lng,
              status: 'active',
              slug: listing.source_id || `scraper-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              price_per_sqm: listing.surface_sqm ? Math.round(listing.price / listing.surface_sqm) : null,
              published_at: new Date().toISOString(),
            },
            { onConflict: 'slug', ignoreDuplicates: false }
          )

        if (insertError) {
          errors.push({ title: listing.title, reason: insertError.message })
        } else {
          imported++
        }
      } catch (e: unknown) {
        errors.push({ title: listing.title || 'unknown', reason: String(e) })
      }
    }

    // Aggiorna job con risultati
    await supabaseAdmin
      .from('import_jobs')
      .update({
        status:
          errors.length > 0 && imported === 0
            ? ('failed' as const)
            : errors.length > 0
              ? ('completed' as const)
              : ('completed' as const),
        imported_items: imported,
        total_items: listings.length,
        errors,
        completed_at: new Date().toISOString(),
      })
      .eq('id', job_id)

    return NextResponse.json({ ok: true, imported, errors: errors.length })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Errore webhook'
    console.error('[import/webhook]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

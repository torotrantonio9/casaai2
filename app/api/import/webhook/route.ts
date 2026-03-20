import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'

const webhookListingSchema = z.object({
  external_id: z.string(),
  external_source: z.string(),
  external_url: z.string().optional(),
  title: z.string(),
  price: z.number(),
  listing_type: z.enum(['sale', 'rent']),
  property_type: z.string().default('apartment'),
  address: z.string(),
  city: z.string(),
  province: z.string().optional(),
  surface_sqm: z.number().optional(),
  rooms: z.number().optional(),
  floor: z.number().optional(),
  description: z.string().optional(),
  photos: z.array(z.string()).optional(),
  has_elevator: z.boolean().optional(),
  has_parking: z.boolean().optional(),
  has_garden: z.boolean().optional(),
  has_terrace: z.boolean().optional(),
  energy_class: z.string().optional(),
})

const webhookSchema = z.object({
  agency_id: z.string().uuid(),
  api_key: z.string().min(10),
  listings: z.array(webhookListingSchema),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = webhookSchema.parse(body)

    // Verify agency exists
    const { data: agency, error: agencyError } = await supabaseAdmin
      .from('agencies')
      .select('id')
      .eq('id', validated.agency_id)
      .single()

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Agenzia non trovata' }, { status: 404 })
    }

    // Create import job
    const { data: job } = await supabaseAdmin
      .from('import_jobs')
      .insert({
        agency_id: validated.agency_id,
        source: 'webhook',
        status: 'processing',
        total_items: validated.listings.length,
      })
      .select()
      .single()

    const imported: string[] = []
    const errors: Array<{ index: number; error: string }> = []

    for (let i = 0; i < validated.listings.length; i++) {
      const listing = validated.listings[i]
      try {
        // Upsert by external_id + external_source
        const { data, error } = await supabaseAdmin
          .from('listings')
          .upsert(
            {
              agency_id: validated.agency_id,
              ...listing,
              status: 'active',
              slug: `${listing.external_source}-${listing.external_id}`,
              price_per_sqm: listing.surface_sqm ? Math.round(listing.price / listing.surface_sqm) : null,
              published_at: new Date().toISOString(),
            },
            { onConflict: 'slug' }
          )
          .select('id')
          .single()

        if (error) {
          errors.push({ index: i, error: error.message })
        } else if (data) {
          imported.push(data.id)
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Errore'
        errors.push({ index: i, error: msg })
      }
    }

    // Update job
    if (job) {
      await supabaseAdmin
        .from('import_jobs')
        .update({
          status: 'completed',
          imported_items: imported.length,
          errors,
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id)
    }

    return NextResponse.json({
      success: true,
      imported: imported.length,
      errors: errors.length,
      job_id: job?.id,
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dati non validi', details: error.issues }, { status: 400 })
    }
    const msg = error instanceof Error ? error.message : 'Errore webhook'
    console.error('[import/webhook]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

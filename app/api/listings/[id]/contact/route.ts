import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'

const contactSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().optional(),
  source: z.enum(['chat', 'form', 'phone', 'whatsapp', 'email', 'portal', 'other']).default('form'),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validated = contactSchema.parse(body)

    // Get listing to find agency_id
    const { data: listing, error: listingError } = await supabaseAdmin
      .from('listings')
      .select('id, agency_id, title')
      .eq('id', id)
      .single()

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Annuncio non trovato' }, { status: 404 })
    }

    // Create lead
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .insert({
        listing_id: id,
        agency_id: listing.agency_id,
        full_name: validated.full_name,
        email: validated.email,
        phone: validated.phone || null,
        message: validated.message || null,
        source: validated.source,
        status: 'new',
      })
      .select()
      .single()

    if (leadError) {
      return NextResponse.json({ error: leadError.message }, { status: 500 })
    }

    // Increment contacts count
    await supabaseAdmin
      .from('listings')
      .update({ contacts_count: (listing as Record<string, unknown>).contacts_count as number + 1 || 1 })
      .eq('id', id)

    return NextResponse.json({ data: lead }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dati non validi', details: error.issues }, { status: 400 })
    }
    const msg = error instanceof Error ? error.message : 'Errore sconosciuto'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

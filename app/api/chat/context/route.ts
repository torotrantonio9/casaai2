import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'

const contextSchema = z.object({
  session_id: z.string().min(1),
  intent: z.enum(['sale', 'rent']).optional(),
  who_is_searching: z.enum(['solo', 'coppia', 'famiglia', 'investimento']).optional(),
  rooms_needed: z.number().min(1).max(4).optional(),
  smart_working: z.boolean().optional(),
  budget_max: z.number().positive().optional(),
  location_label: z.string().optional(),
  location_lat: z.number().optional(),
  location_lng: z.number().optional(),
  max_distance_km: z.number().optional(),
  must_have: z.array(z.string()).optional(),
  custom_note: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = contextSchema.parse(body)

    const { data, error } = await supabaseAdmin
      .from('chat_contexts')
      .upsert(
        {
          session_id: validated.session_id,
          intent: validated.intent,
          who_is_searching: validated.who_is_searching,
          rooms_needed: validated.rooms_needed,
          smart_working: validated.smart_working ?? false,
          budget_max: validated.budget_max,
          location_label: validated.location_label,
          location_lat: validated.location_lat,
          location_lng: validated.location_lng,
          max_distance_km: validated.max_distance_km,
          must_have: validated.must_have ?? [],
          custom_note: validated.custom_note ?? '',
        },
        { onConflict: 'session_id' }
      )
      .select('id, session_id')
      .single()

    if (error) {
      console.error('[chat/context]', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      context_id: data.id,
      session_id: data.session_id,
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dati non validi', details: error.issues },
        { status: 400 }
      )
    }
    const msg = error instanceof Error ? error.message : 'Errore sconosciuto'
    console.error('[chat/context]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

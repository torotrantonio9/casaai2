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

    // Build insert object — only include fields we know exist
    const insertData: Record<string, unknown> = {
      session_id: validated.session_id,
    }

    if (validated.intent !== undefined) insertData.intent = validated.intent
    if (validated.who_is_searching !== undefined) insertData.who_is_searching = validated.who_is_searching
    if (validated.rooms_needed !== undefined) insertData.rooms_needed = validated.rooms_needed
    if (validated.budget_max !== undefined) insertData.budget_max = validated.budget_max
    if (validated.location_label !== undefined) insertData.location_label = validated.location_label
    if (validated.location_lat !== undefined) insertData.location_lat = validated.location_lat
    if (validated.location_lng !== undefined) insertData.location_lng = validated.location_lng
    if (validated.max_distance_km !== undefined) insertData.max_distance_km = validated.max_distance_km
    if (validated.must_have !== undefined) insertData.must_have = validated.must_have

    // Check if session already exists
    const { data: existing } = await supabaseAdmin
      .from('chat_contexts')
      .select('id, session_id')
      .eq('session_id', validated.session_id)
      .single()

    if (existing) {
      // Update existing context
      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('chat_contexts')
        .update(insertData)
        .eq('id', existing.id)
        .select('id, session_id')
        .single()

      if (updateErr) {
        console.error('[chat/context] update error:', updateErr.message)
        return NextResponse.json({ error: updateErr.message }, { status: 500 })
      }

      return NextResponse.json({
        context_id: updated.id,
        session_id: updated.session_id,
      })
    }

    // Insert new context
    const { data, error } = await supabaseAdmin
      .from('chat_contexts')
      .insert(insertData)
      .select('id, session_id')
      .single()

    if (error) {
      console.error('[chat/context] insert error:', error.message)
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

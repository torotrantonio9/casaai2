import { NextResponse } from 'next/server'
import { z } from 'zod'
import { askJSON } from '@/lib/ai/claude'
import { SYSTEM_PROMPT_LEAD_SCORING } from '@/lib/ai/prompts'

const scoreSchema = z.object({
  full_name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  message: z.string().optional(),
  listing_title: z.string().optional(),
  listing_price: z.number().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = scoreSchema.parse(body)

    const prompt = `Analizza questo lead immobiliare:
Nome: ${validated.full_name}
Email: ${validated.email}
Telefono: ${validated.phone || 'non fornito'}
Messaggio: ${validated.message || 'nessun messaggio'}
Annuncio: ${validated.listing_title || 'N/D'}
Prezzo annuncio: €${validated.listing_price?.toLocaleString('it-IT') || 'N/D'}`

    const result = await askJSON<{ score: number; reason: string }>(prompt, SYSTEM_PROMPT_LEAD_SCORING)

    return NextResponse.json({
      data: {
        score: Math.max(0, Math.min(100, result.score)),
        reason: result.reason,
      },
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dati non validi', details: error.issues }, { status: 400 })
    }
    const msg = error instanceof Error ? error.message : 'Errore scoring'
    console.error('[ai/score-lead]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

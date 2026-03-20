import { NextResponse } from 'next/server'
import { z } from 'zod'
import { askJSON } from '@/lib/ai/claude'
import { SYSTEM_PROMPT_DRAFT_REPLY } from '@/lib/ai/prompts'

const draftSchema = z.object({
  lead_name: z.string(),
  lead_message: z.string(),
  listing_title: z.string(),
  listing_price: z.number().optional(),
  listing_city: z.string().optional(),
  tone: z.enum(['professional', 'warm', 'urgent']).default('professional'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = draftSchema.parse(body)

    const toneMap: Record<string, string> = {
      professional: 'Tono professionale e formale',
      warm: 'Tono cordiale e amichevole',
      urgent: 'Tono urgente, sottolinea disponibilità limitata',
    }

    const prompt = `Scrivi una bozza di risposta per questo lead:
Nome cliente: ${validated.lead_name}
Messaggio ricevuto: "${validated.lead_message}"
Annuncio: ${validated.listing_title}
Prezzo: €${validated.listing_price?.toLocaleString('it-IT') || 'N/D'}
Città: ${validated.listing_city || 'N/D'}

${toneMap[validated.tone]}

Ritorna un JSON con campo "reply" contenente SOLO il testo della risposta.`

    const result = await askJSON<{ reply: string }>(prompt, SYSTEM_PROMPT_DRAFT_REPLY + '\nRitorna un JSON con campo "reply".')
    return NextResponse.json({ data: { reply: result.reply } })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dati non validi', details: error.issues }, { status: 400 })
    }
    const msg = error instanceof Error ? error.message : 'Errore generazione bozza'
    console.error('[ai/draft-reply]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

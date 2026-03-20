import { NextResponse } from 'next/server'
import { z } from 'zod'
import { askJSON } from '@/lib/ai/claude'
import { SYSTEM_PROMPT_DESCRIPTION } from '@/lib/ai/prompts'

const descriptionSchema = z.object({
  title: z.string(),
  property_type: z.string(),
  listing_type: z.string(),
  city: z.string(),
  zone: z.string().optional(),
  surface_sqm: z.number().optional(),
  rooms: z.number().optional(),
  floor: z.number().optional(),
  energy_class: z.string().optional(),
  has_elevator: z.boolean().optional(),
  has_parking: z.boolean().optional(),
  has_garden: z.boolean().optional(),
  has_terrace: z.boolean().optional(),
  price: z.number().optional(),
  tone: z.enum(['professional', 'warm', 'luxury']).default('professional'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = descriptionSchema.parse(body)

    const toneMap: Record<string, string> = {
      professional: 'Tono professionale e informativo',
      warm: 'Tono cordiale e accogliente',
      luxury: 'Tono elegante e raffinato per immobili di pregio',
    }

    const prompt = `Genera una descrizione per questo annuncio immobiliare:
Titolo: ${validated.title}
Tipo: ${validated.property_type} in ${validated.listing_type === 'sale' ? 'vendita' : 'affitto'}
Città: ${validated.city}${validated.zone ? `, zona ${validated.zone}` : ''}
Superficie: ${validated.surface_sqm || 'N/D'}mq
Locali: ${validated.rooms || 'N/D'}
Piano: ${validated.floor ?? 'N/D'}
Classe energetica: ${validated.energy_class || 'N/D'}
Ascensore: ${validated.has_elevator ? 'Sì' : 'No'}
Posto auto: ${validated.has_parking ? 'Sì' : 'No'}
Giardino: ${validated.has_garden ? 'Sì' : 'No'}
Terrazzo: ${validated.has_terrace ? 'Sì' : 'No'}
Prezzo: €${validated.price?.toLocaleString('it-IT') || 'N/D'}

${toneMap[validated.tone]}

Ritorna un JSON con campo "description" contenente SOLO il testo della descrizione.`

    const result = await askJSON<{ description: string }>(prompt, SYSTEM_PROMPT_DESCRIPTION + '\nRitorna un JSON con campo "description".')
    return NextResponse.json({ data: { description: result.description } })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dati non validi', details: error.issues }, { status: 400 })
    }
    const msg = error instanceof Error ? error.message : 'Errore generazione descrizione'
    console.error('[ai/generate-description]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

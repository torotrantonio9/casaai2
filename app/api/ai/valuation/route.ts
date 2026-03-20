import { NextResponse } from 'next/server'
import { z } from 'zod'
import { evaluateProperty } from '@/lib/ai/valuation'

const valuationSchema = z.object({
  city: z.string().min(2),
  zone: z.string().optional(),
  property_type: z.string().default('apartment'),
  surface_sqm: z.number().positive(),
  rooms: z.number().min(1),
  floor: z.number().optional(),
  total_floors: z.number().optional(),
  year_built: z.number().optional(),
  energy_class: z.string().optional(),
  has_elevator: z.boolean().optional(),
  has_parking: z.boolean().optional(),
  has_garden: z.boolean().optional(),
  has_terrace: z.boolean().optional(),
  has_balcony: z.boolean().optional(),
  condition: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = valuationSchema.parse(body)
    const result = await evaluateProperty(validated)
    return NextResponse.json({ data: result })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dati non validi', details: error.issues }, { status: 400 })
    }
    const msg = error instanceof Error ? error.message : 'Errore valutazione'
    console.error('[ai/valuation]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

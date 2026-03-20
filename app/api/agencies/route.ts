import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'

const agencySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().optional(),
  vat_number: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (slug) {
      const { data, error } = await supabaseAdmin
        .from('agencies')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !data) {
        return NextResponse.json({ error: 'Agenzia non trovata' }, { status: 404 })
      }
      return NextResponse.json({ data })
    }

    const { data, error } = await supabaseAdmin
      .from('agencies')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Errore sconosciuto'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = agencySchema.parse(body)

    const { data, error } = await supabaseAdmin
      .from('agencies')
      .insert(validated)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dati non validi', details: error.issues }, { status: 400 })
    }
    const msg = error instanceof Error ? error.message : 'Errore sconosciuto'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

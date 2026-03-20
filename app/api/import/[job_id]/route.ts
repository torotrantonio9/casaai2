import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ job_id: string }> }
) {
  try {
    const { job_id } = await params

    const { data, error } = await supabaseAdmin
      .from('import_jobs')
      .select('*')
      .eq('id', job_id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Job non trovato' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Errore sconosciuto'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

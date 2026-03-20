import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { source_url, source } = await request.json()

    if (!source_url || !source) {
      return NextResponse.json({ error: 'source_url e source richiesti' }, { status: 400 })
    }

    // Verifica che l'utente sia loggato
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Server Component — ignore
            }
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Trova l'agenzia dell'utente
    const { data: agency } = await supabaseAdmin
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!agency) {
      return NextResponse.json({ error: 'Agenzia non trovata' }, { status: 404 })
    }

    // Crea job
    const { data: job, error: jobError } = await supabaseAdmin
      .from('import_jobs')
      .insert({
        agency_id: agency.id,
        source,
        status: 'pending' as const,
        metadata: { source_url },
      })
      .select()
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: jobError?.message || 'Errore creazione job' }, { status: 500 })
    }

    // Notifica il server Railway scraper
    const scraperUrl = process.env.SCRAPER_SERVICE_URL
    if (scraperUrl) {
      fetch(`${scraperUrl}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-scraper-secret': process.env.SCRAPER_WEBHOOK_SECRET || '',
        },
        body: JSON.stringify({
          job_id: job.id,
          agency_id: agency.id,
          source_url,
          source,
          webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/import/webhook`,
        }),
      }).catch((err) => console.error('[import/scrape] Failed to notify scraper:', err))
    }

    return NextResponse.json({ job_id: job.id, status: 'pending' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Errore import'
    console.error('[import/scrape]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

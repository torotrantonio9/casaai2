import { NextResponse } from 'next/server'
import Papa from 'papaparse'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const agencyId = formData.get('agency_id') as string | null

    if (!file || !agencyId) {
      return NextResponse.json({ error: 'File e agency_id richiesti' }, { status: 400 })
    }

    const text = await file.text()
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })

    if (parsed.errors.length > 0 && parsed.data.length === 0) {
      return NextResponse.json({ error: 'CSV non valido', details: parsed.errors }, { status: 400 })
    }

    // Create import job
    const { data: job, error: jobError } = await supabaseAdmin
      .from('import_jobs')
      .insert({
        agency_id: agencyId,
        source: 'csv',
        status: 'processing',
        total_items: parsed.data.length,
      })
      .select()
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: jobError?.message || 'Errore creazione job' }, { status: 500 })
    }

    // Column mapping (flexible)
    const columnMap: Record<string, string> = {
      titolo: 'title', title: 'title', nome: 'title',
      prezzo: 'price', price: 'price', costo: 'price',
      tipo: 'listing_type', type: 'listing_type', tipologia: 'listing_type',
      indirizzo: 'address', address: 'address', via: 'address',
      citta: 'city', city: 'city', città: 'city', comune: 'city',
      superficie: 'surface_sqm', mq: 'surface_sqm', surface: 'surface_sqm', surface_sqm: 'surface_sqm',
      locali: 'rooms', rooms: 'rooms', stanze: 'rooms', vani: 'rooms',
      piano: 'floor', floor: 'floor',
      ascensore: 'has_elevator', elevator: 'has_elevator', has_elevator: 'has_elevator',
      parcheggio: 'has_parking', parking: 'has_parking', has_parking: 'has_parking', posto_auto: 'has_parking',
      giardino: 'has_garden', garden: 'has_garden', has_garden: 'has_garden',
      terrazzo: 'has_terrace', terrace: 'has_terrace', has_terrace: 'has_terrace',
      descrizione: 'description', description: 'description',
      classe_energetica: 'energy_class', energy_class: 'energy_class', energia: 'energy_class',
      anno: 'year_built', year_built: 'year_built', anno_costruzione: 'year_built',
    }

    const imported: string[] = []
    const errors: Array<{ row: number; error: string }> = []

    for (let i = 0; i < parsed.data.length; i++) {
      try {
        const row = parsed.data[i] as Record<string, string>
        const mapped: Record<string, unknown> = { agency_id: agencyId }

        for (const [csvCol, value] of Object.entries(row)) {
          const normalizedCol = csvCol.toLowerCase().trim().replace(/\s+/g, '_')
          const dbCol = columnMap[normalizedCol]
          if (dbCol && value && value.trim()) {
            mapped[dbCol] = value.trim()
          }
        }

        // Validate required fields
        if (!mapped.title || !mapped.price || !mapped.address || !mapped.city) {
          errors.push({ row: i + 1, error: 'Campi obbligatori mancanti (titolo, prezzo, indirizzo, città)' })
          continue
        }

        // Type conversions
        mapped.price = parseFloat(String(mapped.price).replace(/[^0-9.,]/g, '').replace(',', '.'))
        if (isNaN(mapped.price as number)) {
          errors.push({ row: i + 1, error: 'Prezzo non valido' })
          continue
        }

        if (mapped.surface_sqm) mapped.surface_sqm = parseInt(String(mapped.surface_sqm))
        if (mapped.rooms) mapped.rooms = parseInt(String(mapped.rooms))
        if (mapped.floor) mapped.floor = parseInt(String(mapped.floor))
        if (mapped.year_built) mapped.year_built = parseInt(String(mapped.year_built))

        // Boolean fields
        const boolFields = ['has_elevator', 'has_parking', 'has_garden', 'has_terrace']
        for (const f of boolFields) {
          if (mapped[f]) {
            const val = String(mapped[f]).toLowerCase()
            mapped[f] = val === 'true' || val === 'si' || val === 'sì' || val === '1' || val === 'yes'
          }
        }

        // listing_type mapping
        if (mapped.listing_type) {
          const lt = String(mapped.listing_type).toLowerCase()
          if (lt.includes('affitto') || lt.includes('rent')) mapped.listing_type = 'rent'
          else mapped.listing_type = 'sale'
        } else {
          mapped.listing_type = 'sale'
        }

        // Defaults
        if (!mapped.property_type) mapped.property_type = 'apartment'
        mapped.status = 'active'
        mapped.slug = `import-${Date.now()}-${i}`

        const { data: insertedListing, error: insertError } = await supabaseAdmin
          .from('listings')
          .insert(mapped)
          .select('id')
          .single()

        if (insertError) {
          errors.push({ row: i + 1, error: insertError.message })
        } else if (insertedListing) {
          imported.push(insertedListing.id)
        }
      } catch (rowError: unknown) {
        const msg = rowError instanceof Error ? rowError.message : 'Errore riga'
        errors.push({ row: i + 1, error: msg })
      }
    }

    // Update job
    await supabaseAdmin
      .from('import_jobs')
      .update({
        status: errors.length === parsed.data.length ? 'failed' : 'completed',
        imported_items: imported.length,
        errors: errors,
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.id)

    return NextResponse.json({
      job_id: job.id,
      imported: imported.length,
      errors: errors.length,
      error_details: errors.slice(0, 20),
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Errore import'
    console.error('[import]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

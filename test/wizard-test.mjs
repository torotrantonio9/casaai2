// Simula il flusso wizard -> auto-trigger
const testFlow = async () => {
  console.log('TEST 1: Salvataggio contesto...')
  const ctxRes = await fetch('http://localhost:3000/api/chat/context', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: `test-session-${Date.now()}`,
      intent: 'sale',
      budget_max: 300000,
      location_label: 'Napoli',
      rooms_needed: 3,
      must_have: ['Ascensore'],
      who_is_searching: 'famiglia',
      smart_working: false,
      max_distance_km: 10,
    }),
  })
  const ctxData = await ctxRes.json()
  console.log(
    'Context ID:',
    ctxData.context_id ? '✅ OK' : '❌ FAIL',
    ctxData
  )

  if (!ctxData.context_id) {
    console.log('STOP: context non salvato')
    return
  }

  console.log('TEST 2: Chat con context_id...')
  const chatRes = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content:
            'Cerca immobili per acquisto, budget massimo €300.000, zona Napoli, 3 locali, con ascensore',
        },
      ],
      context_id: ctxData.context_id,
      is_auto_trigger: true,
      shown_listing_ids: [],
    }),
  })

  console.log('Chat response status:', chatRes.status)

  if (!chatRes.ok) {
    const errText = await chatRes.text()
    console.log('❌ Chat response error:', errText)
    return
  }

  const reader = chatRes.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  const events = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n\n')
    buffer = parts.pop() || ''
    for (const part of parts) {
      const line = part.trim()
      if (!line.startsWith('data: ')) continue
      const raw = line.slice(6).trim()
      if (!raw || raw === '[DONE]') continue
      try {
        const e = JSON.parse(raw)
        events.push(e.type)
        if (e.type === 'listings') {
          console.log('✅ Listings ricevuti:', e.data?.length, 'annunci')
          if (e.data?.[0]) {
            console.log(
              '  Primo annuncio:',
              e.data[0].title,
              '- €' + e.data[0].price
            )
          }
        }
        if (e.type === 'text') {
          // just count, don't spam
        }
        if (e.type === 'error') {
          console.log('⚠️ Error event:', e.message)
        }
      } catch {
        // parse error
      }
    }
  }

  console.log('Eventi SSE ricevuti:', events.join(' → '))

  const hasListings = events.includes('listings')
  const hasText = events.includes('text')
  const hasDone = events.includes('done')

  console.log('\nTEST RESULT:')
  console.log('  listings event:', hasListings ? '✅' : '❌')
  console.log('  text event:', hasText ? '✅' : '❌')
  console.log('  done event:', hasDone ? '✅' : '❌')

  if (hasListings && hasDone) {
    console.log('\n🎉 TUTTI I TEST PASSATI')
  } else {
    console.log('\n❌ ALCUNI TEST FALLITI - continua a debuggare')
  }
}

testFlow().catch(console.error)

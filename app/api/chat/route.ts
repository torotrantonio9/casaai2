import { supabaseAdmin } from '@/lib/supabase/admin'
import { detectIntent } from '@/lib/ai/intent'
import { searchListings } from '@/lib/ai/search'
import { buildSystemPrompt, generateSuggestions } from '@/lib/ai/prompts'
import { createStreamingResponse } from '@/lib/ai/claude'
import type { SSEEvent } from '@/types/chat'
import type { ChatContext } from '@/types/database'

export async function POST(request: Request) {
  const body = await request.json()
  const {
    messages,
    context_id,
    shown_listing_ids = [],
  } = body as {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
    context_id: string | null
    is_auto_trigger?: boolean
    shown_listing_ids: string[]
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: SSEEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(obj)}\n\n`)
          )
        } catch {
          // stream already closed
        }
      }

      try {
        // 1. Load context
        let context: ChatContext | null = null
        if (context_id) {
          const { data } = await supabaseAdmin
            .from('chat_contexts')
            .select('*')
            .eq('id', context_id)
            .single()
          context = data as ChatContext | null
        }

        // 2. Detect intent (claude-haiku, fast)
        const lastUserMsg =
          messages
            .filter((m: { role: string }) => m.role === 'user')
            .pop()?.content || ''

        const intentResult = await detectIntent(lastUserMsg, messages, context)

        // 3. Search listings with REAL filters
        const listings = await searchListings(
          context,
          intentResult,
          shown_listing_ids
        )

        // 4. SEND LISTINGS FIRST
        if (listings.length > 0) {
          send({ type: 'listings', data: listings })
        }

        // 5. Streaming text from Claude
        const systemPrompt = buildSystemPrompt(context, intentResult, listings)
        const claudeMessages = messages
          .filter((m: { role: string; content: string }) => m.role === 'user' || m.role === 'assistant')
          .slice(-10)
          .map((m: { role: string; content: string }) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }))

        // Ensure messages alternate correctly and start with user
        const cleanMessages: Array<{ role: 'user' | 'assistant'; content: string }> = []
        for (const msg of claudeMessages) {
          if (cleanMessages.length === 0) {
            if (msg.role === 'user') cleanMessages.push(msg)
          } else {
            const last = cleanMessages[cleanMessages.length - 1]
            if (last.role !== msg.role) {
              cleanMessages.push(msg)
            }
          }
        }

        if (cleanMessages.length === 0) {
          cleanMessages.push({ role: 'user', content: lastUserMsg || 'Mostrami gli annunci disponibili' })
        }

        const response = createStreamingResponse(cleanMessages, systemPrompt)

        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            send({ type: 'text', content: event.delta.text })
          }
        }

        // 6. Contextual quick replies
        const suggestions = generateSuggestions(intentResult, listings, context)
        send({ type: 'suggestions', data: suggestions })

        // 7. End stream
        send({ type: 'done' })
      } catch (error: unknown) {
        const msg =
          error instanceof Error ? error.message : 'Errore sconosciuto'
        console.error('[chat/route]', msg)
        send({ type: 'error', message: msg })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

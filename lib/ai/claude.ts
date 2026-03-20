import Anthropic from '@anthropic-ai/sdk'

// Validate API key at module load
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('[CasaAI] ANTHROPIC_API_KEY non configurata. Le funzionalità AI non funzioneranno.')
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export const MODELS = {
  chat: 'claude-sonnet-4-5-20250514' as const,
  fast: 'claude-haiku-4-5-20251001' as const,
}

export class AIError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'AI_ERROR',
    public readonly statusCode: number = 500
  ) {
    super(message)
    this.name = 'AIError'
  }
}

export async function* streamChat(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string
): AsyncGenerator<string> {
  try {
    const stream = anthropic.messages.stream({
      model: MODELS.chat,
      max_tokens: 300,
      system: systemPrompt,
      messages,
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text
      }
    }
  } catch (error: unknown) {
    if (error instanceof Anthropic.APIError) {
      throw new AIError(
        `Errore API Claude: ${error.message}`,
        'CLAUDE_API_ERROR',
        error.status
      )
    }
    throw new AIError(
      error instanceof Error ? error.message : 'Errore AI sconosciuto',
      'AI_UNKNOWN_ERROR'
    )
  }
}

export async function askJSON<T>(
  prompt: string,
  systemPrompt: string = 'Rispondi SEMPRE in italiano. Ritorna SOLO un oggetto JSON valido, senza testo aggiuntivo.'
): Promise<T> {
  try {
    const response = await anthropic.messages.create({
      model: MODELS.fast,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new AIError('Risposta AI non contiene JSON valido', 'INVALID_JSON')
    }
    return JSON.parse(jsonMatch[0]) as T
  } catch (error: unknown) {
    if (error instanceof AIError) throw error
    if (error instanceof Anthropic.APIError) {
      throw new AIError(
        `Errore API Claude: ${error.message}`,
        'CLAUDE_API_ERROR',
        error.status
      )
    }
    throw new AIError(
      error instanceof Error ? error.message : 'Errore AI sconosciuto',
      'AI_UNKNOWN_ERROR'
    )
  }
}

export function createStreamingResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string,
  maxTokens: number = 300
) {
  return anthropic.messages.stream({
    model: MODELS.chat,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  })
}

export { anthropic }

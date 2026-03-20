'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Send } from 'lucide-react'
import type { ChatMessage, SSEEvent } from '@/types/chat'
import ChatMessages from './ChatMessages'

interface ChatWidgetProps {
  contextId: string | null
  initialMessage?: string
}

export default function ChatWidget({ contextId, initialMessage }: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessage
      ? [
          {
            id: 'welcome',
            role: 'assistant',
            type: 'text',
            content: initialMessage,
            timestamp: new Date(),
          },
        ]
      : []
  )
  const [shownListingIds, setShownListingIds] = useState<string[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (text: string, isAutoTrigger = false) => {
      if (!text.trim() && !isAutoTrigger) return
      if (isStreaming) return

      // Add user message
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        type: 'text',
        content: text.trim(),
        timestamp: new Date(),
      }

      if (!isAutoTrigger) {
        setMessages((prev) => [...prev, userMsg])
      }
      setInput('')
      setIsStreaming(true)

      const abortController = new AbortController()
      abortRef.current = abortController

      try {
        // Build text-only messages for API
        const allMessages = isAutoTrigger
          ? [{ role: 'user' as const, content: text }]
          : [
              ...messages.filter((m) => m.type === 'text').map((m) => ({
                role: m.role,
                content: m.content,
              })),
              { role: 'user' as const, content: text },
            ]

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: allMessages,
            context_id: contextId,
            is_auto_trigger: isAutoTrigger,
            shown_listing_ids: shownListingIds,
          }),
          signal: abortController.signal,
        })

        if (!response.ok || !response.body) {
          throw new Error(`HTTP ${response.status}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let currentText = ''

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
              const event: SSEEvent = JSON.parse(raw)

              switch (event.type) {
                case 'listings': {
                  const newIds = event.data.map((l) => l.id)
                  setShownListingIds((prev) => [...prev, ...newIds])
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `listings-${Date.now()}`,
                      role: 'assistant',
                      type: 'listings',
                      content: '',
                      listings: event.data,
                      timestamp: new Date(),
                    },
                  ])
                  break
                }

                case 'text': {
                  currentText += event.content
                  setMessages((prev) => {
                    const lastMsg = prev[prev.length - 1]
                    if (lastMsg?.type === 'text' && lastMsg.role === 'assistant' && lastMsg.id.startsWith('stream-')) {
                      return [
                        ...prev.slice(0, -1),
                        { ...lastMsg, content: currentText },
                      ]
                    }
                    return [
                      ...prev,
                      {
                        id: `stream-${Date.now()}`,
                        role: 'assistant',
                        type: 'text',
                        content: currentText,
                        timestamp: new Date(),
                      },
                    ]
                  })
                  break
                }

                case 'suggestions': {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `suggestions-${Date.now()}`,
                      role: 'assistant',
                      type: 'suggestions',
                      content: '',
                      suggestions: event.data,
                      timestamp: new Date(),
                    },
                  ])
                  break
                }

                case 'error': {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `error-${Date.now()}`,
                      role: 'assistant',
                      type: 'text',
                      content: `⚠️ ${event.message}`,
                      timestamp: new Date(),
                    },
                  ])
                  break
                }

                case 'done':
                  break
              }
            } catch {
              console.warn('SSE parse error:', raw)
            }
          }
        }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        const msg = error instanceof Error ? error.message : 'Errore di connessione'
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            type: 'text',
            content: `⚠️ Si è verificato un errore: ${msg}. Riprova.`,
            timestamp: new Date(),
          },
        ])
      } finally {
        setIsStreaming(false)
      }
    },
    [messages, contextId, shownListingIds, isStreaming]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleQuickReply = (text: string) => {
    sendMessage(text)
  }

  const handleRefine = () => {
    inputRef.current?.focus()
  }

  // Auto-trigger on mount if context exists
  const autoTriggered = useRef(false)
  useEffect(() => {
    if (contextId && !autoTriggered.current) {
      autoTriggered.current = true
      const timer = setTimeout(() => {
        sendMessage('Mostrami gli annunci migliori per me', true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [contextId, sendMessage])

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 min-h-[300px] max-h-[600px]">
        <ChatMessages
          messages={messages}
          isStreaming={isStreaming}
          onQuickReply={handleQuickReply}
          onRefine={handleRefine}
        />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 p-4 border-t border-gray-100"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Scrivi cosa cerchi... es: trilocale con ascensore a Napoli"
          disabled={isStreaming}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
          style={{ color: '#111827', background: 'white' }}
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}

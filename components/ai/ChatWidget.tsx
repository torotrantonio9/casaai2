'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Send } from 'lucide-react'
import type { ChatMessage, SSEEvent } from '@/types/chat'
import ChatMessages from './ChatMessages'

interface ChatWidgetProps {
  contextId: string | null
  initialMessage?: string
  triggerMessage?: string
  onTriggerConsumed?: () => void
}

export default function ChatWidget({
  contextId,
  initialMessage,
  triggerMessage,
  onTriggerConsumed,
}: ChatWidgetProps) {
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
  // Track if a send is in progress to prevent double-sends
  const sendingRef = useRef(false)

  const sendToAPI = useCallback(
    async (text: string, isAutoTrigger = false) => {
      if (sendingRef.current) return
      if (!text.trim() && !isAutoTrigger) return

      sendingRef.current = true
      console.log('[ChatWidget] sendToAPI called:', text.slice(0, 60), 'auto:', isAutoTrigger)

      // Add user message to UI
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        type: 'text',
        content: text.trim(),
        timestamp: new Date(),
      }

      const currentMessages: Array<{ role: 'user' | 'assistant'; content: string }> = isAutoTrigger
        ? [{ role: 'user', content: text }]
        : []

      if (!isAutoTrigger) {
        setMessages((prev) => {
          const textMsgs = prev.filter((m) => m.type === 'text').map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }))
          currentMessages.push(...textMsgs, { role: 'user', content: text })
          return [...prev, userMsg]
        })
      }

      setInput('')
      setIsStreaming(true)

      const abortController = new AbortController()
      abortRef.current = abortController

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: currentMessages.length > 0
              ? currentMessages
              : [{ role: 'user', content: text }],
            context_id: contextId,
            is_auto_trigger: isAutoTrigger,
            shown_listing_ids: shownListingIds,
          }),
          signal: abortController.signal,
        })

        console.log('[ChatWidget] API response status:', response.status)

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
                  console.log('[ChatWidget] received listings:', event.data.length)
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
                  console.error('[ChatWidget] SSE error event:', event.message)
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
                  console.log('[ChatWidget] SSE done')
                  break
              }
            } catch {
              console.warn('[ChatWidget] SSE parse error:', raw.slice(0, 100))
            }
          }
        }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        const msg = error instanceof Error ? error.message : 'Errore di connessione'
        console.error('[ChatWidget] fetch error:', msg)
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
        sendingRef.current = false
      }
    },
    [contextId, shownListingIds]
  )

  // Handle triggerMessage prop — fires when parent sets a new trigger
  const lastTriggerRef = useRef('')
  useEffect(() => {
    if (triggerMessage && triggerMessage.trim() && triggerMessage !== lastTriggerRef.current) {
      lastTriggerRef.current = triggerMessage
      console.log('[ChatWidget] triggerMessage received:', triggerMessage.slice(0, 60))
      sendToAPI(triggerMessage, true)
      onTriggerConsumed?.()
    }
  }, [triggerMessage, sendToAPI, onTriggerConsumed])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendToAPI(input)
    }
  }

  const handleQuickReply = (text: string) => {
    sendToAPI(text)
  }

  const handleRefine = () => {
    inputRef.current?.focus()
  }

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

'use client'

import { useRef, useEffect } from 'react'
import type { ChatMessage } from '@/types/chat'
import ListingsBlock from './ListingsBlock'
import QuickReplies from './QuickReplies'
import TypingIndicator from './TypingIndicator'

interface ChatMessagesProps {
  messages: ChatMessage[]
  isStreaming: boolean
  onQuickReply: (text: string) => void
  onRefine: () => void
}

export default function ChatMessages({
  messages,
  isStreaming,
  onQuickReply,
  onRefine,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  return (
    <div className="flex flex-col gap-3 py-4">
      {messages.map((msg) => {
        if (msg.type === 'listings' && msg.listings) {
          return (
            <div key={msg.id} className="w-full">
              <ListingsBlock listings={msg.listings} onRefine={onRefine} />
            </div>
          )
        }

        if (msg.type === 'suggestions' && msg.suggestions) {
          return (
            <div key={msg.id} className="w-full">
              <QuickReplies suggestions={msg.suggestions} onSelect={onQuickReply} />
            </div>
          )
        }

        // Text messages
        const isUser = msg.role === 'user'
        return (
          <div
            key={msg.id}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                isUser
                  ? 'bg-[#1e40af] text-white rounded-br-md'
                  : 'bg-[#f8fafc] rounded-bl-md border border-gray-100'
              }`}
              style={!isUser ? { color: '#111827' } : undefined}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        )
      })}

      {isStreaming && (
        <div className="flex justify-start">
          <TypingIndicator />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

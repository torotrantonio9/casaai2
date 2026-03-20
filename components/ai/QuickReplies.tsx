'use client'

interface QuickRepliesProps {
  suggestions: string[]
  onSelect: (text: string) => void
}

export default function QuickReplies({ suggestions, onSelect }: QuickRepliesProps) {
  if (!suggestions.length) return null

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          onClick={() => onSelect(suggestion)}
          className="px-4 py-2 text-sm rounded-full border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all hover:shadow-sm"
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}

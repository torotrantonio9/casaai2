'use client'

export default function TypingIndicator() {
  return (
    <div className="flex gap-1.5 p-3 bg-gray-100 rounded-2xl w-fit">
      {[0, 0.2, 0.4].map((delay, i) => (
        <span
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  )
}

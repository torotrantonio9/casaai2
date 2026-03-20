'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { ListingCard } from '@/types/chat'

const TYPE_STYLES: Record<string, { bg: string; emoji: string }> = {
  apartment: { bg: 'bg-blue-100', emoji: '🏢' },
  house: { bg: 'bg-green-100', emoji: '🏠' },
  villa: { bg: 'bg-pink-100', emoji: '🏰' },
  land: { bg: 'bg-green-50', emoji: '🌿' },
  commercial: { bg: 'bg-amber-100', emoji: '🏪' },
  garage: { bg: 'bg-gray-100', emoji: '🅿️' },
  other: { bg: 'bg-gray-100', emoji: '🏗️' },
}

interface ListingsBlockProps {
  listings: ListingCard[]
  onRefine?: () => void
}

export default function ListingsBlock({ listings, onRefine }: ListingsBlockProps) {
  const router = useRouter()

  if (!listings.length) return null

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-blue-600 font-semibold">✦ Ho trovato {listings.length} immobili per te</span>
        <span className="text-xs text-gray-400">Ordinati per compatibilità</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {listings.map((listing) => {
          const typeStyle = TYPE_STYLES[listing.property_type] || TYPE_STYLES.other

          return (
            <button
              key={listing.id}
              onClick={() => router.push(`/annunci/${listing.id}`)}
              className="text-left bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
            >
              {/* Image area */}
              <div className={cn('relative h-40 flex items-center justify-center', typeStyle.bg)}>
                <span className="text-5xl">{typeStyle.emoji}</span>
                {/* Match score badge */}
                <span
                  className={cn(
                    'absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white',
                    listing.match_score >= 90
                      ? 'bg-[#166534]'
                      : listing.match_score >= 75
                        ? 'bg-[#c2410c]'
                        : 'bg-[#7c2d12]'
                  )}
                >
                  {listing.match_score}%
                </span>
              </div>

              {/* Content */}
              <div className="p-3">
                {/* Price */}
                <p className="font-bold text-lg text-[#1e40af]">
                  €{listing.price.toLocaleString('it-IT')}
                  {listing.price_period && (
                    <span className="text-sm font-normal text-gray-500">/mese</span>
                  )}
                </p>

                {/* Title */}
                <p className="font-medium text-sm truncate" style={{ color: '#111827' }}>
                  {listing.title}
                </p>

                {/* Address */}
                <p className="text-xs text-gray-500 truncate">
                  📍 {listing.address}, {listing.city}
                </p>

                {/* Details */}
                <div className="flex gap-3 mt-2 text-xs text-gray-600">
                  {listing.rooms && listing.rooms > 0 && <span>{listing.rooms} locali</span>}
                  {listing.surface_sqm && <span>{listing.surface_sqm}mq</span>}
                  {listing.floor !== undefined && listing.floor > 0 && <span>Piano {listing.floor}</span>}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {listing.has_elevator && <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-50 text-blue-700">Ascensore</span>}
                  {listing.has_parking && <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-50 text-green-700">Parcheggio</span>}
                  {listing.has_garden && <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-50 text-emerald-700">Giardino</span>}
                  {listing.has_terrace && <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-50 text-amber-700">Terrazzo</span>}
                </div>

                {/* AI reason */}
                <div className="mt-2 pl-2 border-l-2 border-blue-300">
                  <p className="text-xs text-gray-500 italic">
                    ✦ {listing.ai_reason}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {onRefine && (
        <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">Vuoi raffinare la ricerca?</span>
          <button
            onClick={onRefine}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Raffina →
          </button>
        </div>
      )}
    </div>
  )
}

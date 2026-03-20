'use client'

import Link from 'next/link'
import type { Listing } from '@/types/database'

interface ListingCardPublicProps {
  listing: Listing
}

const TYPE_EMOJI: Record<string, string> = {
  apartment: '🏢', house: '🏠', villa: '🏰', land: '🌿',
  commercial: '🏪', garage: '🅿️', other: '🏗️',
}

const TYPE_BG: Record<string, string> = {
  apartment: 'bg-blue-100', house: 'bg-green-100', villa: 'bg-pink-100',
  land: 'bg-green-50', commercial: 'bg-amber-100', garage: 'bg-gray-100', other: 'bg-gray-100',
}

export default function ListingCardPublic({ listing }: ListingCardPublicProps) {
  return (
    <Link
      href={`/annunci/${listing.id}`}
      className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Image */}
      <div className={`relative h-48 flex items-center justify-center ${TYPE_BG[listing.property_type] || 'bg-gray-100'}`}>
        <span className="text-6xl">{TYPE_EMOJI[listing.property_type] || '🏠'}</span>
        {listing.is_featured && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
            ✦ In evidenza
          </span>
        )}
        {listing.status !== 'active' && (
          <span className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
            {listing.status === 'sold' ? 'Venduto' : 'Affittato'}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="font-bold text-xl text-[#1e40af]">
          €{Number(listing.price).toLocaleString('it-IT')}
          {listing.price_period && <span className="text-sm font-normal text-gray-500">/mese</span>}
        </p>
        <h3 className="font-semibold mt-1 truncate" style={{ color: '#111827' }}>{listing.title}</h3>
        <p className="text-sm text-gray-500 mt-1">📍 {listing.address}, {listing.city}</p>

        <div className="flex gap-4 mt-3 text-sm text-gray-600">
          {listing.rooms && listing.rooms > 0 && <span>{listing.rooms} locali</span>}
          {listing.surface_sqm && <span>{listing.surface_sqm} mq</span>}
          {listing.floor !== null && listing.floor !== undefined && listing.floor > 0 && <span>Piano {listing.floor}</span>}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {listing.has_elevator && <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700">Ascensore</span>}
          {listing.has_parking && <span className="px-2 py-0.5 text-xs rounded-full bg-green-50 text-green-700">Parcheggio</span>}
          {listing.has_garden && <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700">Giardino</span>}
          {listing.has_terrace && <span className="px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-700">Terrazzo</span>}
        </div>
      </div>
    </Link>
  )
}

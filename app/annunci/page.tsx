'use client'

import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ListingCardPublic from '@/components/listings/ListingCardPublic'
import type { Listing } from '@/types/database'

export default function AnnunciPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    city: '',
    listing_type: '',
    price_max: '',
  })

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), per_page: '12' })
      if (filters.city) params.set('city', filters.city)
      if (filters.listing_type) params.set('listing_type', filters.listing_type)
      if (filters.price_max) params.set('price_max', filters.price_max)

      const res = await fetch(`/api/listings/search?${params}`)
      const data = await res.json()
      setListings(data.data || [])
      setTotalPages(data.total_pages || 1)
    } catch {
      console.error('Error fetching listings')
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-bold mb-6" style={{ color: '#111827' }}>Tutti gli annunci</h1>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-8 p-4 bg-white rounded-xl border border-gray-200">
            <select
              value={filters.listing_type}
              onChange={(e) => { setFilters({ ...filters, listing_type: e.target.value }); setPage(1) }}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm"
              style={{ color: '#111827', background: 'white' }}
            >
              <option value="">Tutti i tipi</option>
              <option value="sale">Vendita</option>
              <option value="rent">Affitto</option>
            </select>
            <input
              type="text"
              placeholder="Città..."
              value={filters.city}
              onChange={(e) => { setFilters({ ...filters, city: e.target.value }); setPage(1) }}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm"
              style={{ color: '#111827', background: 'white' }}
            />
            <input
              type="number"
              placeholder="Prezzo max..."
              value={filters.price_max}
              onChange={(e) => { setFilters({ ...filters, price_max: e.target.value }); setPage(1) }}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm w-40"
              style={{ color: '#111827', background: 'white' }}
            />
            <button
              onClick={() => { setFilters({ city: '', listing_type: '', price_max: '' }); setPage(1) }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Reset filtri
            </button>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 h-80 animate-pulse" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-2xl mb-2">🏠</p>
              <p className="text-gray-500">Nessun annuncio trovato. Prova a modificare i filtri.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCardPublic key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
                style={{ color: '#111827' }}
              >
                ← Precedente
              </button>
              <span className="px-4 py-2 text-sm text-gray-500">
                Pagina {page} di {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
                style={{ color: '#111827' }}
              >
                Successiva →
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

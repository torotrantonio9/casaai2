'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/layout/Navbar'
import ListingCardPublic from '@/components/listings/ListingCardPublic'
import type { Listing } from '@/types/database'

const MapComponent = dynamic(
  () => import('@/components/listings/ListingMap'),
  { ssr: false, loading: () => <div className="h-full bg-gray-100 animate-pulse rounded-xl" /> }
)

const CITIES = ['Napoli', 'Salerno', 'Caserta', 'Avellino', 'Benevento', 'Pozzuoli', 'Sorrento', 'Ischia']
const ENERGY_CLASSES = ['A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G']

export default function CercaPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    listing_type: '', city: '', price_min: '', price_max: '',
    rooms_min: '', surface_min: '', property_type: '',
    has_elevator: false, has_parking: false, has_garden: false, has_terrace: false,
    energy_class: '', sort: 'newest',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), per_page: '12' })
      Object.entries(filters).forEach(([k, v]) => {
        if (v && v !== '') params.set(k, String(v))
      })
      const res = await fetch(`/api/listings/search?${params}`)
      const data = await res.json()
      setListings(data.data || [])
      setTotalPages(data.total_pages || 1)
    } catch { /* empty */ } finally { setLoading(false) }
  }, [page, filters])

  useEffect(() => { fetchData() }, [fetchData])

  const mapListings = listings
    .filter((l) => l.lat && l.lng)
    .map((l) => ({ id: l.id, title: l.title, price: Number(l.price), lat: l.lat!, lng: l.lng!, city: l.city }))

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#111827' }}>Cerca immobili</h1>
          <div className="grid lg:grid-cols-[280px_1fr_350px] gap-6">
            {/* Sidebar Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 h-fit space-y-4 lg:sticky lg:top-20">
              <h2 className="font-semibold" style={{ color: '#111827' }}>Filtri</h2>

              <div>
                <label htmlFor="search_type" className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
                <select id="search_type" value={filters.listing_type} onChange={(e) => setFilters({ ...filters, listing_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" style={{ color: '#111827', background: 'white' }}>
                  <option value="">Tutti</option>
                  <option value="sale">Vendita</option>
                  <option value="rent">Affitto</option>
                </select>
              </div>

              <div>
                <label htmlFor="search_city" className="block text-xs font-medium text-gray-500 mb-1">Città</label>
                <select id="search_city" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" style={{ color: '#111827', background: 'white' }}>
                  <option value="">Tutte</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="price_min" className="block text-xs font-medium text-gray-500 mb-1">Prezzo min</label>
                  <input id="price_min" type="number" value={filters.price_min} onChange={(e) => setFilters({ ...filters, price_min: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" style={{ color: '#111827', background: 'white' }} placeholder="€" />
                </div>
                <div>
                  <label htmlFor="price_max" className="block text-xs font-medium text-gray-500 mb-1">Prezzo max</label>
                  <input id="price_max" type="number" value={filters.price_max} onChange={(e) => setFilters({ ...filters, price_max: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" style={{ color: '#111827', background: 'white' }} placeholder="€" />
                </div>
              </div>

              <div>
                <label htmlFor="rooms_min" className="block text-xs font-medium text-gray-500 mb-1">Locali min</label>
                <input id="rooms_min" type="number" min="1" max="10" value={filters.rooms_min} onChange={(e) => setFilters({ ...filters, rooms_min: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" style={{ color: '#111827', background: 'white' }} />
              </div>

              <div>
                <label htmlFor="surface_min" className="block text-xs font-medium text-gray-500 mb-1">Superficie min (mq)</label>
                <input id="surface_min" type="number" value={filters.surface_min} onChange={(e) => setFilters({ ...filters, surface_min: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" style={{ color: '#111827', background: 'white' }} />
              </div>

              <div>
                <label htmlFor="energy" className="block text-xs font-medium text-gray-500 mb-1">Classe energetica</label>
                <select id="energy" value={filters.energy_class} onChange={(e) => setFilters({ ...filters, energy_class: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" style={{ color: '#111827', background: 'white' }}>
                  <option value="">Tutte</option>
                  {ENERGY_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500">Caratteristiche</p>
                {[
                  { key: 'has_elevator' as const, label: 'Ascensore' },
                  { key: 'has_parking' as const, label: 'Posto auto' },
                  { key: 'has_garden' as const, label: 'Giardino' },
                  { key: 'has_terrace' as const, label: 'Terrazzo' },
                ].map((f) => (
                  <label key={f.key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={filters[f.key]} onChange={(e) => setFilters({ ...filters, [f.key]: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600" />
                    <span style={{ color: '#111827' }}>{f.label}</span>
                  </label>
                ))}
              </div>

              <button onClick={() => setFilters({ listing_type: '', city: '', price_min: '', price_max: '', rooms_min: '', surface_min: '', property_type: '', has_elevator: false, has_parking: false, has_garden: false, has_terrace: false, energy_class: '', sort: 'newest' })}
                className="w-full text-sm text-gray-500 hover:text-blue-600 py-2">
                Reset filtri
              </button>
            </div>

            {/* Results */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">{loading ? 'Caricamento...' : `${listings.length} risultati`}</p>
                <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm" style={{ color: '#111827', background: 'white' }}>
                  <option value="newest">Più recenti</option>
                  <option value="price_asc">Prezzo crescente</option>
                  <option value="price_desc">Prezzo decrescente</option>
                  <option value="surface_desc">Superficie</option>
                </select>
              </div>

              {loading ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-72 bg-white rounded-xl animate-pulse border border-gray-200" />)}
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="text-gray-500">Nessun risultato. Prova a modificare i filtri.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {listings.map((l) => <ListingCardPublic key={l.id} listing={l} />)}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50" style={{ color: '#111827' }}>←</button>
                  <span className="px-4 py-2 text-sm text-gray-500">{page}/{totalPages}</span>
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50" style={{ color: '#111827' }}>→</button>
                </div>
              )}
            </div>

            {/* Map */}
            <div className="hidden lg:block">
              <div className="sticky top-20 h-[calc(100vh-120px)] rounded-xl overflow-hidden border border-gray-200">
                <MapComponent listings={mapListings} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

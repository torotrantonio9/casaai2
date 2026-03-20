'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ErrorBoundary from '@/components/ErrorBoundary'
import type { Listing } from '@/types/database'
import { MapPin, Home, Calendar, Zap, ArrowLeft, Phone, Mail, ExternalLink } from 'lucide-react'

const TYPE_EMOJI: Record<string, string> = {
  apartment: '🏢', house: '🏠', villa: '🏰', land: '🌿',
  commercial: '🏪', garage: '🅿️', other: '🏗️',
}

export default function ListingDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [contactForm, setContactForm] = useState({ full_name: '', email: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/listings/${id}`)
        const json = await res.json()
        setListing(json.data)
      } catch {
        console.error('Error loading listing')
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactForm.full_name || !contactForm.email) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/listings/${id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })
      if (res.ok) setSubmitted(true)
    } catch {
      console.error('Error submitting contact')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3" />
              <div className="h-64 bg-gray-200 rounded-xl" />
              <div className="h-32 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!listing) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-gray-50 flex items-center justify-center py-16">
          <div className="text-center">
            <p className="text-4xl mb-4">🏠</p>
            <p className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>Annuncio non trovato</p>
            <Link href="/annunci" className="text-blue-600 hover:underline">← Torna agli annunci</Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/annunci" className="hover:text-blue-600">Annunci</Link>
            <span>/</span>
            <span style={{ color: '#111827' }}>{listing.title}</span>
          </div>

          <Link href="/annunci" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> Torna agli annunci
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image */}
              <div className={`h-80 rounded-2xl flex items-center justify-center ${listing.property_type === 'apartment' ? 'bg-blue-100' : listing.property_type === 'villa' ? 'bg-pink-100' : 'bg-green-100'}`}>
                <span className="text-8xl">{TYPE_EMOJI[listing.property_type] || '🏠'}</span>
              </div>

              {/* Title & Price */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#111827' }}>{listing.title}</h1>
                    <p className="text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" /> {listing.address}, {listing.city} {listing.province && `(${listing.province})`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-[#1e40af]">
                      €{Number(listing.price).toLocaleString('it-IT')}
                    </p>
                    {listing.price_period && <p className="text-sm text-gray-500">/mese</p>}
                    {listing.price_per_sqm && (
                      <p className="text-sm text-gray-400">€{Number(listing.price_per_sqm).toLocaleString('it-IT')}/mq</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Features grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {listing.rooms && listing.rooms > 0 && (
                  <div className="p-4 bg-white rounded-xl border border-gray-200 text-center">
                    <Home className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <p className="font-semibold" style={{ color: '#111827' }}>{listing.rooms}</p>
                    <p className="text-xs text-gray-500">Locali</p>
                  </div>
                )}
                {listing.surface_sqm && (
                  <div className="p-4 bg-white rounded-xl border border-gray-200 text-center">
                    <span className="text-blue-600 text-lg block mb-1">📐</span>
                    <p className="font-semibold" style={{ color: '#111827' }}>{listing.surface_sqm} mq</p>
                    <p className="text-xs text-gray-500">Superficie</p>
                  </div>
                )}
                {listing.floor !== null && listing.floor !== undefined && (
                  <div className="p-4 bg-white rounded-xl border border-gray-200 text-center">
                    <span className="text-blue-600 text-lg block mb-1">🏗️</span>
                    <p className="font-semibold" style={{ color: '#111827' }}>Piano {listing.floor}</p>
                    <p className="text-xs text-gray-500">{listing.total_floors ? `di ${listing.total_floors}` : ''}</p>
                  </div>
                )}
                {listing.energy_class && listing.energy_class !== 'pending' && (
                  <div className="p-4 bg-white rounded-xl border border-gray-200 text-center">
                    <Zap className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <p className="font-semibold" style={{ color: '#111827' }}>Classe {listing.energy_class}</p>
                    <p className="text-xs text-gray-500">Energia</p>
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-lg mb-4" style={{ color: '#111827' }}>Caratteristiche</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { check: listing.has_elevator, label: '🛗 Ascensore' },
                    { check: listing.has_parking, label: '🚗 Posto auto' },
                    { check: listing.has_garden, label: '🌿 Giardino' },
                    { check: listing.has_terrace, label: '🏖 Terrazzo' },
                    { check: listing.has_balcony, label: '🌅 Balcone' },
                    { check: listing.has_cellar, label: '📦 Cantina' },
                    { check: listing.has_air_conditioning, label: '❄️ Aria condizionata' },
                    { check: listing.has_heating, label: '🔥 Riscaldamento' },
                    { check: listing.is_furnished, label: '🛋️ Arredato' },
                    { check: listing.pet_friendly, label: '🐕 Pet friendly' },
                    { check: listing.is_accessible, label: '♿ Accessibile' },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-2 text-sm ${item.check ? '' : 'opacity-30'}`}>
                      <span>{item.check ? '✓' : '✗'}</span>
                      <span style={{ color: '#111827' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              {(listing.ai_description || listing.description) && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-semibold text-lg mb-4" style={{ color: '#111827' }}>
                    Descrizione
                    {listing.ai_description && <span className="ml-2 px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded-full">AI</span>}
                  </h2>
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {listing.ai_description || listing.description}
                  </p>
                </div>
              )}

              {/* Year & Additional info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-lg mb-4" style={{ color: '#111827' }}>Dettagli</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {listing.year_built && listing.year_built > 0 && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Anno:</span>
                      <span style={{ color: '#111827' }}>{listing.year_built}</span>
                    </div>
                  )}
                  {listing.bathrooms > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">🚿</span>
                      <span className="text-gray-500">Bagni:</span>
                      <span style={{ color: '#111827' }}>{listing.bathrooms}</span>
                    </div>
                  )}
                  {listing.condominium_fees && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">💶</span>
                      <span className="text-gray-500">Spese condominiali:</span>
                      <span style={{ color: '#111827' }}>€{Number(listing.condominium_fees).toLocaleString('it-IT')}/mese</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">👁</span>
                    <span className="text-gray-500">Visualizzazioni:</span>
                    <span style={{ color: '#111827' }}>{listing.views_count}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact form */}
              <ErrorBoundary>
                <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                  <h2 className="font-semibold text-lg mb-4" style={{ color: '#111827' }}>Contatta l&apos;agenzia</h2>

                  {submitted ? (
                    <div className="text-center py-6">
                      <p className="text-3xl mb-2">✅</p>
                      <p className="font-semibold" style={{ color: '#111827' }}>Richiesta inviata!</p>
                      <p className="text-sm text-gray-500 mt-1">L&apos;agenzia ti contatterà al più presto.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleContact} className="space-y-4">
                      <div>
                        <label htmlFor="full_name" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Nome e Cognome *</label>
                        <input
                          id="full_name"
                          type="text"
                          required
                          value={contactForm.full_name}
                          onChange={(e) => setContactForm({ ...contactForm, full_name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ color: '#111827', background: 'white' }}
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Email *</label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ color: '#111827', background: 'white' }}
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Telefono</label>
                        <input
                          id="phone"
                          type="tel"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ color: '#111827', background: 'white' }}
                        />
                      </div>
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Messaggio</label>
                        <textarea
                          id="message"
                          rows={3}
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          placeholder="Sono interessato/a a questo immobile..."
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          style={{ color: '#111827', background: 'white' }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {submitting ? 'Invio in corso...' : 'Invia richiesta'}
                      </button>
                    </form>
                  )}

                  {/* Quick contact */}
                  <div className="mt-4 flex gap-2">
                    <a
                      href={`https://wa.me/39081555000?text=Sono interessato all'annuncio: ${listing.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 text-center text-sm rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors"
                    >
                      WhatsApp
                    </a>
                    <a
                      href="tel:+390815550000"
                      className="flex-1 py-2 text-center text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> Chiama
                    </a>
                  </div>

                  {/* QR Code */}
                  <div className="mt-4 text-center">
                    <a
                      href={`/api/listings/${listing.id}/qr`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-blue-600 flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> QR Code annuncio
                    </a>
                  </div>
                </div>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

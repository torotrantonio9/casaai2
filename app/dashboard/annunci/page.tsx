'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, QrCode, PlusCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Listing, ListingStatus, PaginatedResponse } from '@/types/database'

const STATUS_CONFIG: Record<ListingStatus, { label: string; className: string }> = {
  active: { label: 'Attivo', className: 'bg-green-100 text-green-800' },
  sold: { label: 'Venduto', className: 'bg-red-100 text-red-800' },
  rented: { label: 'Affittato', className: 'bg-yellow-100 text-yellow-800' },
  draft: { label: 'Bozza', className: 'bg-gray-100 text-gray-800' },
  expired: { label: 'Scaduto', className: 'bg-gray-100 text-gray-500' },
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price)
}

export default function AnnunciPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const perPage = 10

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/listings?page=${page}&per_page=${perPage}`)
      if (res.ok) {
        const data: PaginatedResponse<Listing> = await res.json()
        setListings(data.data)
        setTotalPages(data.total_pages)
      }
    } catch {
      // Placeholder data
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  async function handleDelete(id: string) {
    if (!confirm('Sei sicuro di voler eliminare questo annuncio?')) return
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setListings((prev) => prev.filter((l) => l.id !== id))
      }
    } catch {
      // Handle error silently
    }
  }

  async function handleQrCode(id: string) {
    try {
      const res = await fetch(`/api/listings/${id}/qr`)
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `qr-${id}.png`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch {
      // Handle error silently
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>
            Annunci
          </h1>
          <p className="text-sm text-gray-500">Gestisci i tuoi annunci immobiliari</p>
        </div>
        <Link href="/dashboard/annunci/nuovo">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuovo Annuncio
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium" style={{ color: '#111827' }}>
                    Titolo
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: '#111827' }}>
                    Prezzo
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: '#111827' }}>
                    Città
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: '#111827' }}>
                    Stato
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: '#111827' }}>
                    Visualizzazioni
                  </th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: '#111827' }}>
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-4 py-3" colSpan={6}>
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  : listings.length === 0
                    ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          Nessun annuncio trovato. Crea il tuo primo annuncio!
                        </td>
                      </tr>
                    )
                    : listings.map((listing) => {
                      const statusConfig = STATUS_CONFIG[listing.status]
                      return (
                        <tr key={listing.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium" style={{ color: '#111827' }}>
                            {listing.title}
                          </td>
                          <td className="px-4 py-3" style={{ color: '#111827' }}>
                            {formatPrice(listing.price)}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{listing.city}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.className}`}
                            >
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {listing.views_count}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Link href={`/dashboard/annunci/${listing.id}/modifica`}>
                                <Button variant="ghost" size="icon-sm">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleQrCode(listing.id)}
                              >
                                <QrCode className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon-sm"
                                onClick={() => handleDelete(listing.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Precedente
          </Button>
          <span className="text-sm text-gray-600">
            Pagina {page} di {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Successiva
          </Button>
        </div>
      )}
    </div>
  )
}

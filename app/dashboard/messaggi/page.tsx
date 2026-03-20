'use client'

import React, { useState, useEffect } from 'react'
import { MessageSquare, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import type { Lead } from '@/types/database'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MessaggiPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch('/api/leads')
        if (res.ok) {
          const data: { data: Lead[] } = await res.json()
          if (data.data) setLeads(data.data.slice(0, 10))
        }
      } catch {
        // Handle silently
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>
          Messaggi
        </h1>
        <p className="text-sm text-gray-500">
          Comunicazioni con i tuoi contatti
        </p>
      </div>

      {/* Coming soon banner */}
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>
              Messaggi in tempo reale — Coming soon
            </h2>
            <p className="max-w-md text-sm text-gray-500">
              Presto potrai gestire le conversazioni con i tuoi lead direttamente
              dalla dashboard, con notifiche in tempo reale e risposte AI
              suggerite.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent leads as conversation starters */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: '#111827' }}>Lead Recenti</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">
              Nessun lead disponibile
            </p>
          ) : (
            <div className="space-y-1">
              {leads.map((lead, index) => (
                <React.Fragment key={lead.id}>
                  <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                      {lead.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: '#111827' }}>
                        {lead.full_name}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {lead.message ?? lead.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {formatDate(lead.created_at)}
                    </div>
                  </div>
                  {index < leads.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

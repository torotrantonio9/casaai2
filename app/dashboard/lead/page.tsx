'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Lead, LeadStatus } from '@/types/database'

const KANBAN_COLUMNS: { status: LeadStatus; label: string; color: string }[] = [
  { status: 'new', label: 'Nuovo', color: 'border-t-blue-500' },
  { status: 'contacted', label: 'Contattato', color: 'border-t-yellow-500' },
  { status: 'qualified', label: 'Qualificato', color: 'border-t-purple-500' },
  { status: 'negotiation', label: 'Trattativa', color: 'border-t-orange-500' },
  { status: 'closed_won', label: 'Chiuso', color: 'border-t-green-500' },
]

function getScoreBadgeClass(score: number | null): string {
  if (score === null) return 'bg-gray-100 text-gray-600'
  if (score >= 80) return 'bg-green-100 text-green-800'
  if (score >= 50) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function LeadKanbanPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch('/api/leads')
        if (res.ok) {
          const data: { data: Lead[] } = await res.json()
          if (data.data) setLeads(data.data)
        }
      } catch {
        // Use empty array if API not available
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [])

  function getLeadsByStatus(status: LeadStatus): Lead[] {
    return leads.filter((lead) => lead.status === status)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>
          Lead
        </h1>
        <p className="text-sm text-gray-500">
          Gestisci i tuoi contatti in vista Kanban
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((column) => {
            const columnLeads = getLeadsByStatus(column.status)
            return (
              <div
                key={column.status}
                className="min-w-[280px] flex-1"
              >
                <div
                  className={`mb-3 rounded-lg border-t-4 bg-gray-50 p-3 ${column.color}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>
                      {column.label}
                    </h3>
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-700">
                      {columnLeads.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {columnLeads.length === 0 ? (
                    <p className="py-4 text-center text-xs text-gray-400">
                      Nessun lead
                    </p>
                  ) : (
                    columnLeads.map((lead) => (
                      <Link
                        key={lead.id}
                        href={`/dashboard/lead/${lead.id}`}
                      >
                        <Card className="cursor-pointer transition-shadow hover:shadow-md mb-2">
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <p
                                  className="text-sm font-medium leading-tight"
                                  style={{ color: '#111827' }}
                                >
                                  {lead.full_name}
                                </p>
                                {lead.ai_score !== null && (
                                  <span
                                    className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${getScoreBadgeClass(lead.ai_score)}`}
                                  >
                                    {lead.ai_score}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-1">
                                {lead.message ?? 'Nessun messaggio'}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700">
                                  {lead.source}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatDate(lead.created_at)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

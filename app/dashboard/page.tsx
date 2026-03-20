'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Building2, Users, TrendingUp, Percent, PlusCircle, Eye, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Listing, Lead } from '@/types/database'

interface MetricCard {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  bgColor: string
  iconColor: string
}

export default function DashboardOverviewPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [listingsRes, leadsRes] = await Promise.all([
          fetch('/api/listings?agency_id=demo'),
          fetch('/api/leads?agency_id=demo'),
        ])

        if (listingsRes.ok) {
          const listingsData: { data: Listing[] } = await listingsRes.json()
          if (listingsData.data) setListings(listingsData.data)
        }

        if (leadsRes.ok) {
          const leadsData: { data: Lead[] } = await leadsRes.json()
          if (leadsData.data) setLeads(leadsData.data)
        }
      } catch {
        // Use placeholder data if API not available
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const activeListings = listings.filter((l) => l.status === 'active').length || 12
  const totalLeads = leads.length || 48
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const weekLeads =
    leads.filter((l) => new Date(l.created_at) >= weekAgo).length || 8
  const conversionRate =
    leads.length > 0
      ? Math.round(
          (leads.filter((l) => l.status === 'closed_won').length / leads.length) *
            100
        )
      : 15

  const metrics: MetricCard[] = [
    {
      title: 'Annunci Attivi',
      value: String(activeListings),
      icon: Building2,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Lead Totali',
      value: String(totalLeads),
      icon: Users,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Lead Settimana',
      value: String(weekLeads),
      icon: TrendingUp,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Conversione %',
      value: `${conversionRate}%`,
      icon: Percent,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>
          Panoramica
        </h1>
        <p className="text-sm text-gray-500">
          Riepilogo delle attività della tua agenzia
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          : metrics.map((metric) => {
              const Icon = metric.icon
              return (
                <Card key={metric.title}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg ${metric.bgColor}`}
                      >
                        <Icon className={`h-6 w-6 ${metric.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{metric.title}</p>
                        <p
                          className="text-2xl font-bold"
                          style={{ color: '#111827' }}
                        >
                          {metric.value}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: '#111827' }}>Azioni Rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/annunci/nuovo">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crea Annuncio
              </Button>
            </Link>
            <Link href="/dashboard/lead">
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Visualizza Lead
              </Button>
            </Link>
            <Link href="/dashboard/importa">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Importa Annunci
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

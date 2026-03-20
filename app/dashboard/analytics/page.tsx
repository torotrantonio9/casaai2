'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const LineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> }
)
const Line = dynamic(
  () => import('recharts').then((mod) => mod.Line),
  { ssr: false }
)
const PieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> }
)
const Pie = dynamic(
  () => import('recharts').then((mod) => mod.Pie),
  { ssr: false }
)
const Cell = dynamic(
  () => import('recharts').then((mod) => mod.Cell),
  { ssr: false }
)
const BarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> }
)
const Bar = dynamic(
  () => import('recharts').then((mod) => mod.Bar),
  { ssr: false }
)
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
)
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
)
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
)
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
)
const Legend = dynamic(
  () => import('recharts').then((mod) => mod.Legend),
  { ssr: false }
)
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
)

// Sample data
const viewsData = Array.from({ length: 30 }, (_, i) => ({
  giorno: `${i + 1}`,
  visualizzazioni: Math.floor(Math.random() * 200) + 50,
}))

interface PieDataItem {
  name: string
  value: number
  color: string
}

const leadSourceData: PieDataItem[] = [
  { name: 'Chat', value: 35, color: '#3B82F6' },
  { name: 'Form', value: 25, color: '#10B981' },
  { name: 'Telefono', value: 15, color: '#F59E0B' },
  { name: 'WhatsApp', value: 18, color: '#22C55E' },
  { name: 'Email', value: 7, color: '#8B5CF6' },
]

const weekdayData = [
  { giorno: 'Lun', lead: 12 },
  { giorno: 'Mar', lead: 19 },
  { giorno: 'Mer', lead: 15 },
  { giorno: 'Gio', lead: 22 },
  { giorno: 'Ven', lead: 28 },
  { giorno: 'Sab', lead: 8 },
  { giorno: 'Dom', lead: 5 },
]

interface FunnelItem {
  label: string
  value: number
  color: string
  width: string
}

const funnelData: FunnelItem[] = [
  { label: 'Visualizzazioni', value: 5200, color: 'bg-blue-500', width: 'w-full' },
  { label: 'Contatti', value: 320, color: 'bg-blue-400', width: 'w-4/5' },
  { label: 'Lead Qualificati', value: 85, color: 'bg-blue-300', width: 'w-3/5' },
  { label: 'Trattative', value: 32, color: 'bg-green-400', width: 'w-2/5' },
  { label: 'Chiusi', value: 12, color: 'bg-green-500', width: 'w-1/5' },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>
          Analytics
        </h1>
        <p className="text-sm text-gray-500">
          Statistiche e andamento della tua agenzia
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Line Chart - Views */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle style={{ color: '#111827' }}>
              Visualizzazioni ultimi 30 giorni
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="giorno" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="visualizzazioni"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#111827' }}>Lead per fonte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {leadSourceData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart - Leads by Weekday */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#111827' }}>
              Lead per giorno settimana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="giorno" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="lead" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle style={{ color: '#111827' }}>Funnel di Conversione</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funnelData.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span
                    className="w-36 text-sm font-medium"
                    style={{ color: '#111827' }}
                  >
                    {item.label}
                  </span>
                  <div className="flex-1">
                    <div
                      className={`${item.color} ${item.width} rounded-full py-2 text-center text-xs font-medium text-white transition-all`}
                    >
                      {item.value.toLocaleString('it-IT')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

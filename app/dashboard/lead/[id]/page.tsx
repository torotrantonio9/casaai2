'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Loader2, Mail, Phone, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import type { LeadWithDetails, LeadStatus } from '@/types/database'

type AiTone = 'professional' | 'warm' | 'concise'

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Nuovo',
  contacted: 'Contattato',
  qualified: 'Qualificato',
  negotiation: 'Trattativa',
  closed_won: 'Chiuso (vinto)',
  closed_lost: 'Chiuso (perso)',
}

const TONE_OPTIONS: { value: AiTone; label: string }[] = [
  { value: 'professional', label: 'Professionale' },
  { value: 'warm', label: 'Accogliente' },
  { value: 'concise', label: 'Conciso' },
]

function getScoreBadgeClass(score: number | null): string {
  if (score === null) return 'bg-gray-100 text-gray-600'
  if (score >= 80) return 'bg-green-100 text-green-800'
  if (score >= 50) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const selectStyle: React.CSSProperties = { color: '#111827', background: 'white' }
const inputStyle: React.CSSProperties = { color: '#111827', background: 'white' }

export default function LeadDetailPage() {
  const params = useParams()
  const leadId = params.id as string

  const [lead, setLead] = useState<LeadWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [draftReply, setDraftReply] = useState('')
  const [aiTone, setAiTone] = useState<AiTone>('professional')
  const [generatingReply, setGeneratingReply] = useState(false)
  const [scoringLead, setScoringLead] = useState(false)

  useEffect(() => {
    async function fetchLead() {
      try {
        const res = await fetch(`/api/leads?id=${leadId}`)
        if (res.ok) {
          const data: { data: LeadWithDetails } = await res.json()
          if (data.data) {
            setLead(data.data)
            if (data.data.ai_draft_reply) {
              setDraftReply(data.data.ai_draft_reply)
            }
          }
        }
      } catch {
        // Handle error silently
      } finally {
        setLoading(false)
      }
    }

    fetchLead()
  }, [leadId])

  async function handleGenerateDraft() {
    if (!lead) return
    setGeneratingReply(true)
    try {
      const res = await fetch('/api/ai/draft-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          lead_name: lead.full_name,
          lead_message: lead.message,
          listing_title: lead.listing?.title,
          tone: aiTone,
        }),
      })
      if (res.ok) {
        const data: { reply: string } = await res.json()
        setDraftReply(data.reply)
        toast.success('Bozza generata con successo!')
      } else {
        toast.error('Errore nella generazione della bozza')
      }
    } catch {
      toast.error('Errore di connessione')
    } finally {
      setGeneratingReply(false)
    }
  }

  async function handleScoreLead() {
    if (!lead) return
    setScoringLead(true)
    try {
      const res = await fetch('/api/ai/score-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          lead_name: lead.full_name,
          lead_email: lead.email,
          lead_message: lead.message,
          lead_source: lead.source,
        }),
      })
      if (res.ok) {
        const data: { score: number; reason: string } = await res.json()
        setLead((prev) =>
          prev
            ? { ...prev, ai_score: data.score, ai_score_reason: data.reason }
            : prev
        )
        toast.success('Punteggio aggiornato!')
      } else {
        toast.error('Errore nel calcolo del punteggio')
      }
    } catch {
      toast.error('Errore di connessione')
    } finally {
      setScoringLead(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Lead non trovato</p>
        <Link href="/dashboard/lead" className="mt-4 inline-block text-blue-600 hover:underline">
          Torna ai lead
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/lead">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>
            {lead.full_name}
          </h1>
          <p className="text-sm text-gray-500">
            {STATUS_LABELS[lead.status]} &middot; {formatDate(lead.created_at)}
          </p>
        </div>
      </div>

      {/* Lead info */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: '#111827' }}>Informazioni Lead</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm" style={{ color: '#111827' }}>
                {lead.email}
              </span>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm" style={{ color: '#111827' }}>
                  {lead.phone}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Fonte: {lead.source}
              </span>
            </div>
          </div>

          {lead.message && (
            <>
              <Separator />
              <div>
                <p className="mb-1 text-xs font-medium text-gray-500">Messaggio</p>
                <p className="text-sm" style={{ color: '#111827' }}>
                  {lead.message}
                </p>
              </div>
            </>
          )}

          {lead.notes && (
            <>
              <Separator />
              <div>
                <p className="mb-1 text-xs font-medium text-gray-500">Note</p>
                <p className="text-sm" style={{ color: '#111827' }}>
                  {lead.notes}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* AI Score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={{ color: '#111827' }}>
                Punteggio AI:
              </span>
              {lead.ai_score !== null ? (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-sm font-semibold ${getScoreBadgeClass(lead.ai_score)}`}
                >
                  {lead.ai_score}/100
                </span>
              ) : (
                <span className="text-sm text-gray-400">Non calcolato</span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleScoreLead}
              disabled={scoringLead}
            >
              {scoringLead ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="mr-1 h-3 w-3" />
              )}
              Calcola Punteggio
            </Button>
          </div>

          {lead.ai_score_reason && (
            <p className="text-xs text-gray-500">{lead.ai_score_reason}</p>
          )}
        </CardContent>
      </Card>

      {/* Associated listing */}
      {lead.listing && (
        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#111827' }}>Annuncio Associato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium" style={{ color: '#111827' }}>
                {lead.listing.title}
              </p>
              <p className="text-sm text-gray-600">
                {lead.listing.city} &middot;{' '}
                {new Intl.NumberFormat('it-IT', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0,
                }).format(lead.listing.price)}
              </p>
              <p className="text-xs text-gray-400">
                {lead.listing.surface_sqm} mq &middot; {lead.listing.rooms} locali
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Draft Reply */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: '#111827' }}>Bozza Risposta AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Label htmlFor="reply-tone">Tono:</Label>
            <select
              id="reply-tone"
              className="h-8 rounded-lg border border-input px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              style={selectStyle}
              value={aiTone}
              onChange={(e) => setAiTone(e.target.value as AiTone)}
            >
              {TONE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={handleGenerateDraft}
              disabled={generatingReply}
            >
              {generatingReply ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Genera bozza
            </Button>
          </div>

          <Textarea
            placeholder="La bozza della risposta apparirà qui..."
            rows={6}
            style={inputStyle}
            value={draftReply}
            onChange={(e) => setDraftReply(e.target.value)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

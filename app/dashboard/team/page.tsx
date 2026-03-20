'use client'

import React, { useState } from 'react'
import { UserPlus, Loader2, Shield, User } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { UserRole } from '@/types/database'

interface TeamMember {
  id: string
  full_name: string
  email: string
  role: UserRole
  avatar_url: string | null
  created_at: string
}

const PLACEHOLDER_MEMBERS: TeamMember[] = [
  {
    id: '1',
    full_name: 'Marco Rossi',
    email: 'marco@agenzia-demo.it',
    role: 'agency_admin',
    avatar_url: null,
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: '2',
    full_name: 'Laura Bianchi',
    email: 'laura@agenzia-demo.it',
    role: 'agent',
    avatar_url: null,
    created_at: '2025-02-20T10:00:00Z',
  },
  {
    id: '3',
    full_name: 'Giovanni Verde',
    email: 'giovanni@agenzia-demo.it',
    role: 'agent',
    avatar_url: null,
    created_at: '2025-03-10T10:00:00Z',
  },
]

const ROLE_LABELS: Record<UserRole, string> = {
  buyer: 'Acquirente',
  agent: 'Agente',
  agency_admin: 'Admin Agenzia',
  admin: 'Amministratore',
}

function getRoleIcon(role: UserRole): React.ReactNode {
  if (role === 'agency_admin' || role === 'admin') {
    return <Shield className="h-4 w-4 text-blue-600" />
  }
  return <User className="h-4 w-4 text-gray-400" />
}

const inputStyle: React.CSSProperties = { color: '#111827', background: 'white' }

export default function TeamPage() {
  const [members] = useState<TeamMember[]>(PLACEHOLDER_MEMBERS)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setInviting(true)
    try {
      // Placeholder - would call an API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success(`Invito inviato a ${inviteEmail}`)
      setInviteEmail('')
    } catch {
      toast.error('Errore nell\'invio dell\'invito')
    } finally {
      setInviting(false)
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>
          Team
        </h1>
        <p className="text-sm text-gray-500">
          Gestisci i membri del tuo team
        </p>
      </div>

      {/* Invite */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#111827' }}>
            <UserPlus className="h-5 w-5" />
            Invita un membro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="invite-email" className="sr-only">
                Email
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="email@esempio.it"
                style={inputStyle}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={inviting}>
              {inviting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Invita
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Members table */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: '#111827' }}>
            Membri ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium" style={{ color: '#111827' }}>
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: '#111827' }}>
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: '#111827' }}>
                    Ruolo
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: '#111827' }}>
                    Data Iscrizione
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                          {member.full_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <span className="font-medium" style={{ color: '#111827' }}>
                          {member.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{member.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {getRoleIcon(member.role)}
                        <span style={{ color: '#111827' }}>
                          {ROLE_LABELS[member.role]}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(member.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

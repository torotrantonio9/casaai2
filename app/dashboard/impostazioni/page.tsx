'use client'

import React, { useState } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

interface AgencyFormData {
  name: string
  description: string
  phone: string
  email: string
  website: string
  slug: string
}

const inputStyle: React.CSSProperties = { color: '#111827', background: 'white' }

export default function ImpostazioniPage() {
  const [formData, setFormData] = useState<AgencyFormData>({
    name: 'Agenzia Demo',
    description: 'Agenzia immobiliare specializzata nel mercato campano.',
    phone: '+39 081 123 4567',
    email: 'info@agenzia-demo.it',
    website: 'https://www.agenzia-demo.it',
    slug: 'agenzia-demo',
  })
  const [saving, setSaving] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/agencies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success('Impostazioni salvate con successo!')
      } else {
        toast.error('Errore nel salvataggio delle impostazioni')
      }
    } catch {
      toast.error('Errore di connessione')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>
          Impostazioni
        </h1>
        <p className="text-sm text-gray-500">
          Configura il profilo della tua agenzia
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#111827' }}>Profilo Agenzia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Agenzia *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Nome della tua agenzia"
                style={inputStyle}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Descrivi la tua agenzia..."
                rows={3}
                style={inputStyle}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+39 081 123 4567"
                  style={inputStyle}
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="info@agenzia.it"
                  style={inputStyle}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Sito Web</Label>
              <Input
                id="website"
                name="website"
                type="url"
                placeholder="https://www.agenzia.it"
                style={inputStyle}
                value={formData.website}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                name="slug"
                placeholder="agenzia-demo"
                style={inputStyle}
                value={formData.slug}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-gray-500">
                L&apos;URL della tua pagina pubblica: casaai.it/{formData.slug}
              </p>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salva Impostazioni
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

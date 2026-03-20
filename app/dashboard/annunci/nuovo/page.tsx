'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import type {
  ListingType,
  PropertyType,
  EnergyClass,
} from '@/types/database'

const listingSchema = z.object({
  title: z.string().min(5, 'Il titolo deve avere almeno 5 caratteri'),
  listing_type: z.enum(['sale', 'rent'] satisfies readonly ListingType[]),
  property_type: z.enum([
    'apartment',
    'house',
    'villa',
    'land',
    'commercial',
    'garage',
    'other',
  ] satisfies readonly PropertyType[]),
  price: z.number().min(1, 'Inserisci un prezzo valido'),
  address: z.string().min(3, 'Inserisci un indirizzo valido'),
  city: z.string().min(2, 'Inserisci una città valida'),
  province: z.string().optional(),
  surface_sqm: z.number().optional(),
  rooms: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().min(0).default(1),
  floor: z.number().optional(),
  total_floors: z.number().optional(),
  year_built: z.number().optional(),
  energy_class: z.enum([
    'A4',
    'A3',
    'A2',
    'A1',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'pending',
  ] satisfies readonly EnergyClass[]),
  has_elevator: z.boolean().default(false),
  has_parking: z.boolean().default(false),
  has_garden: z.boolean().default(false),
  has_terrace: z.boolean().default(false),
  has_balcony: z.boolean().default(false),
  has_cellar: z.boolean().default(false),
  description: z.string().optional(),
})

type ListingFormData = z.infer<typeof listingSchema>

type AiTone = 'professional' | 'warm' | 'luxury'

const inputStyle: React.CSSProperties = { color: '#111827', background: 'white' }
const selectStyle: React.CSSProperties = { color: '#111827', background: 'white' }

const LISTING_TYPE_OPTIONS: { value: ListingType; label: string }[] = [
  { value: 'sale', label: 'Vendita' },
  { value: 'rent', label: 'Affitto' },
]

const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: 'Appartamento' },
  { value: 'house', label: 'Casa' },
  { value: 'villa', label: 'Villa' },
  { value: 'land', label: 'Terreno' },
  { value: 'commercial', label: 'Commerciale' },
  { value: 'garage', label: 'Garage' },
  { value: 'other', label: 'Altro' },
]

const ENERGY_CLASS_OPTIONS: { value: EnergyClass; label: string }[] = [
  { value: 'A4', label: 'A4' },
  { value: 'A3', label: 'A3' },
  { value: 'A2', label: 'A2' },
  { value: 'A1', label: 'A1' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
  { value: 'F', label: 'F' },
  { value: 'G', label: 'G' },
  { value: 'pending', label: 'In attesa' },
]

const TONE_OPTIONS: { value: AiTone; label: string }[] = [
  { value: 'professional', label: 'Professionale' },
  { value: 'warm', label: 'Accogliente' },
  { value: 'luxury', label: 'Lusso' },
]

const BOOLEAN_FIELDS: { name: keyof ListingFormData; label: string }[] = [
  { name: 'has_elevator', label: 'Ascensore' },
  { name: 'has_parking', label: 'Parcheggio' },
  { name: 'has_garden', label: 'Giardino' },
  { name: 'has_terrace', label: 'Terrazza' },
  { name: 'has_balcony', label: 'Balcone' },
  { name: 'has_cellar', label: 'Cantina' },
]

export default function NuovoAnnuncioPage() {
  const router = useRouter()
  const [aiTone, setAiTone] = useState<AiTone>('professional')
  const [generatingAi, setGeneratingAi] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ListingFormData>({
    defaultValues: {
      listing_type: 'sale',
      property_type: 'apartment',
      energy_class: 'pending',
      bathrooms: 1,
      has_elevator: false,
      has_parking: false,
      has_garden: false,
      has_terrace: false,
      has_balcony: false,
      has_cellar: false,
      description: '',
    },
  })

  const description = watch('description')

  async function handleGenerateDescription() {
    const formValues = watch()
    setGeneratingAi(true)
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formValues.title,
          listing_type: formValues.listing_type,
          property_type: formValues.property_type,
          price: formValues.price,
          city: formValues.city,
          surface_sqm: formValues.surface_sqm,
          rooms: formValues.rooms,
          bedrooms: formValues.bedrooms,
          bathrooms: formValues.bathrooms,
          energy_class: formValues.energy_class,
          tone: aiTone,
        }),
      })
      if (res.ok) {
        const data: { description: string } = await res.json()
        setValue('description', data.description)
        toast.success('Descrizione generata con successo!')
      } else {
        toast.error('Errore nella generazione della descrizione')
      }
    } catch {
      toast.error('Errore di connessione')
    } finally {
      setGeneratingAi(false)
    }
  }

  async function onSubmit(data: ListingFormData) {
    setSubmitting(true)
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('Annuncio creato con successo!')
        router.push('/dashboard/annunci')
      } else {
        const errorData: { error?: string } = await res.json()
        toast.error(errorData.error ?? 'Errore nella creazione dell\'annuncio')
      }
    } catch {
      toast.error('Errore di connessione')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>
          Nuovo Annuncio
        </h1>
        <p className="text-sm text-gray-500">
          Compila il modulo per creare un nuovo annuncio immobiliare
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#111827' }}>Informazioni Base</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Titolo *</Label>
              <Input
                id="title"
                placeholder="es. Trilocale luminoso in centro"
                style={inputStyle}
                {...register('title', { required: 'Il titolo è obbligatorio' })}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="listing_type">Tipo Annuncio *</Label>
                <select
                  id="listing_type"
                  className="h-8 w-full rounded-lg border border-input px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  style={selectStyle}
                  {...register('listing_type')}
                >
                  {LISTING_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="property_type">Tipo Proprietà *</Label>
                <select
                  id="property_type"
                  className="h-8 w-full rounded-lg border border-input px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  style={selectStyle}
                  {...register('property_type')}
                >
                  {PROPERTY_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="price">Prezzo (EUR) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="150000"
                style={inputStyle}
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#111827' }}>Posizione</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Indirizzo *</Label>
              <Input
                id="address"
                placeholder="Via Roma 1"
                style={inputStyle}
                {...register('address', { required: 'L\'indirizzo è obbligatorio' })}
              />
              {errors.address && (
                <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="city">Città *</Label>
                <Input
                  id="city"
                  placeholder="Napoli"
                  style={inputStyle}
                  {...register('city', { required: 'La città è obbligatoria' })}
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="province">Provincia</Label>
                <Input
                  id="province"
                  placeholder="NA"
                  style={inputStyle}
                  {...register('province')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#111827' }}>Dettagli</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="surface_sqm">Superficie (mq)</Label>
                <Input
                  id="surface_sqm"
                  type="number"
                  placeholder="80"
                  style={inputStyle}
                  {...register('surface_sqm', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="rooms">Locali</Label>
                <Input
                  id="rooms"
                  type="number"
                  placeholder="3"
                  style={inputStyle}
                  {...register('rooms', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="bedrooms">Camere</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  placeholder="2"
                  style={inputStyle}
                  {...register('bedrooms', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Bagni *</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  placeholder="1"
                  style={inputStyle}
                  {...register('bathrooms', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="floor">Piano</Label>
                <Input
                  id="floor"
                  type="number"
                  placeholder="3"
                  style={inputStyle}
                  {...register('floor', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="total_floors">Piani Totali</Label>
                <Input
                  id="total_floors"
                  type="number"
                  placeholder="5"
                  style={inputStyle}
                  {...register('total_floors', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="year_built">Anno Costruzione</Label>
                <Input
                  id="year_built"
                  type="number"
                  placeholder="2000"
                  style={inputStyle}
                  {...register('year_built', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="energy_class">Classe Energetica</Label>
                <select
                  id="energy_class"
                  className="h-8 w-full rounded-lg border border-input px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  style={selectStyle}
                  {...register('energy_class')}
                >
                  {ENERGY_CLASS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="mb-3">Caratteristiche</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {BOOLEAN_FIELDS.map((field) => (
                  <label
                    key={field.name}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: '#111827' }}
                  >
                    <Checkbox
                      checked={watch(field.name) as boolean}
                      onCheckedChange={(checked: boolean) =>
                        setValue(field.name, checked)
                      }
                    />
                    {field.label}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description + AI */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#111827' }}>Descrizione</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Label htmlFor="ai-tone">Tono AI:</Label>
              <select
                id="ai-tone"
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
                type="button"
                variant="outline"
                onClick={handleGenerateDescription}
                disabled={generatingAi}
              >
                {generatingAi ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Genera descrizione AI
              </Button>
            </div>

            <Textarea
              id="description"
              placeholder="Descrivi l'immobile..."
              rows={6}
              style={inputStyle}
              value={description ?? ''}
              onChange={(e) => setValue('description', e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/annunci')}
          >
            Annulla
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Pubblica Annuncio
          </Button>
        </div>
      </form>
    </div>
  )
}

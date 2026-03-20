'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Upload, Link as LinkIcon, Webhook, FileSpreadsheet, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import type { ImportJob, ImportJobStatus } from '@/types/database'

const STATUS_CONFIG: Record<ImportJobStatus, { label: string; className: string }> = {
  pending: { label: 'In attesa', className: 'bg-gray-100 text-gray-800' },
  processing: { label: 'In corso', className: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completato', className: 'bg-green-100 text-green-800' },
  failed: { label: 'Errore', className: 'bg-red-100 text-red-800' },
}

interface CsvPreviewRow {
  [key: string]: string
}

const inputStyle: React.CSSProperties = { color: '#111827', background: 'white' }

export default function ImportaPage() {
  const [jobs, setJobs] = useState<ImportJob[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)

  // CSV state
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvPreview, setCsvPreview] = useState<CsvPreviewRow[]>([])
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [uploadingCsv, setUploadingCsv] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // URL state
  const [importUrl, setImportUrl] = useState('')
  const [fetchingUrl, setFetchingUrl] = useState(false)

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch('/api/import')
        if (res.ok) {
          const data: { data: ImportJob[] } = await res.json()
          if (data.data) setJobs(data.data)
        }
      } catch {
        // Handle silently
      } finally {
        setLoadingJobs(false)
      }
    }

    fetchJobs()
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvFile(file)
    setUploadProgress(0)

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter((line) => line.trim() !== '')
      if (lines.length === 0) return

      const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''))
      setCsvHeaders(headers)

      const preview: CsvPreviewRow[] = []
      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''))
        const row: CsvPreviewRow = {}
        headers.forEach((header, index) => {
          row[header] = values[index] ?? ''
        })
        preview.push(row)
      }
      setCsvPreview(preview)
    }
    reader.readAsText(file)
  }

  async function handleCsvUpload() {
    if (!csvFile) return
    setUploadingCsv(true)
    setUploadProgress(10)

    try {
      const formData = new FormData()
      formData.append('file', csvFile)
      formData.append('source', 'csv')

      setUploadProgress(30)

      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      })

      setUploadProgress(70)

      if (res.ok) {
        const data: { data: ImportJob } = await res.json()
        setUploadProgress(100)
        toast.success('Import avviato con successo!')
        if (data.data) {
          setJobs((prev) => [data.data, ...prev])
        }
        setCsvFile(null)
        setCsvPreview([])
        setCsvHeaders([])
        if (fileInputRef.current) fileInputRef.current.value = ''
      } else {
        toast.error('Errore nell\'upload del file')
      }
    } catch {
      toast.error('Errore di connessione')
    } finally {
      setUploadingCsv(false)
    }
  }

  async function handleUrlFetch() {
    if (!importUrl.trim()) return
    setFetchingUrl(true)
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'url', url: importUrl }),
      })

      if (res.ok) {
        const data: { data: ImportJob } = await res.json()
        toast.success('Import da URL avviato!')
        if (data.data) {
          setJobs((prev) => [data.data, ...prev])
        }
        setImportUrl('')
      } else {
        toast.error('Errore nell\'import da URL')
      }
    } catch {
      toast.error('Errore di connessione')
    } finally {
      setFetchingUrl(false)
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>
          Importa Annunci
        </h1>
        <p className="text-sm text-gray-500">
          Importa annunci da CSV, URL o portali immobiliari
        </p>
      </div>

      {/* Section 1: CSV Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#111827' }}>
            <FileSpreadsheet className="h-5 w-5" />
            Import CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="csv-file">Seleziona file CSV</Label>
            <Input
              ref={fileInputRef}
              id="csv-file"
              type="file"
              accept=".csv"
              style={inputStyle}
              onChange={handleFileChange}
            />
          </div>

          {csvPreview.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium" style={{ color: '#111827' }}>
                Anteprima ({csvPreview.length} righe)
              </p>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      {csvHeaders.map((header) => (
                        <th
                          key={header}
                          className="px-3 py-2 text-left font-medium"
                          style={{ color: '#111827' }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.map((row, i) => (
                      <tr key={i} className="border-t">
                        {csvHeaders.map((header) => (
                          <td key={header} className="px-3 py-1.5 text-gray-600">
                            {row[header]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {uploadingCsv && (
            <Progress value={uploadProgress}>
              <span className="text-xs text-gray-500">{uploadProgress}%</span>
            </Progress>
          )}

          <Button
            onClick={handleCsvUpload}
            disabled={!csvFile || uploadingCsv}
          >
            {uploadingCsv ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Carica e Importa
          </Button>
        </CardContent>
      </Card>

      {/* Section 2: URL Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#111827' }}>
            <LinkIcon className="h-5 w-5" />
            Import da URL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="import-url">URL dell&apos;annuncio</Label>
            <div className="flex gap-2">
              <Input
                id="import-url"
                type="url"
                placeholder="https://www.immobiliare.it/annunci/..."
                style={inputStyle}
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
              />
              <Button
                onClick={handleUrlFetch}
                disabled={!importUrl.trim() || fetchingUrl}
              >
                {fetchingUrl ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LinkIcon className="mr-2 h-4 w-4" />
                )}
                Importa
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Webhook */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50">
              <Webhook className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>
                Webhook Idealista
              </h3>
              <p className="text-sm text-gray-500">
                Configura il webhook per ricevere automaticamente nuovi annunci da
                Idealista. Contatta il supporto per ottenere il tuo endpoint
                personalizzato.
              </p>
              <code className="mt-2 block rounded bg-gray-100 px-3 py-1.5 text-xs text-gray-700">
                POST /api/import/webhook
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Import history */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: '#111827' }}>Cronologia Import</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingJobs ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">
              Nessun import effettuato
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-3 py-2 text-left font-medium" style={{ color: '#111827' }}>
                      Fonte
                    </th>
                    <th className="px-3 py-2 text-left font-medium" style={{ color: '#111827' }}>
                      Stato
                    </th>
                    <th className="px-3 py-2 text-left font-medium" style={{ color: '#111827' }}>
                      Importati
                    </th>
                    <th className="px-3 py-2 text-left font-medium" style={{ color: '#111827' }}>
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    const statusConfig = STATUS_CONFIG[job.status]
                    return (
                      <tr key={job.id} className="border-b">
                        <td className="px-3 py-2" style={{ color: '#111827' }}>
                          {job.source}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.className}`}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {job.imported_items}/{job.total_items}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {formatDate(job.created_at)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

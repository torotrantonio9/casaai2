'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { supabase } from '@/lib/supabase/client'

export default function RegistratiPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'buyer' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            role: form.role,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
      } else {
        setSuccess(true)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore durante la registrazione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12">
        <div className="w-full max-w-md px-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Registrati su CasaAI</h1>
              <p className="text-gray-500 text-sm mt-1">Crea il tuo account gratuito</p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm mb-4">{error}</div>}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm mb-4">
                <p className="font-medium">Registrazione completata!</p>
                <p className="mt-1">Controlla la tua email per confermare l&apos;account. Poi potrai <Link href="/login" className="underline font-medium">accedere</Link>.</p>
              </div>
            )}

            {!success && <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reg_name" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Nome e Cognome</label>
                <input id="reg_name" type="text" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ color: '#111827', background: 'white' }} />
              </div>
              <div>
                <label htmlFor="reg_email" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Email</label>
                <input id="reg_email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ color: '#111827', background: 'white' }} placeholder="tu@email.it" />
              </div>
              <div>
                <label htmlFor="reg_pass" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Password</label>
                <input id="reg_pass" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ color: '#111827', background: 'white' }} placeholder="Minimo 8 caratteri" />
              </div>
              <div>
                <label htmlFor="reg_role" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Tipo account</label>
                <select id="reg_role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200" style={{ color: '#111827', background: 'white' }}>
                  <option value="buyer">Cerco casa</option>
                  <option value="agency_admin">Agenzia immobiliare</option>
                </select>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                {loading ? 'Registrazione...' : 'Registrati'}
              </button>
            </form>}

            <p className="text-center text-sm text-gray-500 mt-6">
              Hai già un account? <Link href="/login" className="text-blue-600 hover:underline">Accedi</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
      } else {
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore durante il login')
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
              <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Accedi a CasaAI</h1>
              <p className="text-gray-500 text-sm mt-1">Inserisci le tue credenziali</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login_email" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Email</label>
                <input id="login_email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ color: '#111827', background: 'white' }} placeholder="tu@email.it" />
              </div>
              <div>
                <label htmlFor="login_pass" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Password</label>
                <input id="login_pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ color: '#111827', background: 'white' }} placeholder="La tua password" />
              </div>
              <div className="text-right">
                <Link href="/password-dimenticata" className="text-sm text-blue-600 hover:underline">Password dimenticata?</Link>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                {loading ? 'Accesso in corso...' : 'Accedi'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Non hai un account? <Link href="/registrati" className="text-blue-600 hover:underline">Registrati</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

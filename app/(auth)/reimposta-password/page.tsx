'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

export default function ReimpostaPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) return
    setDone(true)
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12">
        <div className="w-full max-w-md px-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Reimposta password</h1>
            </div>

            {done ? (
              <div className="text-center py-4">
                <p className="text-3xl mb-3">✅</p>
                <p className="font-semibold" style={{ color: '#111827' }}>Password aggiornata!</p>
                <Link href="/login" className="text-blue-600 hover:underline text-sm mt-4 inline-block">Vai al login</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="new_pass" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Nuova password</label>
                  <input id="new_pass" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: '#111827', background: 'white' }} />
                </div>
                <div>
                  <label htmlFor="confirm_pass" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Conferma password</label>
                  <input id="confirm_pass" type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: '#111827', background: 'white' }} />
                  {confirm && password !== confirm && <p className="text-xs text-red-500 mt-1">Le password non corrispondono</p>}
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
                  Salva nuova password
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

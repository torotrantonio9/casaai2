'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

export default function PasswordDimenticataPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12">
        <div className="w-full max-w-md px-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Password dimenticata</h1>
              <p className="text-gray-500 text-sm mt-1">Ti invieremo un link per reimpostarla</p>
            </div>

            {sent ? (
              <div className="text-center py-4">
                <p className="text-3xl mb-3">📧</p>
                <p className="font-semibold" style={{ color: '#111827' }}>Email inviata!</p>
                <p className="text-sm text-gray-500 mt-1">Controlla la tua casella di posta.</p>
                <Link href="/login" className="text-blue-600 hover:underline text-sm mt-4 inline-block">Torna al login</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reset_email" className="block text-sm font-medium mb-1" style={{ color: '#111827' }}>Email</label>
                  <input id="reset_email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ color: '#111827', background: 'white' }} placeholder="tu@email.it" />
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
                  Invia link di reset
                </button>
              </form>
            )}

            <p className="text-center text-sm text-gray-500 mt-6">
              <Link href="/login" className="text-blue-600 hover:underline">← Torna al login</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              AI
            </div>
            <span className="text-xl font-bold" style={{ color: '#111827' }}>
              Casa<span className="text-blue-600">AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Cerca casa
            </Link>
            <Link href="/annunci" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Annunci
            </Link>
            <Link href="/valutazione" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Valutazione AI
            </Link>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Accedi
            </Link>
            <Link
              href="/registrati"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Registrati
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Chiudi menu' : 'Apri menu'}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-4 space-y-3">
            <Link href="/" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium" style={{ color: '#111827' }}>
              Cerca casa
            </Link>
            <Link href="/annunci" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium" style={{ color: '#111827' }}>
              Annunci
            </Link>
            <Link href="/valutazione" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium" style={{ color: '#111827' }}>
              Valutazione AI
            </Link>
            <hr className="my-2" />
            <Link href="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-blue-600">
              Accedi
            </Link>
            <Link href="/registrati" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-blue-600">
              Registrati
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

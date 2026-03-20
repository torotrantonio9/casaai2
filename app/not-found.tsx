import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-16">
        <div className="text-center">
          <p className="text-6xl mb-4">🏠</p>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#111827' }}>404</h1>
          <p className="text-xl text-gray-500 mb-6">Pagina non trovata</p>
          <p className="text-gray-400 mb-8">La pagina che cerchi non esiste o è stata spostata.</p>
          <div className="flex justify-center gap-4">
            <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
              Torna alla home
            </Link>
            <Link href="/cerca" className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors" style={{ color: '#111827' }}>
              Cerca casa con AI
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}

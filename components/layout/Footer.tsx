import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Cerca */}
          <div>
            <h3 className="text-white font-semibold mb-4">Cerca</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Cerca con AI</Link></li>
              <li><Link href="/annunci" className="hover:text-white transition-colors">Tutti gli annunci</Link></li>
              <li><Link href="/annunci?listing_type=sale" className="hover:text-white transition-colors">Vendita</Link></li>
              <li><Link href="/annunci?listing_type=rent" className="hover:text-white transition-colors">Affitto</Link></li>
              <li><Link href="/valutazione" className="hover:text-white transition-colors">Valutazione AI</Link></li>
            </ul>
          </div>

          {/* Per agenzie */}
          <div>
            <h3 className="text-white font-semibold mb-4">Per agenzie</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/registrati" className="hover:text-white transition-colors">Registra agenzia</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/dashboard/annunci/nuovo" className="hover:text-white transition-colors">Pubblica annuncio</Link></li>
              <li><Link href="/dashboard/importa" className="hover:text-white transition-colors">Importa annunci</Link></li>
            </ul>
          </div>

          {/* Legale */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legale</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/termini" className="hover:text-white transition-colors">Termini di Servizio</Link></li>
            </ul>
          </div>

          {/* Contatti */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contatti</h3>
            <ul className="space-y-2 text-sm">
              <li>info@casaai.it</li>
              <li>+39 081 555 0000</li>
              <li>Napoli, Italia</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          © 2026 CasaAI. Tutti i diritti riservati.
        </div>
      </div>
    </footer>
  )
}

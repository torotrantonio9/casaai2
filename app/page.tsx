import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HomeChatSection from '@/components/ai/HomeChatSection'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero + Chat */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: '#111827' }}>
                Trova la tua casa ideale
                <span className="text-blue-600"> con l&apos;AI</span>
              </h1>
              <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                CasaAI usa l&apos;intelligenza artificiale per trovare gli immobili perfetti
                per te in Campania. Parla con il nostro assistente e scopri la tua prossima casa.
              </p>
            </div>

            <ErrorBoundary>
              <HomeChatSection />
            </ErrorBoundary>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#111827' }}>
              Come funziona
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: '💬', title: 'Parla con l\'AI', desc: 'Descrivi cosa cerchi in modo naturale. Il nostro assistente capisce le tue esigenze.' },
                { icon: '🏠', title: 'Ricevi annunci', desc: 'CasaAI cerca tra centinaia di annunci e ti mostra quelli più compatibili.' },
                { icon: '📞', title: 'Contatta l\'agenzia', desc: 'Quando trovi la casa giusta, contatta direttamente l\'agenzia con un click.' },
              ].map((step, i) => (
                <div key={i} className="text-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mx-auto mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>{step.title}</h3>
                  <p className="text-gray-500">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For agencies CTA */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#111827' }}>
              Sei un&apos;agenzia immobiliare?
            </h2>
            <p className="text-lg text-gray-500 mb-8">
              Pubblica i tuoi annunci su CasaAI e raggiungi migliaia di potenziali acquirenti
              con il potere dell&apos;intelligenza artificiale.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/registrati"
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
              >
                Registra la tua agenzia
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                style={{ color: '#111827' }}
              >
                Accedi alla dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

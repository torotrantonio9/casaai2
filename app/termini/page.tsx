import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Termini di Servizio — CasaAI',
}

export default function TerminiPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 prose prose-gray">
          <h1 style={{ color: '#111827' }}>Termini di Servizio</h1>
          <p className="text-sm text-gray-500">Ultimo aggiornamento: 1 Marzo 2026</p>

          <h2 style={{ color: '#111827' }}>1. Accettazione dei Termini</h2>
          <p style={{ color: '#111827' }}>Utilizzando CasaAI, l&apos;utente accetta integralmente i presenti Termini di Servizio. Il servizio è fornito da CasaAI S.r.l.</p>

          <h2 style={{ color: '#111827' }}>2. Descrizione del Servizio</h2>
          <p style={{ color: '#111827' }}>CasaAI è una piattaforma di ricerca immobiliare che utilizza intelligenza artificiale per connettere acquirenti e agenzie immobiliari. Il servizio include: ricerca AI, valutazione immobili, gestione annunci, CRM per agenzie.</p>

          <h2 style={{ color: '#111827' }}>3. Account Utente</h2>
          <p style={{ color: '#111827' }}>L&apos;utente è responsabile della riservatezza delle proprie credenziali. È vietato creare account con dati falsi o per scopi illeciti.</p>

          <h2 style={{ color: '#111827' }}>4. Contenuti e Annunci</h2>
          <p style={{ color: '#111827' }}>Le agenzie sono responsabili dell&apos;accuratezza degli annunci pubblicati. CasaAI si riserva il diritto di rimuovere contenuti inappropriati, ingannevoli o illegali.</p>

          <h2 style={{ color: '#111827' }}>5. Limitazioni AI</h2>
          <p style={{ color: '#111827' }}>Le valutazioni e i suggerimenti dell&apos;intelligenza artificiale sono indicativi e non costituiscono consulenza professionale. Si consiglia sempre di verificare le informazioni con un professionista.</p>

          <h2 style={{ color: '#111827' }}>6. Pagamenti</h2>
          <p style={{ color: '#111827' }}>I piani a pagamento per agenzie sono gestiti tramite Stripe. I prezzi sono indicati IVA inclusa. Il rinnovo è automatico salvo disdetta.</p>

          <h2 style={{ color: '#111827' }}>7. Limitazione di Responsabilità</h2>
          <p style={{ color: '#111827' }}>CasaAI non è responsabile per danni diretti o indiretti derivanti dall&apos;uso del servizio, incluse le informazioni fornite dall&apos;AI.</p>

          <h2 style={{ color: '#111827' }}>8. Legge Applicabile</h2>
          <p style={{ color: '#111827' }}>I presenti termini sono regolati dalla legge italiana. Foro competente: Tribunale di Napoli.</p>

          <h2 style={{ color: '#111827' }}>9. Contatti</h2>
          <p style={{ color: '#111827' }}>Per domande sui termini: legal@casaai.it</p>
        </div>
      </main>
      <Footer />
    </>
  )
}

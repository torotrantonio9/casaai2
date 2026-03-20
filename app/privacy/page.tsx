import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Privacy Policy — CasaAI',
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 prose prose-gray">
          <h1 style={{ color: '#111827' }}>Informativa sulla Privacy</h1>
          <p className="text-sm text-gray-500">Ultimo aggiornamento: 1 Marzo 2026</p>

          <h2 style={{ color: '#111827' }}>1. Titolare del Trattamento</h2>
          <p style={{ color: '#111827' }}>CasaAI S.r.l., con sede in Napoli (NA), Via Toledo 100, P.IVA 12345678901, in qualità di Titolare del trattamento, informa ai sensi dell&apos;art. 13 del Regolamento UE 2016/679 (GDPR) che i dati personali saranno trattati con le modalità e per le finalità seguenti.</p>

          <h2 style={{ color: '#111827' }}>2. Dati Raccolti</h2>
          <p style={{ color: '#111827' }}>Raccogliamo i seguenti dati personali: nome, cognome, indirizzo email, numero di telefono, preferenze immobiliari, dati di navigazione (cookie tecnici), dati forniti volontariamente tramite form e chat AI.</p>

          <h2 style={{ color: '#111827' }}>3. Finalità del Trattamento</h2>
          <p style={{ color: '#111827' }}>I dati sono trattati per: (a) fornitura del servizio di ricerca immobiliare AI; (b) gestione contatti tra utenti e agenzie; (c) miglioramento del servizio tramite analisi aggregate; (d) invio comunicazioni di servizio; (e) adempimenti di legge.</p>

          <h2 style={{ color: '#111827' }}>4. Base Giuridica</h2>
          <p style={{ color: '#111827' }}>Il trattamento è basato su: consenso dell&apos;interessato (art. 6.1.a GDPR), esecuzione contrattuale (art. 6.1.b), obbligo legale (art. 6.1.c), legittimo interesse (art. 6.1.f).</p>

          <h2 style={{ color: '#111827' }}>5. Conservazione dei Dati</h2>
          <p style={{ color: '#111827' }}>I dati personali sono conservati per il tempo necessario al raggiungimento delle finalità per cui sono raccolti, e comunque non oltre 24 mesi dall&apos;ultimo utilizzo del servizio.</p>

          <h2 style={{ color: '#111827' }}>6. Diritti dell&apos;Interessato</h2>
          <p style={{ color: '#111827' }}>L&apos;interessato ha diritto di accesso, rettifica, cancellazione, limitazione, portabilità e opposizione al trattamento. Per esercitare i propri diritti: privacy@casaai.it</p>

          <h2 style={{ color: '#111827' }}>7. Cookie</h2>
          <p style={{ color: '#111827' }}>Il sito utilizza esclusivamente cookie tecnici necessari al funzionamento. Non vengono utilizzati cookie di profilazione di terze parti senza consenso esplicito.</p>

          <h2 style={{ color: '#111827' }}>8. Contatti</h2>
          <p style={{ color: '#111827' }}>Per qualsiasi domanda: privacy@casaai.it — DPO: dpo@casaai.it</p>
        </div>
      </main>
      <Footer />
    </>
  )
}

import type { ChatContext } from '@/types/database'
import type { IntentResult, ListingCard } from '@/types/chat'

export const SYSTEM_PROMPT_CHAT = `Rispondi SEMPRE in italiano.
Sei CasaAI, assistente immobiliare AI per il mercato italiano.
Aiuti gli utenti a trovare casa in Campania e nel Sud Italia.

Regole:
- Risposte brevi e utili (max 2-3 frasi)
- Usa un tono cordiale ma professionale
- Se hai mostrato annunci, commentali brevemente
- Non inventare dati sugli annunci
- Non generare JSON nel testo
- Non usare commenti HTML
- Suggerisci come affinare la ricerca
- Se l'utente chiede di contattare, indica il form nell'annuncio`

export const SYSTEM_PROMPT_VALUATION = `Rispondi SEMPRE in italiano.
Sei un esperto di valutazioni immobiliari per il mercato italiano, specializzato in Campania.
Analizza i dati forniti e fornisci una stima realistica basata su:
- Prezzi medi della zona (€/mq)
- Caratteristiche dell'immobile (piano, ascensore, stato, classe energetica)
- Trend di mercato locale
- Fattori positivi e negativi

Fornisci:
1. Range di prezzo stimato (min-max)
2. Prezzo più probabile
3. Prezzo al mq stimato
4. Fattori che aumentano il valore
5. Fattori che diminuiscono il valore
6. Trend del mercato nella zona
7. Livello di confidenza della stima (alto/medio/basso)

Non inventare dati. Se non hai informazioni sufficienti, indicalo.`

export const SYSTEM_PROMPT_DESCRIPTION = `Rispondi SEMPRE in italiano.
Sei un copywriter immobiliare esperto del mercato italiano.
Genera descrizioni accattivanti per annunci immobiliari.
La descrizione deve:
- Essere tra 100 e 200 parole
- Evidenziare i punti di forza
- Menzionare la zona e i servizi vicini
- Usare un linguaggio professionale ma invitante
- Non esagerare o mentire sulle caratteristiche
- Includere dettagli tecnici rilevanti (superficie, classe energetica)
Non aggiungere titoli o intestazioni, solo il testo della descrizione.`

export const SYSTEM_PROMPT_LEAD_SCORING = `Rispondi SEMPRE in italiano.
Sei un esperto di lead scoring immobiliare.
Analizza il lead e assegna un punteggio da 0 a 100.
Ritorna SOLO un oggetto JSON con:
{
  "score": numero da 0 a 100,
  "reason": "motivazione breve in italiano"
}

Criteri di scoring:
- Messaggio dettagliato con esigenze specifiche: +20
- Telefono fornito: +15
- Budget indicato: +10
- Richiesta urgente: +10
- Messaggio generico: -10
- Solo email senza messaggio: -20`

export const SYSTEM_PROMPT_DRAFT_REPLY = `Rispondi SEMPRE in italiano.
Sei un agente immobiliare professionista italiano.
Scrivi una bozza di risposta al potenziale acquirente.
La risposta deve:
- Essere personalizzata in base al messaggio ricevuto
- Ringraziare per l'interesse
- Rispondere alle domande specifiche se presenti
- Proporre un appuntamento o una visita
- Essere professionale ma cordiale
- Includere i dettagli dell'immobile rilevanti
Non aggiungere oggetto email o intestazioni formali.`

export function buildContextMessage(context: ChatContext): string {
  const parts: string[] = ['Rispondi SEMPRE in italiano.']

  parts.push(SYSTEM_PROMPT_CHAT)

  parts.push('\nContesto dell\'utente:')

  if (context.intent) {
    parts.push(`- Cerca: ${context.intent === 'sale' ? 'acquisto' : 'affitto'}`)
  }
  if (context.who_is_searching) {
    const whoMap: Record<string, string> = {
      solo: 'Persona singola',
      coppia: 'Coppia',
      famiglia: 'Famiglia',
      investimento: 'Investitore',
    }
    parts.push(`- Chi cerca: ${whoMap[context.who_is_searching] || context.who_is_searching}`)
  }
  if (context.rooms_needed) {
    parts.push(`- Locali: ${context.rooms_needed === 4 ? '4+' : context.rooms_needed}`)
  }
  if (context.smart_working) {
    parts.push('- Ha bisogno di uno studio per smart working')
  }
  if (context.budget_max) {
    const formatted = Number(context.budget_max).toLocaleString('it-IT')
    parts.push(`- Budget massimo: €${formatted}${context.intent === 'rent' ? '/mese' : ''}`)
  }
  if (context.location_label) {
    parts.push(`- Zona: ${context.location_label}`)
  }
  if (context.max_distance_km) {
    parts.push(`- Distanza massima: ${context.max_distance_km}km`)
  }
  if (context.must_have && context.must_have.length > 0) {
    parts.push(`- Caratteristiche richieste: ${context.must_have.join(', ')}`)
  }
  if (context.custom_note) {
    parts.push(`- Note aggiuntive: ${context.custom_note}`)
  }

  return parts.join('\n')
}

export function buildSystemPrompt(
  context: ChatContext | null,
  intentResult: IntentResult,
  listings: ListingCard[]
): string {
  let prompt = context ? buildContextMessage(context) : SYSTEM_PROMPT_CHAT

  if (listings.length > 0) {
    prompt += `\n\nHo trovato ${listings.length} annunci. Ecco un riepilogo:`
    listings.forEach((l, i) => {
      prompt += `\n${i + 1}. "${l.title}" - €${l.price.toLocaleString('it-IT')}${l.price_period ? '/mese' : ''} a ${l.city}, ${l.rooms || '?'} locali, ${l.surface_sqm || '?'}mq, match ${l.match_score}%`
    })
    prompt += '\n\nCommenta brevemente gli annunci trovati. Non elencarli tutti, evidenzia i migliori 2-3.'
  } else {
    prompt += '\n\nNon ho trovato annunci con questi criteri. Suggerisci di modificare i filtri.'
  }

  if (intentResult.intent === 'question') {
    prompt += '\nL\'utente ha una domanda. Rispondi in modo utile e conciso.'
  }

  return prompt
}

export function generateSuggestions(
  intentResult: IntentResult,
  listings: ListingCard[],
  context: ChatContext | null
): string[] {
  const suggestions: string[] = []

  if (listings.length === 0) {
    suggestions.push('Amplia il budget')
    suggestions.push('Cerca in altre zone')
    if (context?.rooms_needed && context.rooms_needed > 2) {
      suggestions.push('Riduci il numero di locali')
    }
    return suggestions
  }

  if (intentResult.intent === 'show_cards' || intentResult.intent === 'new_search') {
    suggestions.push('Mostra altri annunci')
    if (!context?.must_have?.includes('Ascensore')) {
      suggestions.push('Solo con ascensore')
    }
    if (!context?.must_have?.includes('Posto auto')) {
      suggestions.push('Con posto auto')
    }
    suggestions.push('Confronta i primi due')
  } else if (intentResult.intent === 'refine_filters') {
    suggestions.push('Mostra tutti gli annunci')
    suggestions.push('Abbassa il budget')
    suggestions.push('Cambia zona')
  } else if (intentResult.intent === 'question') {
    suggestions.push('Mostra annunci simili')
    suggestions.push('Contatta l\'agenzia')
  }

  return suggestions.slice(0, 4)
}

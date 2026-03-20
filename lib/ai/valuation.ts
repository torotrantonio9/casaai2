import { askJSON, AIError } from './claude'
import { SYSTEM_PROMPT_VALUATION } from './prompts'

// Prezzi medi reali Campania 2026 (€/mq)
const MARKET_PRICES: Record<string, { min: number; max: number; avg: number }> = {
  'Napoli': { min: 1800, max: 4500, avg: 2800 },
  'Caserta': { min: 900, max: 1800, avg: 1200 },
  'Salerno': { min: 1200, max: 2500, avg: 1700 },
  'Avellino': { min: 700, max: 1400, avg: 950 },
  'Benevento': { min: 600, max: 1200, avg: 850 },
  'Pozzuoli': { min: 1600, max: 3500, avg: 2200 },
  'Torre del Greco': { min: 1200, max: 2200, avg: 1600 },
  'Castellammare di Stabia': { min: 1000, max: 2000, avg: 1400 },
  'Giugliano in Campania': { min: 1100, max: 2000, avg: 1400 },
  'Portici': { min: 1500, max: 2800, avg: 2000 },
  'Ercolano': { min: 1300, max: 2500, avg: 1800 },
  'Sorrento': { min: 3000, max: 7000, avg: 4500 },
  'Amalfi': { min: 3500, max: 8000, avg: 5500 },
  'Capri': { min: 5000, max: 12000, avg: 8000 },
  'Ischia': { min: 2000, max: 5000, avg: 3200 },
}

export interface ValuationInput {
  city: string
  zone?: string
  property_type: string
  surface_sqm: number
  rooms: number
  floor?: number
  total_floors?: number
  year_built?: number
  energy_class?: string
  has_elevator?: boolean
  has_parking?: boolean
  has_garden?: boolean
  has_terrace?: boolean
  has_balcony?: boolean
  condition?: string
}

export interface ValuationResult {
  price_min: number
  price_max: number
  price_avg: number
  price_per_sqm: number
  positive_factors: string[]
  negative_factors: string[]
  market_trend: string
  confidence: 'alto' | 'medio' | 'basso'
  ai_analysis: string
}

export async function evaluateProperty(input: ValuationInput): Promise<ValuationResult> {
  // Get market reference
  const cityPrices = MARKET_PRICES[input.city] || MARKET_PRICES['Napoli']

  // Base calculation
  const basePricePerSqm = cityPrices.avg
  let adjustedPricePerSqm = basePricePerSqm

  const positiveFactors: string[] = []
  const negativeFactors: string[] = []

  // Adjustments
  if (input.has_elevator) {
    adjustedPricePerSqm *= 1.05
    positiveFactors.push('Presenza ascensore')
  } else if (input.floor && input.floor > 2) {
    adjustedPricePerSqm *= 0.92
    negativeFactors.push('Piano alto senza ascensore')
  }

  if (input.has_parking) {
    adjustedPricePerSqm *= 1.08
    positiveFactors.push('Posto auto')
  }

  if (input.has_garden) {
    adjustedPricePerSqm *= 1.10
    positiveFactors.push('Giardino')
  }

  if (input.has_terrace) {
    adjustedPricePerSqm *= 1.06
    positiveFactors.push('Terrazzo')
  }

  if (input.energy_class && ['A4', 'A3', 'A2', 'A1', 'B'].includes(input.energy_class)) {
    adjustedPricePerSqm *= 1.07
    positiveFactors.push(`Classe energetica ${input.energy_class}`)
  } else if (input.energy_class && ['F', 'G'].includes(input.energy_class)) {
    adjustedPricePerSqm *= 0.90
    negativeFactors.push(`Classe energetica ${input.energy_class} — possibili costi di riqualificazione`)
  }

  if (input.year_built && input.year_built > 2015) {
    adjustedPricePerSqm *= 1.10
    positiveFactors.push('Costruzione recente')
  } else if (input.year_built && input.year_built < 1970) {
    adjustedPricePerSqm *= 0.88
    negativeFactors.push('Edificio datato — possibili lavori di ristrutturazione')
  }

  if (input.floor && input.floor >= 4 && input.has_elevator) {
    adjustedPricePerSqm *= 1.04
    positiveFactors.push('Piano alto con vista')
  }

  if (input.property_type === 'villa') {
    adjustedPricePerSqm *= 1.15
    positiveFactors.push('Tipologia villa')
  }

  const estimatedPrice = Math.round(adjustedPricePerSqm * input.surface_sqm)
  const priceMin = Math.round(estimatedPrice * 0.88)
  const priceMax = Math.round(estimatedPrice * 1.12)

  // AI analysis
  let aiAnalysis = ''
  try {
    const prompt = `Analizza questo immobile e fornisci un commento di 3-4 frasi:
Città: ${input.city}${input.zone ? `, zona ${input.zone}` : ''}
Tipo: ${input.property_type}
Superficie: ${input.surface_sqm}mq
Locali: ${input.rooms}
Piano: ${input.floor || 'N/D'}
Anno: ${input.year_built || 'N/D'}
Classe energetica: ${input.energy_class || 'N/D'}
Prezzo stimato: €${estimatedPrice.toLocaleString('it-IT')}
Prezzo/mq zona: €${cityPrices.avg}/mq (range: €${cityPrices.min}-${cityPrices.max}/mq)
Fattori positivi: ${positiveFactors.join(', ') || 'nessuno'}
Fattori negativi: ${negativeFactors.join(', ') || 'nessuno'}

Fornisci SOLO il testo dell'analisi, senza JSON.`

    const result = await askJSON<{ analysis: string }>(
      prompt,
      'Rispondi SEMPRE in italiano. Ritorna un JSON con campo "analysis" contenente il testo dell\'analisi (3-4 frasi).'
    )
    aiAnalysis = result.analysis || ''
  } catch {
    aiAnalysis = `Stima basata sui prezzi medi di ${input.city} (€${cityPrices.avg}/mq). ${positiveFactors.length > 0 ? `Punti di forza: ${positiveFactors.join(', ')}.` : ''} ${negativeFactors.length > 0 ? `Aspetti da considerare: ${negativeFactors.join(', ')}.` : ''}`
  }

  return {
    price_min: priceMin,
    price_max: priceMax,
    price_avg: estimatedPrice,
    price_per_sqm: Math.round(adjustedPricePerSqm),
    positive_factors: positiveFactors,
    negative_factors: negativeFactors,
    market_trend: 'Stabile con leggera crescita nelle zone centrali',
    confidence: positiveFactors.length + negativeFactors.length >= 3 ? 'alto' : 'medio',
    ai_analysis: aiAnalysis,
  }
}

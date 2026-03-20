import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Seed agency — columns match agencies table in 001_schema.sql:
 * id, name, slug, description, logo_url, address, city, province,
 * phone, email, website, vat_number, subscription_plan,
 * stripe_customer_id, stripe_subscription_id, max_listings,
 * max_agents, is_active, created_at, updated_at
 */
const SEED_AGENCY = {
  name: 'Immobiliare Vesuvio',
  slug: 'immobiliare-vesuvio',
  description: 'Agenzia immobiliare leader in Campania dal 1998',
  address: 'Via Toledo 156',
  city: 'Napoli',
  province: 'NA',
  phone: '+39 081 555 1234',
  email: 'info@immobiliarevesuvio.it',
  website: 'https://immobiliarevesuvio.it',
  vat_number: 'IT12345678901',
  subscription_plan: 'pro',
  max_listings: 100,
  max_agents: 10,
  is_active: true,
}

/**
 * Seed listing shape — columns match listings table in 001_schema.sql:
 * id, agency_id, agent_id, title, description, ai_description,
 * listing_type, property_type, status, price, price_period,
 * price_per_sqm, condominium_fees, address, city, province, cap,
 * zone, lat, lng, surface_sqm, rooms, bedrooms, bathrooms, floor,
 * total_floors, year_built, energy_class, has_elevator, has_parking,
 * has_garden, has_terrace, has_balcony, has_cellar,
 * has_air_conditioning, has_heating, is_furnished, pet_friendly,
 * is_accessible, photos, virtual_tour_url, video_url, slug,
 * is_featured, views_count, contacts_count, embedding,
 * external_id, external_source, external_url, published_at,
 * expires_at, created_at, updated_at
 */
interface SeedListing {
  title: string
  listing_type: 'sale' | 'rent'
  property_type: 'apartment' | 'house' | 'villa' | 'land' | 'commercial'
  status: 'active' | 'sold' | 'rented'
  price: number
  price_period?: string
  address: string
  city: string
  province: string
  zone?: string
  cap: string
  lat: number
  lng: number
  surface_sqm: number
  rooms: number
  bedrooms: number
  bathrooms: number
  floor: number
  total_floors: number
  year_built: number
  energy_class: string
  has_elevator: boolean
  has_parking: boolean
  has_garden: boolean
  has_terrace: boolean
  has_balcony: boolean
  has_cellar: boolean
  has_air_conditioning: boolean
  has_heating: boolean
  is_furnished: boolean
  pet_friendly: boolean
  is_accessible: boolean
  is_featured: boolean
}

const SEED_LISTINGS: SeedListing[] = [
  // === NAPOLI - Vendita ===
  { title: 'Trilocale luminoso in Via Toledo', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 285000, address: 'Via Toledo 234', city: 'Napoli', province: 'NA', zone: 'Centro Storico', cap: '80134', lat: 40.8468, lng: 14.2531, surface_sqm: 95, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 4, total_floors: 6, year_built: 1960, energy_class: 'D', has_elevator: true, has_parking: false, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: true, has_air_conditioning: true, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: true },
  { title: 'Attico con vista Golfo', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 520000, address: 'Via Posillipo 88', city: 'Napoli', province: 'NA', zone: 'Posillipo', cap: '80123', lat: 40.8122, lng: 14.1978, surface_sqm: 140, rooms: 4, bedrooms: 3, bathrooms: 2, floor: 7, total_floors: 7, year_built: 1985, energy_class: 'C', has_elevator: true, has_parking: true, has_garden: false, has_terrace: true, has_balcony: true, has_cellar: true, has_air_conditioning: true, has_heating: true, is_furnished: true, pet_friendly: true, is_accessible: true, is_featured: true },
  { title: 'Bilocale ristrutturato al Vomero', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 195000, address: 'Via Scarlatti 120', city: 'Napoli', province: 'NA', zone: 'Vomero', cap: '80129', lat: 40.8500, lng: 14.2333, surface_sqm: 65, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 3, total_floors: 5, year_built: 1970, energy_class: 'E', has_elevator: true, has_parking: false, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: false, has_air_conditioning: true, has_heating: true, is_furnished: false, pet_friendly: false, is_accessible: true, is_featured: false },
  { title: 'Quadrilocale con box a Fuorigrotta', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 310000, address: 'Via Giulio Cesare 45', city: 'Napoli', province: 'NA', zone: 'Fuorigrotta', cap: '80125', lat: 40.8281, lng: 14.1903, surface_sqm: 110, rooms: 4, bedrooms: 3, bathrooms: 2, floor: 2, total_floors: 8, year_built: 1995, energy_class: 'C', has_elevator: true, has_parking: true, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: true, has_air_conditioning: true, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: false },
  { title: 'Monolocale studenti zona Università', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 98000, address: 'Via Mezzocannone 16', city: 'Napoli', province: 'NA', zone: 'Centro Storico', cap: '80134', lat: 40.8473, lng: 14.2558, surface_sqm: 35, rooms: 1, bedrooms: 1, bathrooms: 1, floor: 2, total_floors: 4, year_built: 1920, energy_class: 'G', has_elevator: false, has_parking: false, has_garden: false, has_terrace: false, has_balcony: false, has_cellar: false, has_air_conditioning: false, has_heating: true, is_furnished: true, pet_friendly: false, is_accessible: false, is_featured: false },
  { title: 'Appartamento signorile a Chiaia', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 450000, address: 'Via dei Mille 32', city: 'Napoli', province: 'NA', zone: 'Chiaia', cap: '80121', lat: 40.8371, lng: 14.2366, surface_sqm: 130, rooms: 4, bedrooms: 3, bathrooms: 2, floor: 5, total_floors: 6, year_built: 1930, energy_class: 'D', has_elevator: true, has_parking: false, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: true, has_air_conditioning: true, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: true },
  { title: 'Trilocale moderno a Mergellina', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 340000, address: 'Via Mergellina 22', city: 'Napoli', province: 'NA', zone: 'Mergellina', cap: '80122', lat: 40.8297, lng: 14.2203, surface_sqm: 100, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 6, total_floors: 8, year_built: 2005, energy_class: 'B', has_elevator: true, has_parking: true, has_garden: false, has_terrace: true, has_balcony: false, has_cellar: true, has_air_conditioning: true, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: false },
  { title: 'Appartamento da ristrutturare Sanità', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 120000, address: 'Via della Sanità 78', city: 'Napoli', province: 'NA', zone: 'Sanità', cap: '80136', lat: 40.8577, lng: 14.2519, surface_sqm: 80, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 1, total_floors: 3, year_built: 1890, energy_class: 'G', has_elevator: false, has_parking: false, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: true, has_air_conditioning: false, has_heating: true, is_furnished: false, pet_friendly: false, is_accessible: false, is_featured: false },
  { title: 'Penthouse panoramico Corso Vittorio Emanuele', listing_type: 'sale', property_type: 'apartment', status: 'sold', price: 680000, address: 'Corso Vittorio Emanuele 180', city: 'Napoli', province: 'NA', zone: 'Centro', cap: '80135', lat: 40.8419, lng: 14.2397, surface_sqm: 180, rooms: 5, bedrooms: 4, bathrooms: 3, floor: 8, total_floors: 8, year_built: 2000, energy_class: 'A2', has_elevator: true, has_parking: true, has_garden: false, has_terrace: true, has_balcony: true, has_cellar: true, has_air_conditioning: true, has_heating: true, is_furnished: true, pet_friendly: true, is_accessible: true, is_featured: false },
  { title: 'Trilocale con giardino Arenella', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 230000, address: 'Via dell\'Arenella 56', city: 'Napoli', province: 'NA', zone: 'Arenella', cap: '80128', lat: 40.8556, lng: 14.2253, surface_sqm: 90, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 0, total_floors: 3, year_built: 1980, energy_class: 'E', has_elevator: false, has_parking: true, has_garden: true, has_terrace: false, has_balcony: false, has_cellar: true, has_air_conditioning: false, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: false },

  // === NAPOLI - Affitto ===
  { title: 'Bilocale arredato Centro Direzionale', listing_type: 'rent', property_type: 'apartment', status: 'active', price: 750, price_period: 'month', address: 'Centro Direzionale Isola F3', city: 'Napoli', province: 'NA', zone: 'Centro Direzionale', cap: '80143', lat: 40.8563, lng: 14.2800, surface_sqm: 55, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 10, total_floors: 15, year_built: 1990, energy_class: 'D', has_elevator: true, has_parking: true, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: false, has_air_conditioning: true, has_heating: true, is_furnished: true, pet_friendly: false, is_accessible: true, is_featured: false },
  { title: 'Trilocale affitto Vomero panoramico', listing_type: 'rent', property_type: 'apartment', status: 'active', price: 1100, price_period: 'month', address: 'Via Cilea 88', city: 'Napoli', province: 'NA', zone: 'Vomero', cap: '80129', lat: 40.8522, lng: 14.2289, surface_sqm: 85, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 5, total_floors: 7, year_built: 1975, energy_class: 'D', has_elevator: true, has_parking: false, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: false, has_air_conditioning: true, has_heating: true, is_furnished: true, pet_friendly: true, is_accessible: true, is_featured: true },
  { title: 'Monolocale arredato Port\'Alba studenti', listing_type: 'rent', property_type: 'apartment', status: 'active', price: 500, price_period: 'month', address: 'Via Port\'Alba 30', city: 'Napoli', province: 'NA', zone: 'Centro Storico', cap: '80134', lat: 40.8496, lng: 14.2519, surface_sqm: 30, rooms: 1, bedrooms: 1, bathrooms: 1, floor: 3, total_floors: 4, year_built: 1880, energy_class: 'F', has_elevator: false, has_parking: false, has_garden: false, has_terrace: false, has_balcony: false, has_cellar: false, has_air_conditioning: false, has_heating: true, is_furnished: true, pet_friendly: false, is_accessible: false, is_featured: false },
  { title: 'Quadrilocale affitto Posillipo', listing_type: 'rent', property_type: 'apartment', status: 'active', price: 1800, price_period: 'month', address: 'Via Petrarca 44', city: 'Napoli', province: 'NA', zone: 'Posillipo', cap: '80122', lat: 40.8156, lng: 14.2011, surface_sqm: 120, rooms: 4, bedrooms: 3, bathrooms: 2, floor: 3, total_floors: 5, year_built: 1965, energy_class: 'D', has_elevator: true, has_parking: true, has_garden: false, has_terrace: true, has_balcony: true, has_cellar: true, has_air_conditioning: true, has_heating: true, is_furnished: true, pet_friendly: true, is_accessible: true, is_featured: false },
  { title: 'Loft open space Spaccanapoli', listing_type: 'rent', property_type: 'apartment', status: 'rented', price: 900, price_period: 'month', address: 'Via Benedetto Croce 12', city: 'Napoli', province: 'NA', zone: 'Spaccanapoli', cap: '80134', lat: 40.8487, lng: 14.2535, surface_sqm: 70, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 1, total_floors: 3, year_built: 1850, energy_class: 'F', has_elevator: false, has_parking: false, has_garden: false, has_terrace: false, has_balcony: false, has_cellar: false, has_air_conditioning: true, has_heating: true, is_furnished: true, pet_friendly: false, is_accessible: false, is_featured: false },

  // === SALERNO ===
  { title: 'Trilocale vista mare Lungomare', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 240000, address: 'Lungomare Trieste 45', city: 'Salerno', province: 'SA', zone: 'Lungomare', cap: '84121', lat: 40.6795, lng: 14.7646, surface_sqm: 90, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 4, total_floors: 6, year_built: 1978, energy_class: 'D', has_elevator: true, has_parking: false, has_garden: false, has_terrace: true, has_balcony: true, has_cellar: false, has_air_conditioning: true, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: true },
  { title: 'Bilocale Centro Storico Salerno', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 135000, address: 'Via dei Mercanti 22', city: 'Salerno', province: 'SA', zone: 'Centro Storico', cap: '84121', lat: 40.6793, lng: 14.7588, surface_sqm: 60, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 2, total_floors: 4, year_built: 1950, energy_class: 'E', has_elevator: false, has_parking: false, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: false, has_air_conditioning: false, has_heating: true, is_furnished: false, pet_friendly: false, is_accessible: false, is_featured: false },
  { title: 'Villa indipendente Salerno colline', listing_type: 'sale', property_type: 'villa', status: 'active', price: 480000, address: 'Via Casa Manzo 15', city: 'Salerno', province: 'SA', zone: 'Colline', cap: '84131', lat: 40.6900, lng: 14.7500, surface_sqm: 200, rooms: 5, bedrooms: 4, bathrooms: 3, floor: 0, total_floors: 2, year_built: 2000, energy_class: 'B', has_elevator: false, has_parking: true, has_garden: true, has_terrace: true, has_balcony: false, has_cellar: true, has_air_conditioning: true, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: true },
  { title: 'Affitto trilocale Salerno centro', listing_type: 'rent', property_type: 'apartment', status: 'active', price: 700, price_period: 'month', address: 'Corso Vittorio Emanuele 98', city: 'Salerno', province: 'SA', zone: 'Centro', cap: '84123', lat: 40.6822, lng: 14.7631, surface_sqm: 80, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 3, total_floors: 5, year_built: 1968, energy_class: 'E', has_elevator: true, has_parking: false, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: false, has_air_conditioning: true, has_heating: true, is_furnished: true, pet_friendly: false, is_accessible: true, is_featured: false },
  { title: 'Quadrilocale nuova costruzione Salerno', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 320000, address: 'Via San Leonardo 200', city: 'Salerno', province: 'SA', zone: 'San Leonardo', cap: '84131', lat: 40.6730, lng: 14.7870, surface_sqm: 110, rooms: 4, bedrooms: 3, bathrooms: 2, floor: 2, total_floors: 5, year_built: 2023, energy_class: 'A3', has_elevator: true, has_parking: true, has_garden: false, has_terrace: true, has_balcony: true, has_cellar: true, has_air_conditioning: true, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: false },

  // === CASERTA ===
  { title: 'Trilocale vicino Reggia di Caserta', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 145000, address: 'Viale Douhet 34', city: 'Caserta', province: 'CE', zone: 'Centro', cap: '81100', lat: 41.0726, lng: 14.3262, surface_sqm: 95, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 2, total_floors: 4, year_built: 1975, energy_class: 'E', has_elevator: false, has_parking: true, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: true, has_air_conditioning: false, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: false, is_featured: false },
  { title: 'Villetta a schiera Caserta Sud', listing_type: 'sale', property_type: 'house', status: 'active', price: 220000, address: 'Via Nazionale Appia 156', city: 'Caserta', province: 'CE', zone: 'Caserta Sud', cap: '81100', lat: 41.0600, lng: 14.3350, surface_sqm: 130, rooms: 4, bedrooms: 3, bathrooms: 2, floor: 0, total_floors: 2, year_built: 2005, energy_class: 'C', has_elevator: false, has_parking: true, has_garden: true, has_terrace: false, has_balcony: true, has_cellar: true, has_air_conditioning: true, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: false },
  { title: 'Bilocale affitto Caserta stazione', listing_type: 'rent', property_type: 'apartment', status: 'active', price: 450, price_period: 'month', address: 'Via Roma 67', city: 'Caserta', province: 'CE', zone: 'Stazione', cap: '81100', lat: 41.0740, lng: 14.3330, surface_sqm: 55, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 1, total_floors: 3, year_built: 1960, energy_class: 'F', has_elevator: false, has_parking: false, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: false, has_air_conditioning: false, has_heating: true, is_furnished: true, pet_friendly: false, is_accessible: false, is_featured: false },
  { title: 'Appartamento elegante centro Caserta', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 175000, address: 'Corso Trieste 44', city: 'Caserta', province: 'CE', zone: 'Centro', cap: '81100', lat: 41.0750, lng: 14.3280, surface_sqm: 100, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 3, total_floors: 5, year_built: 1985, energy_class: 'D', has_elevator: true, has_parking: false, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: true, has_air_conditioning: true, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: false },
  { title: 'Quadrilocale con terrazzo Caserta', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 198000, address: 'Via Tescione 88', city: 'Caserta', province: 'CE', zone: 'Tescione', cap: '81100', lat: 41.0680, lng: 14.3200, surface_sqm: 115, rooms: 4, bedrooms: 3, bathrooms: 2, floor: 4, total_floors: 5, year_built: 1998, energy_class: 'D', has_elevator: true, has_parking: true, has_garden: false, has_terrace: true, has_balcony: false, has_cellar: true, has_air_conditioning: true, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: false },

  // === AVELLINO ===
  { title: 'Trilocale centro Avellino', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 95000, address: 'Corso Vittorio Emanuele 55', city: 'Avellino', province: 'AV', zone: 'Centro', cap: '83100', lat: 40.9146, lng: 14.7906, surface_sqm: 85, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 2, total_floors: 4, year_built: 1970, energy_class: 'E', has_elevator: false, has_parking: false, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: true, has_air_conditioning: false, has_heating: true, is_furnished: false, pet_friendly: false, is_accessible: false, is_featured: false },
  { title: 'Villa con giardino Avellino', listing_type: 'sale', property_type: 'villa', status: 'active', price: 280000, address: 'Contrada Bagnoli 12', city: 'Avellino', province: 'AV', zone: 'Periferia', cap: '83100', lat: 40.9200, lng: 14.8000, surface_sqm: 180, rooms: 5, bedrooms: 4, bathrooms: 2, floor: 0, total_floors: 2, year_built: 1995, energy_class: 'C', has_elevator: false, has_parking: true, has_garden: true, has_terrace: false, has_balcony: true, has_cellar: true, has_air_conditioning: true, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: false },
  { title: 'Bilocale affitto Avellino centro', listing_type: 'rent', property_type: 'apartment', status: 'active', price: 380, price_period: 'month', address: 'Via Tagliamento 15', city: 'Avellino', province: 'AV', zone: 'Centro', cap: '83100', lat: 40.9155, lng: 14.7950, surface_sqm: 50, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 1, total_floors: 3, year_built: 1965, energy_class: 'F', has_elevator: false, has_parking: false, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: false, has_air_conditioning: false, has_heating: true, is_furnished: true, pet_friendly: false, is_accessible: false, is_featured: false },

  // === BENEVENTO ===
  { title: 'Trilocale ristrutturato Benevento', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 82000, address: 'Corso Garibaldi 78', city: 'Benevento', province: 'BN', zone: 'Centro', cap: '82100', lat: 41.1297, lng: 14.7826, surface_sqm: 80, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 1, total_floors: 3, year_built: 1955, energy_class: 'E', has_elevator: false, has_parking: false, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: true, has_air_conditioning: false, has_heating: true, is_furnished: false, pet_friendly: false, is_accessible: false, is_featured: false },
  { title: 'Casa indipendente Benevento', listing_type: 'sale', property_type: 'house', status: 'active', price: 150000, address: 'Contrada Piano Cappelle', city: 'Benevento', province: 'BN', zone: 'Piano Cappelle', cap: '82100', lat: 41.1200, lng: 14.7700, surface_sqm: 140, rooms: 4, bedrooms: 3, bathrooms: 2, floor: 0, total_floors: 2, year_built: 1990, energy_class: 'D', has_elevator: false, has_parking: true, has_garden: true, has_terrace: false, has_balcony: false, has_cellar: true, has_air_conditioning: false, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: false },
  { title: 'Affitto monolocale Benevento studenti', listing_type: 'rent', property_type: 'apartment', status: 'active', price: 300, price_period: 'month', address: 'Via delle Puglie 20', city: 'Benevento', province: 'BN', zone: 'Università', cap: '82100', lat: 41.1310, lng: 14.7850, surface_sqm: 35, rooms: 1, bedrooms: 1, bathrooms: 1, floor: 2, total_floors: 3, year_built: 1960, energy_class: 'G', has_elevator: false, has_parking: false, has_garden: false, has_terrace: false, has_balcony: false, has_cellar: false, has_air_conditioning: false, has_heating: true, is_furnished: true, pet_friendly: false, is_accessible: false, is_featured: false },

  // === COSTIERA / ISOLE ===
  { title: 'Appartamento vista mare Sorrento', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 420000, address: 'Via Correale 18', city: 'Sorrento', province: 'NA', zone: 'Centro', cap: '80067', lat: 40.6263, lng: 14.3758, surface_sqm: 90, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 3, total_floors: 4, year_built: 1960, energy_class: 'D', has_elevator: false, has_parking: false, has_garden: false, has_terrace: true, has_balcony: true, has_cellar: false, has_air_conditioning: true, has_heating: true, is_furnished: true, pet_friendly: false, is_accessible: false, is_featured: true },
  { title: 'Bilocale Ischia Porto', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 180000, address: 'Via Iasolino 45', city: 'Ischia', province: 'NA', zone: 'Porto', cap: '80077', lat: 40.7441, lng: 13.9419, surface_sqm: 55, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 1, total_floors: 3, year_built: 1980, energy_class: 'E', has_elevator: false, has_parking: false, has_garden: false, has_terrace: true, has_balcony: false, has_cellar: false, has_air_conditioning: true, has_heating: true, is_furnished: true, pet_friendly: false, is_accessible: false, is_featured: false },
  { title: 'Affitto stagionale Amalfi', listing_type: 'rent', property_type: 'apartment', status: 'active', price: 2200, price_period: 'month', address: 'Via Lorenzo d\'Amalfi 8', city: 'Amalfi', province: 'SA', zone: 'Centro', cap: '84011', lat: 40.6340, lng: 14.6027, surface_sqm: 65, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 2, total_floors: 3, year_built: 1900, energy_class: 'F', has_elevator: false, has_parking: false, has_garden: false, has_terrace: true, has_balcony: false, has_cellar: false, has_air_conditioning: true, has_heating: true, is_furnished: true, pet_friendly: false, is_accessible: false, is_featured: true },

  // === POZZUOLI / AREA FLEGREA ===
  { title: 'Trilocale Pozzuoli Rione Terra', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 195000, address: 'Via Rione Terra 22', city: 'Pozzuoli', province: 'NA', zone: 'Rione Terra', cap: '80078', lat: 40.8223, lng: 14.1198, surface_sqm: 85, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 2, total_floors: 4, year_built: 1970, energy_class: 'E', has_elevator: false, has_parking: false, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: true, has_air_conditioning: false, has_heating: true, is_furnished: false, pet_friendly: false, is_accessible: false, is_featured: false },
  { title: 'Villa Pozzuoli con giardino e piscina', listing_type: 'sale', property_type: 'villa', status: 'active', price: 650000, address: 'Via Campana 340', city: 'Pozzuoli', province: 'NA', zone: 'Campana', cap: '80078', lat: 40.8350, lng: 14.1100, surface_sqm: 250, rooms: 6, bedrooms: 4, bathrooms: 3, floor: 0, total_floors: 2, year_built: 2010, energy_class: 'A1', has_elevator: false, has_parking: true, has_garden: true, has_terrace: true, has_balcony: true, has_cellar: true, has_air_conditioning: true, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: true },
  { title: 'Bilocale affitto Pozzuoli centro', listing_type: 'rent', property_type: 'apartment', status: 'active', price: 550, price_period: 'month', address: 'Corso Umberto I 88', city: 'Pozzuoli', province: 'NA', zone: 'Centro', cap: '80078', lat: 40.8240, lng: 14.1220, surface_sqm: 50, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 3, total_floors: 4, year_built: 1965, energy_class: 'E', has_elevator: false, has_parking: false, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: false, has_air_conditioning: true, has_heating: true, is_furnished: true, pet_friendly: false, is_accessible: false, is_featured: false },

  // === TORRE DEL GRECO / PORTICI / ERCOLANO ===
  { title: 'Trilocale Torre del Greco mare', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 155000, address: 'Via Nazionale 234', city: 'Torre del Greco', province: 'NA', zone: 'Centro', cap: '80059', lat: 40.7861, lng: 14.3653, surface_sqm: 80, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 3, total_floors: 5, year_built: 1972, energy_class: 'E', has_elevator: true, has_parking: false, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: true, has_air_conditioning: false, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: false },
  { title: 'Quadrilocale Portici via Libertà', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 210000, address: 'Via Libertà 56', city: 'Portici', province: 'NA', zone: 'Centro', cap: '80055', lat: 40.8194, lng: 14.3378, surface_sqm: 105, rooms: 4, bedrooms: 3, bathrooms: 1, floor: 2, total_floors: 4, year_built: 1980, energy_class: 'D', has_elevator: true, has_parking: true, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: true, has_air_conditioning: true, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: false },
  { title: 'Bilocale Ercolano Scavi', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 125000, address: 'Corso Resina 78', city: 'Ercolano', province: 'NA', zone: 'Scavi', cap: '80056', lat: 40.8058, lng: 14.3481, surface_sqm: 60, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 1, total_floors: 3, year_built: 1965, energy_class: 'F', has_elevator: false, has_parking: false, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: false, has_air_conditioning: false, has_heating: true, is_furnished: false, pet_friendly: false, is_accessible: false, is_featured: false },
  { title: 'Affitto trilocale Portici università', listing_type: 'rent', property_type: 'apartment', status: 'active', price: 650, price_period: 'month', address: 'Via Università 22', city: 'Portici', province: 'NA', zone: 'Università', cap: '80055', lat: 40.8170, lng: 14.3400, surface_sqm: 75, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 2, total_floors: 4, year_built: 1970, energy_class: 'E', has_elevator: false, has_parking: false, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: false, has_air_conditioning: false, has_heating: true, is_furnished: true, pet_friendly: false, is_accessible: false, is_featured: false },

  // === GIUGLIANO / CASTELLAMMARE ===
  { title: 'Quadrilocale Giugliano nuovo', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 178000, address: 'Via Roma 123', city: 'Giugliano in Campania', province: 'NA', zone: 'Centro', cap: '80014', lat: 40.9281, lng: 14.1953, surface_sqm: 100, rooms: 4, bedrooms: 3, bathrooms: 2, floor: 1, total_floors: 4, year_built: 2015, energy_class: 'B', has_elevator: true, has_parking: true, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: true, has_air_conditioning: true, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: false },
  { title: 'Trilocale Castellammare lungomare', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 165000, address: 'Via De Turris 45', city: 'Castellammare di Stabia', province: 'NA', zone: 'Lungomare', cap: '80053', lat: 40.6945, lng: 14.4783, surface_sqm: 80, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 4, total_floors: 6, year_built: 1982, energy_class: 'D', has_elevator: true, has_parking: false, has_garden: false, has_terrace: true, has_balcony: true, has_cellar: false, has_air_conditioning: true, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: false },
  { title: 'Villa bifamiliare Giugliano', listing_type: 'sale', property_type: 'house', status: 'active', price: 265000, address: 'Via Lago Patria 88', city: 'Giugliano in Campania', province: 'NA', zone: 'Lago Patria', cap: '80014', lat: 40.9350, lng: 14.1800, surface_sqm: 150, rooms: 5, bedrooms: 3, bathrooms: 2, floor: 0, total_floors: 2, year_built: 2008, energy_class: 'B', has_elevator: false, has_parking: true, has_garden: true, has_terrace: true, has_balcony: false, has_cellar: true, has_air_conditioning: true, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: false },
  { title: 'Affitto bilocale Castellammare terme', listing_type: 'rent', property_type: 'apartment', status: 'rented', price: 500, price_period: 'month', address: 'Piazza Principe Umberto 5', city: 'Castellammare di Stabia', province: 'NA', zone: 'Terme', cap: '80053', lat: 40.6960, lng: 14.4800, surface_sqm: 50, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 1, total_floors: 3, year_built: 1958, energy_class: 'F', has_elevator: false, has_parking: false, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: false, has_air_conditioning: false, has_heating: true, is_furnished: true, pet_friendly: false, is_accessible: false, is_featured: false },

  // === ADDITIONAL NAPOLI ===
  { title: 'Trilocale Bagnoli ex Italsider', listing_type: 'sale', property_type: 'apartment', status: 'active', price: 175000, address: 'Via Bagnoli 156', city: 'Napoli', province: 'NA', zone: 'Bagnoli', cap: '80124', lat: 40.8120, lng: 14.1680, surface_sqm: 85, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 3, total_floors: 5, year_built: 1985, energy_class: 'D', has_elevator: true, has_parking: false, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: true, has_air_conditioning: false, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: false },
  { title: 'Bilocale investimento Quartieri Spagnoli', listing_type: 'sale', property_type: 'apartment', status: 'sold', price: 110000, address: 'Vico Lungo Gelso 8', city: 'Napoli', province: 'NA', zone: 'Quartieri Spagnoli', cap: '80134', lat: 40.8448, lng: 14.2488, surface_sqm: 45, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 2, total_floors: 4, year_built: 1850, energy_class: 'G', has_elevator: false, has_parking: false, has_garden: false, has_terrace: false, has_balcony: false, has_cellar: false, has_air_conditioning: false, has_heating: true, is_furnished: true, pet_friendly: false, is_accessible: false, is_featured: false },
  { title: 'Affitto quadrilocale Colli Aminei', listing_type: 'rent', property_type: 'apartment', status: 'active', price: 950, price_period: 'month', address: 'Via Colli Aminei 44', city: 'Napoli', province: 'NA', zone: 'Colli Aminei', cap: '80131', lat: 40.8630, lng: 14.2450, surface_sqm: 100, rooms: 4, bedrooms: 3, bathrooms: 1, floor: 4, total_floors: 6, year_built: 1978, energy_class: 'D', has_elevator: true, has_parking: true, has_garden: false, has_terrace: false, has_balcony: true, has_cellar: true, has_air_conditioning: true, has_heating: true, is_furnished: false, pet_friendly: true, is_accessible: true, is_featured: false },
  { title: 'Terreno edificabile Bacoli', listing_type: 'sale', property_type: 'land', status: 'active', price: 180000, address: 'Via Miliscola 200', city: 'Pozzuoli', province: 'NA', zone: 'Bacoli', cap: '80070', lat: 40.8000, lng: 14.0900, surface_sqm: 500, rooms: 0, bedrooms: 0, bathrooms: 0, floor: 0, total_floors: 0, year_built: 0, energy_class: 'pending', has_elevator: false, has_parking: false, has_garden: false, has_terrace: false, has_balcony: false, has_cellar: false, has_air_conditioning: false, has_heating: false, is_furnished: false, pet_friendly: false, is_accessible: true, is_featured: false },
  { title: 'Locale commerciale Via Chiaia', listing_type: 'sale', property_type: 'commercial', status: 'active', price: 350000, address: 'Via Chiaia 200', city: 'Napoli', province: 'NA', zone: 'Chiaia', cap: '80121', lat: 40.8365, lng: 14.2445, surface_sqm: 120, rooms: 3, bedrooms: 0, bathrooms: 1, floor: 0, total_floors: 1, year_built: 1940, energy_class: 'G', has_elevator: false, has_parking: false, has_garden: false, has_terrace: false, has_balcony: false, has_cellar: true, has_air_conditioning: true, has_heating: true, is_furnished: false, pet_friendly: false, is_accessible: true, is_featured: false },
  { title: 'Box auto Vomero', listing_type: 'sale', property_type: 'commercial', status: 'active', price: 35000, address: 'Via Luca Giordano 45', city: 'Napoli', province: 'NA', zone: 'Vomero', cap: '80129', lat: 40.8510, lng: 14.2310, surface_sqm: 18, rooms: 1, bedrooms: 0, bathrooms: 0, floor: -1, total_floors: 0, year_built: 1980, energy_class: 'pending', has_elevator: false, has_parking: true, has_garden: false, has_terrace: false, has_balcony: false, has_cellar: false, has_air_conditioning: false, has_heating: false, is_furnished: false, pet_friendly: false, is_accessible: true, is_featured: false },
]

// ---------- route ----------

export async function GET() {
  try {
    // 1. Check if agency already exists by name
    const { data: existingAgency } = await supabaseAdmin
      .from('agencies')
      .select('id')
      .eq('name', SEED_AGENCY.name)
      .single()

    let agencyId: string

    if (existingAgency) {
      agencyId = (existingAgency as Record<string, unknown>).id as string
    } else {
      const { data: newAgency, error: agencyError } = await supabaseAdmin
        .from('agencies')
        .insert(SEED_AGENCY)
        .select('id')
        .single()

      if (agencyError || !newAgency) {
        return NextResponse.json(
          { error: agencyError?.message || 'Errore creazione agenzia' },
          { status: 500 },
        )
      }
      agencyId = (newAgency as Record<string, unknown>).id as string
    }

    // 2. Delete existing listings for this agency
    await supabaseAdmin.from('listings').delete().eq('agency_id', agencyId)

    // 3. Insert listings — build with computed fields
    const listingsToInsert = SEED_LISTINGS.map((listing, index) => ({
      ...listing,
      agency_id: agencyId,
      slug: `${listing.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`,
      price_per_sqm:
        listing.surface_sqm > 0
          ? Math.round(listing.price / listing.surface_sqm)
          : null,
      published_at: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    }))

    // 4. Check which listings already exist by title (safety net)
    const { data: existingListings } = await supabaseAdmin
      .from('listings')
      .select('title')
      .eq('agency_id', agencyId)

    const existingTitles = new Set(
      (existingListings as Array<{ title: string }> | null)?.map((l) => l.title) ?? [],
    )

    const newListings = listingsToInsert.filter(
      (l) => !existingTitles.has(l.title),
    )

    if (newListings.length === 0) {
      return NextResponse.json({
        success: true,
        inserted: 0,
        agency_id: agencyId,
        message: 'Tutti gli annunci esistono già',
      })
    }

    const { data: insertedListings, error: insertError } = await supabaseAdmin
      .from('listings')
      .insert(newListings)
      .select('id')

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      inserted: insertedListings?.length || 0,
      agency_id: agencyId,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Errore seed'
    console.error('[seed]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

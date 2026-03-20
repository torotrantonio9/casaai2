-- CasaAI v2.0 — Database Schema
-- Supabase PostgreSQL with pgvector

-- Extensions
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================
CREATE TYPE listing_type AS ENUM ('sale', 'rent');
CREATE TYPE listing_status AS ENUM ('active', 'sold', 'rented', 'draft', 'expired');
CREATE TYPE property_type AS ENUM ('apartment', 'house', 'villa', 'land', 'commercial', 'garage', 'other');
CREATE TYPE energy_class AS ENUM ('A4', 'A3', 'A2', 'A1', 'B', 'C', 'D', 'E', 'F', 'G', 'pending');
CREATE TYPE user_role AS ENUM ('buyer', 'agent', 'agency_admin', 'admin');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'negotiation', 'closed_won', 'closed_lost');
CREATE TYPE lead_source AS ENUM ('chat', 'form', 'phone', 'whatsapp', 'email', 'portal', 'other');
CREATE TYPE subscription_plan AS ENUM ('free', 'starter', 'pro', 'enterprise');
CREATE TYPE import_job_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'buyer',
  agency_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- AGENCIES
-- ============================================
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  vat_number TEXT,
  subscription_plan subscription_plan NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  max_listings INTEGER NOT NULL DEFAULT 10,
  max_agents INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key for profiles.agency_id
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_agency
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE SET NULL;

-- ============================================
-- LISTINGS
-- ============================================
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  ai_description TEXT,
  listing_type listing_type NOT NULL,
  property_type property_type NOT NULL DEFAULT 'apartment',
  status listing_status NOT NULL DEFAULT 'active',

  -- Pricing
  price NUMERIC(12,2) NOT NULL,
  price_period TEXT, -- 'month' for rent
  price_per_sqm NUMERIC(8,2),
  condominium_fees NUMERIC(8,2),

  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT,
  cap TEXT,
  zone TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,

  -- Features
  surface_sqm INTEGER,
  rooms INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER DEFAULT 1,
  floor INTEGER,
  total_floors INTEGER,
  year_built INTEGER,
  energy_class energy_class DEFAULT 'pending',

  -- Amenities
  has_elevator BOOLEAN NOT NULL DEFAULT FALSE,
  has_parking BOOLEAN NOT NULL DEFAULT FALSE,
  has_garden BOOLEAN NOT NULL DEFAULT FALSE,
  has_terrace BOOLEAN NOT NULL DEFAULT FALSE,
  has_balcony BOOLEAN NOT NULL DEFAULT FALSE,
  has_cellar BOOLEAN NOT NULL DEFAULT FALSE,
  has_air_conditioning BOOLEAN NOT NULL DEFAULT FALSE,
  has_heating BOOLEAN NOT NULL DEFAULT FALSE,
  is_furnished BOOLEAN NOT NULL DEFAULT FALSE,
  pet_friendly BOOLEAN NOT NULL DEFAULT FALSE,
  is_accessible BOOLEAN NOT NULL DEFAULT FALSE,

  -- Media
  photos TEXT[] DEFAULT '{}',
  virtual_tour_url TEXT,
  video_url TEXT,

  -- SEO & Marketing
  slug TEXT UNIQUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  views_count INTEGER NOT NULL DEFAULT 0,
  contacts_count INTEGER NOT NULL DEFAULT 0,

  -- AI
  embedding vector(1536),

  -- External
  external_id TEXT,
  external_source TEXT,
  external_url TEXT,

  -- Timestamps
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_listings_agency ON listings(agency_id);
CREATE INDEX idx_listings_city ON listings(city);
CREATE INDEX idx_listings_type ON listings(listing_type);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_rooms ON listings(rooms);
CREATE INDEX idx_listings_featured ON listings(is_featured DESC, created_at DESC);
CREATE INDEX idx_listings_embedding ON listings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================
-- LISTING PRICE HISTORY
-- ============================================
CREATE TABLE listing_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  old_price NUMERIC(12,2),
  new_price NUMERIC(12,2) NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_price_history_listing ON listing_price_history(listing_id);

-- Auto-track price changes
CREATE OR REPLACE FUNCTION track_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    INSERT INTO listing_price_history (listing_id, old_price, new_price)
    VALUES (NEW.id, OLD.price, NEW.price);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_price_change
  AFTER UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION track_price_change();

-- ============================================
-- CHAT CONTEXTS (wizard 6 steps)
-- ============================================
CREATE TABLE chat_contexts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Step 1: Buy or Rent
  intent listing_type,
  -- Step 2: Who is searching
  who_is_searching TEXT, -- 'solo', 'coppia', 'famiglia', 'investimento'
  -- Step 3: Rooms
  rooms_needed INTEGER,
  smart_working BOOLEAN DEFAULT FALSE,
  -- Step 4: Budget
  budget_max NUMERIC(12,2),
  -- Step 5: Location
  location_label TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  max_distance_km INTEGER,
  -- Step 6: Must-have features
  must_have TEXT[] DEFAULT '{}',
  custom_note TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(session_id)
);

-- ============================================
-- LEADS
-- ============================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,

  -- Contact info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,

  -- Status
  status lead_status NOT NULL DEFAULT 'new',
  source lead_source NOT NULL DEFAULT 'form',

  -- AI
  ai_score INTEGER, -- 0-100
  ai_score_reason TEXT,
  ai_draft_reply TEXT,

  -- Metadata
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_agency ON leads(agency_id);
CREATE INDEX idx_leads_listing ON leads(listing_id);
CREATE INDEX idx_leads_status ON leads(status);

-- ============================================
-- MESSAGES (agency <-> buyer)
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sender_role TEXT NOT NULL DEFAULT 'buyer', -- 'buyer' | 'agent'
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_lead ON messages(lead_id);

-- ============================================
-- SAVED LISTINGS (favorites)
-- ============================================
CREATE TABLE saved_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- ============================================
-- LISTING VIEWS (analytics)
-- ============================================
CREATE TABLE listing_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id),
  session_id TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_views_listing ON listing_views(listing_id);
CREATE INDEX idx_views_date ON listing_views(created_at);

-- ============================================
-- IMPORT JOBS
-- ============================================
CREATE TABLE import_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  source TEXT NOT NULL, -- 'csv', 'url', 'idealista', 'webhook'
  status import_job_status NOT NULL DEFAULT 'pending',
  total_items INTEGER DEFAULT 0,
  imported_items INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================
-- TRIGGER: handle_new_user
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'buyer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- AUTO UPDATE updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_chat_contexts_updated_at BEFORE UPDATE ON chat_contexts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_contexts ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, edit own
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Agencies: public read, members edit
CREATE POLICY "agencies_select" ON agencies FOR SELECT USING (true);
CREATE POLICY "agencies_update" ON agencies FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.agency_id = agencies.id AND profiles.role IN ('agent', 'agency_admin'))
);

-- Listings: public read active, agency members CUD
CREATE POLICY "listings_select" ON listings FOR SELECT USING (status = 'active' OR agency_id IN (SELECT agency_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "listings_insert" ON listings FOR INSERT WITH CHECK (agency_id IN (SELECT agency_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "listings_update" ON listings FOR UPDATE USING (agency_id IN (SELECT agency_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "listings_delete" ON listings FOR DELETE USING (agency_id IN (SELECT agency_id FROM profiles WHERE id = auth.uid()));

-- Leads: agency members only
CREATE POLICY "leads_select" ON leads FOR SELECT USING (agency_id IN (SELECT agency_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "leads_insert" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "leads_update" ON leads FOR UPDATE USING (agency_id IN (SELECT agency_id FROM profiles WHERE id = auth.uid()));

-- Messages: lead participants
CREATE POLICY "messages_select" ON messages FOR SELECT USING (
  lead_id IN (SELECT id FROM leads WHERE agency_id IN (SELECT agency_id FROM profiles WHERE id = auth.uid()))
  OR sender_id = auth.uid()
);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (true);

-- Saved listings: own only
CREATE POLICY "saved_select" ON saved_listings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "saved_insert" ON saved_listings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "saved_delete" ON saved_listings FOR DELETE USING (user_id = auth.uid());

-- Chat contexts: own session or authenticated user
CREATE POLICY "chat_contexts_select" ON chat_contexts FOR SELECT USING (true);
CREATE POLICY "chat_contexts_insert" ON chat_contexts FOR INSERT WITH CHECK (true);
CREATE POLICY "chat_contexts_update" ON chat_contexts FOR UPDATE USING (true);

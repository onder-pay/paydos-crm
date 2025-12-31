-- ============================================
-- PAYDOS CRM - SUPABASE KURULUM SQL
-- ============================================

-- Mevcut tabloları sil (varsa)
DROP TABLE IF EXISTS hotel_reservations CASCADE;
DROP TABLE IF EXISTS tours CASCADE;
DROP TABLE IF EXISTS visa_applications CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users tablosu
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers tablosu
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tc_kimlik TEXT,
  first_name TEXT,
  last_name TEXT,
  gender TEXT,
  birth_date TEXT,
  birth_place TEXT,
  company_name TEXT,
  sector TEXT,
  position TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  tk_membership TEXT,
  passport_no TEXT,
  passport_start TEXT,
  passport_expiry TEXT,
  nationality TEXT DEFAULT 'Türkiye',
  passport_documents1 JSONB DEFAULT '[]',
  passport_documents2 JSONB DEFAULT '[]',
  green_passport TEXT DEFAULT 'Hayır',
  schengen_country TEXT,
  schengen_visa_start TEXT,
  schengen_visa_end TEXT,
  schengen_documents1 JSONB DEFAULT '[]',
  schengen_documents2 JSONB DEFAULT '[]',
  schengen_documents3 JSONB DEFAULT '[]',
  schengen_documents4 JSONB DEFAULT '[]',
  usa_visa TEXT,
  usa_visa_start TEXT,
  usa_visa_end TEXT,
  usa_documents JSONB DEFAULT '[]',
  notes TEXT,
  tags JSONB DEFAULT '[]',
  activities JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visa Applications tablosu
CREATE TABLE visa_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id TEXT,
  customer_name TEXT,
  customer_tc TEXT,
  customer_birth_date TEXT,
  customer_passport_no TEXT,
  customer_passport_start TEXT,
  customer_passport_expiry TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  customer_gender TEXT,
  visa_type TEXT,
  visa_category TEXT,
  country TEXT,
  schengen_country TEXT,
  purpose_type TEXT,
  usa_visa_type TEXT,
  usa_consulate TEXT,
  uk_visa_type TEXT,
  uk_visa_duration TEXT,
  uk_consulate TEXT,
  russia_visa_type TEXT,
  uae_visa_type TEXT,
  passport_validity_ok TEXT,
  passport_has_pages TEXT,
  passport_condition_ok TEXT,
  passport_check_done BOOLEAN DEFAULT FALSE,
  islem TEXT,
  status TEXT DEFAULT 'Evrak Topluyor',
  application_date TEXT,
  appointment_date TEXT,
  appointment_time TEXT,
  appointment_pnr TEXT,
  visa_result TEXT,
  visa_duration TEXT,
  visa_duration_type TEXT DEFAULT 'gün',
  visa_start_date TEXT,
  visa_end_date TEXT,
  visa_fee TEXT,
  visa_fee_currency TEXT DEFAULT '€',
  payment_status TEXT DEFAULT 'Ödenmedi',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tours tablosu (YENİ - Tam Özellikli)
CREATE TABLE tours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  destination TEXT,
  start_date TEXT,
  end_date TEXT,
  duration INTEGER DEFAULT 1,
  price TEXT,
  currency TEXT DEFAULT '€',
  capacity INTEGER DEFAULT 20,
  status TEXT DEFAULT 'Planlama',
  description TEXT,
  included_services TEXT,
  excluded_services TEXT,
  departure_flight_no TEXT,
  departure_flight_time TEXT,
  departure_airport TEXT,
  arrival_airport TEXT,
  return_flight_no TEXT,
  return_flight_time TEXT,
  return_departure_airport TEXT,
  return_arrival_airport TEXT,
  transfer_notes TEXT,
  guide_name TEXT,
  guide_phone TEXT,
  emergency_contact TEXT,
  notes TEXT,
  daily_program JSONB DEFAULT '[]',
  participants JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hotel Reservations tablosu (YENİ - Tam Özellikli)
CREATE TABLE hotel_reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id TEXT,
  hotel_name TEXT,
  customer_id TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  room_type TEXT,
  board_type TEXT DEFAULT 'BB',
  check_in TEXT,
  check_out TEXT,
  nights INTEGER DEFAULT 1,
  adults INTEGER DEFAULT 2,
  children INTEGER DEFAULT 0,
  child_ages TEXT,
  price_per_night TEXT,
  total_price TEXT,
  currency TEXT DEFAULT '€',
  commission_amount TEXT,
  status TEXT DEFAULT 'Beklemede',
  payment_status TEXT DEFAULT 'Ödenmedi',
  paid_amount NUMERIC DEFAULT 0,
  confirmation_no TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings tablosu
CREATE TABLE settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS devre disi birak
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE visa_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE tours DISABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Admin kullanici ekle
INSERT INTO users (email, password, name, role) VALUES ('admin@paydos.com', '123456', 'Admin', 'admin');

-- Basarili mesaji
SELECT 'Tablolar basariyla olusturuldu!' AS sonuc;

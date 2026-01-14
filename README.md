# Paydos CRM v2.0

Paydos Turizm için geliştirilmiş modern CRM sistemi. Müşteri yönetimi, vize işlemleri, tur organizasyonu ve otel rezervasyonlarını tek platformdan yönetin.

## 🚀 Özellikler

### Müşteri Yönetimi
- Müşteri listesi ve detay görünümü
- Pasaport bilgileri takibi
- Etiket sistemi ile kategorilendirme
- WhatsApp entegrasyonu
- Vize ve tur geçmişi takibi

### Vize İşlemleri
- 6 kategori: Schengen, İngiltere, ABD, Rusya, BAE, Diğer
- Randevu takibi ve hatırlatmalar
- Durum yönetimi
- Evrak kontrolü

### Tur Yönetimi
- Fuar turları organizasyonu
- Katılımcı yönetimi
- Ödeme takibi
- Fiyatlandırma

### Otel Rezervasyonları
- Rezervasyon yönetimi
- Komisyon hesaplama
- Tedarikçi takibi

## 🛠️ Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Supabase hesabı

### Adımlar

1. **Repository'yi klonlayın:**
```bash
git clone https://github.com/onder-pay/paydos-crm.git
cd paydos-crm
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Environment değişkenlerini ayarlayın:**
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyip Supabase bilgilerinizi ekleyin:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

5. **Production build:**
```bash
npm run build
```

## 📁 Proje Yapısı

```
src/
├── components/
│   └── ui/           # Yeniden kullanılabilir UI bileşenleri
├── features/
│   ├── auth/         # Kimlik doğrulama
│   ├── customers/    # Müşteri modülü
│   ├── dashboard/    # Ana sayfa
│   ├── hotels/       # Otel rezervasyonları
│   ├── settings/     # Ayarlar
│   ├── tours/        # Tur yönetimi
│   └── visa/         # Vize işlemleri
├── hooks/            # Custom React hooks
├── services/
│   └── supabase.js   # Supabase servis katmanı
├── utils/
│   ├── constants.js  # Sabit değerler
│   └── helpers.js    # Yardımcı fonksiyonlar
├── App.jsx           # Ana uygulama
└── main.jsx          # Entry point
```

## 🔧 Teknolojiler

- **Frontend:** React 18, Vite
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Styling:** Inline CSS, Custom Design System
- **State:** React Hooks, Context API

## 🚀 Deployment

### Netlify
1. Netlify'da yeni site oluşturun
2. GitHub repository'yi bağlayın
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Environment variables ekleyin

### Vercel
```bash
npm i -g vercel
vercel
```

## 📊 Supabase Schema

```sql
-- Customers tablosu
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  tc_kimlik TEXT,
  passport_no TEXT,
  passport_expiry DATE,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visas tablosu
CREATE TABLE visas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  category TEXT NOT NULL,
  country TEXT,
  visa_type TEXT,
  status TEXT DEFAULT 'Evrak Topluyor',
  appointment_date TIMESTAMPTZ,
  travel_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tours tablosu
CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  destination TEXT,
  fair_name TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'Planlama',
  price_per_person DECIMAL,
  currency TEXT DEFAULT 'EUR',
  participants JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hotels tablosu
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  guest_name TEXT NOT NULL,
  hotel_name TEXT NOT NULL,
  check_in DATE,
  check_out DATE,
  room_type TEXT,
  total_price DECIMAL,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'Beklemede',
  commission_type TEXT DEFAULT 'percent',
  commission_value DECIMAL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 📝 Lisans

Bu proje Paydos Turizm'e aittir. Tüm hakları saklıdır.

## 👤 İletişim

- **Firma:** Paydos Turizm
- **Email:** onder@paydostur.com
- **Web:** paydoscrm.netlify.app

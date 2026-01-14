// ============================================
// PAYDOS CRM - CONSTANTS
// Tüm sabit değerler tek dosyada
// ============================================

// Türkiye İlleri
export const TURKISH_PROVINCES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 
  'Artvin', 'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 
  'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 
  'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 
  'Hakkari', 'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 
  'Kayseri', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 
  'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 
  'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 
  'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 
  'Bayburt', 'Karaman', 'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 
  'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
];

// Schengen Ülkeleri
export const SCHENGEN_COUNTRIES = [
  'Almanya', 'Avusturya', 'Belçika', 'Çekya', 'Danimarka', 'Estonya', 'Finlandiya', 
  'Fransa', 'Hırvatistan', 'Hollanda', 'İspanya', 'İsveç', 'İsviçre', 'İtalya', 
  'İzlanda', 'Letonya', 'Liechtenstein', 'Litvanya', 'Lüksemburg', 'Macaristan', 
  'Malta', 'Norveç', 'Polonya', 'Portekiz', 'Slovakya', 'Slovenya', 'Yunanistan'
];

// Tüm Ülkeler (Genel Liste)
export const COUNTRIES = [
  'Almanya', 'Amerika Birleşik Devletleri', 'Avusturya', 'Belçika', 'Birleşik Arap Emirlikleri',
  'Birleşik Krallık', 'Çekya', 'Çin', 'Danimarka', 'Estonya', 'Finlandiya', 'Fransa',
  'Hırvatistan', 'Hollanda', 'İspanya', 'İsveç', 'İsviçre', 'İtalya', 'İzlanda',
  'Japonya', 'Kanada', 'Katar', 'Kazakistan', 'Letonya', 'Liechtenstein', 'Litvanya',
  'Lüksemburg', 'Macaristan', 'Malta', 'Norveç', 'Özbekistan', 'Polonya', 'Portekiz',
  'Rusya', 'Slovakya', 'Slovenya', 'Suudi Arabistan', 'Türkiye', 'Ukrayna', 'Yunanistan'
];

// Vize Durumları
export const VISA_STATUSES = [
  'Evrak Topluyor', 
  'Evrak Tamamlandı', 
  'Evraklar Gönderildi', 
  'E-posta Gönderildi', 
  'Randevu Bekliyor', 
  'Başvuru Yapıldı', 
  'Sonuç Bekliyor', 
  'Müşteri İptal Etti'
];

// Tur Durumları
export const TOUR_STATUSES = ['Planlama', 'Açık', 'Dolu', 'Devam Ediyor', 'Tamamlandı', 'İptal'];

// Otel Durumları
export const HOTEL_STATUSES = ['Beklemede', 'Onaylandı', 'İptal', 'Tamamlandı'];

// Oda Tipleri
export const ROOM_TYPES = ['Standard', 'Superior', 'Deluxe', 'Suite', 'Family', 'King', 'Twin'];

// Pansiyon Tipleri
export const BOARD_TYPES = [
  { id: 'RO', label: 'Sadece Oda' },
  { id: 'BB', label: 'Oda + Kahvaltı' },
  { id: 'HB', label: 'Yarım Pansiyon' },
  { id: 'FB', label: 'Tam Pansiyon' },
  { id: 'AI', label: 'Her Şey Dahil' },
  { id: 'UAI', label: 'Ultra Her Şey Dahil' }
];

// Vize Kategorileri
export const VISA_CATEGORIES = [
  { id: 'schengen', label: 'Schengen Vize Başvuru', icon: '🇪🇺', color: '#3b82f6', desc: 'Avrupa ülkeleri' },
  { id: 'usa', label: 'Amerika Vizesi Başvuru', icon: '🇺🇸', color: '#ef4444', desc: 'ABD B1/B2 vize' },
  { id: 'uk', label: 'İngiltere Vize Başvuru', icon: '🇬🇧', color: '#8b5cf6', desc: 'UK visitor visa' },
  { id: 'russia', label: 'Rusya Vizesi Başvuru', icon: '🇷🇺', color: '#f59e0b', desc: 'Rusya turist/iş' },
  { id: 'uae', label: 'BAE Vize Başvuru', icon: '🇦🇪', color: '#10b981', desc: 'Dubai/Abu Dhabi' },
  { id: 'china', label: 'Çin Vizesi Başvuru', icon: '🇨🇳', color: '#dc2626', desc: 'Çin turist/iş' },
];

// Seyahat Amaçları
export const PURPOSE_TYPES = [
  { id: 'tourist', label: 'Turistik', icon: '🏖️' },
  { id: 'business', label: 'Ticari / İş', icon: '💼' },
  { id: 'family', label: 'Aile / Eş / Dost Ziyareti', icon: '👨‍👩‍👧‍👦' },
];

// Sektörler
export const SECTORS = [
  'Tekstil', 'İnşaat', 'Gıda', 'Otomotiv', 'Turizm', 'Sağlık', 'Eğitim', 
  'Finans / Bankacılık', 'Teknoloji / Yazılım', 'Enerji', 'Lojistik / Taşımacılık', 
  'Tarım', 'Madencilik', 'Kimya / İlaç', 'Mobilya / Ahşap', 'Makine / Metal', 
  'Perakende / Ticaret', 'Medya / Reklam', 'Hukuk / Danışmanlık', 'Gayrimenkul', 'Diğer'
];

// Para Birimleri
export const CURRENCIES = [
  { symbol: '€', code: 'EUR', label: 'Euro' },
  { symbol: '$', code: 'USD', label: 'Dolar' },
  { symbol: '£', code: 'GBP', label: 'Sterlin' },
  { symbol: '₺', code: 'TRY', label: 'Türk Lirası' }
];

// Ay İsimleri
export const MONTHS = [
  { value: '01', label: 'Ocak' },
  { value: '02', label: 'Şubat' },
  { value: '03', label: 'Mart' },
  { value: '04', label: 'Nisan' },
  { value: '05', label: 'Mayıs' },
  { value: '06', label: 'Haziran' },
  { value: '07', label: 'Temmuz' },
  { value: '08', label: 'Ağustos' },
  { value: '09', label: 'Eylül' },
  { value: '10', label: 'Ekim' },
  { value: '11', label: 'Kasım' },
  { value: '12', label: 'Aralık' }
];

export const MONTH_NAMES_SHORT = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

// Varsayılan İşlem Firmaları
export const DEFAULT_FIRMS = ['Paydos', 'RBN', 'Oğuz', 'İ Data', 'İ Data Mobil', 'Oğuzhan İst.'];

// Varsayılan Müşteri Etiketleri
export const DEFAULT_TAGS = [
  { name: 'VIP', color: '#f59e0b' },
  { name: 'Kurumsal', color: '#3b82f6' },
  { name: 'Bireysel', color: '#10b981' },
  { name: 'Fuar', color: '#8b5cf6' },
  { name: 'Potansiyel', color: '#06b6d4' },
  { name: 'Sorunlu', color: '#ef4444' }
];

// Varsayılan WhatsApp Mesajı
export const DEFAULT_WHATSAPP_MESSAGE = `Sayın {isim} {hitap},

{ulke} {vizeTuru} vize başvurunuzla ilgili bilgilendirmek isteriz.

{randevuBilgisi}

📋 Başvurunuz için gerekli evrak listesi daha önce e-posta adresinize gönderilmiştir. Eğer tekrar göndermemizi isterseniz e-posta adresinize gönderebiliriz.

{evrakTeslimTarihi}

📧 Islak imzalı olmayan evrakları vize@paydostur.com adresimize gönderebilirsiniz.

💬 Sorularınız için bize her zaman ulaşabilirsiniz.

İyi günler dileriz,
Paydos Turizm`;

// Renk Paleti
export const COLORS = {
  primary: '#f59e0b',
  secondary: '#3b82f6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#06b6d4',
  purple: '#8b5cf6',
  gray: '#64748b',
  dark: '#0c1929',
  light: '#e8f1f8'
};

// Status Renkleri
export const STATUS_COLORS = {
  visa: {
    'Evrak Toplama': '#94a3b8',
    'Randevu Bekleniyor': '#f59e0b',
    'Randevu Alındı': '#3b82f6',
    'Başvuru Yapıldı': '#8b5cf6',
    'Değerlendirmede': '#06b6d4',
    'Onaylandı': '#10b981',
    'Reddedildi': '#ef4444'
  },
  tour: {
    'Planlama': '#94a3b8',
    'Satışta': '#3b82f6',
    'Dolu': '#f59e0b',
    'Devam Ediyor': '#8b5cf6',
    'Tamamlandı': '#10b981',
    'İptal': '#ef4444'
  },
  hotel: {
    'Beklemede': '#f59e0b',
    'Onaylı': '#10b981',
    'İptal': '#ef4444',
    'Tamamlandı': '#3b82f6'
  },
  payment: {
    'Ödenmedi': '#ef4444',
    'Kısmi': '#f59e0b',
    'Ödendi': '#10b981'
  }
};

// UK Vize Türleri
export const UK_VISA_TYPES = [
  'Turist', 'Aile/Arkadaş Ziyareti', 'Ticari', 'Şoför', 'Öğrenci', 
  'Tıbbi Tedavi', 'Tier 4 Öğrenci', 'Çalışma', 'Ekspres', 'Aile Birleşimi', 'Transit'
];

// UK Vize Süreleri
export const UK_VISA_DURATIONS = ['6 Ay', '2 Yıl', '5 Yıl', '10 Yıl'];

// Rusya Vize Türleri
export const RUSSIA_VISA_TYPES = [
  { id: '30gun-evize-1', label: '30 Günlük E-Vize', sub: '1 Girişli' },
  { id: '1ay-turistik-1', label: '1 Aylık Turistik', sub: '1 Girişli' },
  { id: '1ay-turistik-ekspres-1', label: '1 Aylık Turistik Ekspres', sub: '1 Girişli' },
  { id: '1ay-turistik-2', label: '1 Aylık Turistik', sub: '2 Girişli' },
  { id: '1ay-turistik-ekspres-2', label: '1 Aylık Turistik Ekspres', sub: '2 Girişli' },
  { id: '3ay-turistik-1', label: '3 Aylık Turistik', sub: '1 Girişli' },
  { id: '3ay-turistik-ekspres-1', label: '3 Aylık Turistik Ekspres', sub: '1 Girişli' },
  { id: '3ay-turistik-2', label: '3 Aylık Turistik', sub: '2 Girişli' },
  { id: '3ay-turistik-ekspres-2', label: '3 Aylık Turistik Ekspres', sub: '2 Girişli' },
  { id: '6ay-turistik-cok', label: '6 Aylık Turistik', sub: 'Çok Girişli' },
];

// BAE Vize Türleri
export const UAE_VISA_TYPES = [
  { id: '14gun-tek', label: '14 Günlük BAE Vizesi', sub: 'Tek Girişli' },
  { id: '30gun-tek', label: '30 Günlük BAE Vizesi', sub: 'Tek Girişli' },
  { id: '30gun-cok', label: '30 Günlük BAE Vizesi', sub: 'Çok Girişli' },
  { id: '90gun-tek', label: '90 Günlük BAE Vizesi', sub: 'Tek Girişli' },
  { id: '90gun-cok', label: '90 Günlük BAE Vizesi', sub: 'Çok Girişli' },
  { id: '48saat-transit', label: '48 Saatlik Transit Vize', sub: 'Transit' },
  { id: '96saat-transit', label: '96 Saatlik Transit Vize', sub: 'Transit' },
  { id: 'cruise', label: 'BAE Cruise Vizesi', sub: 'Cruise' },
];

// Navigation Modülleri
export const NAV_MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', color: '#06b6d4' },
  { id: 'customers', label: 'Müşteri Data', icon: '👥', color: '#f59e0b' },
  { id: 'visa', label: 'Vize Takip', icon: '🛂', color: '#3b82f6' },
  { id: 'tours', label: 'Tur Yönetimi', icon: '🌍', color: '#10b981' },
  { id: 'hotels', label: 'Otel Rezervasyon', icon: '🏨', color: '#8b5cf6' },
  { id: 'settings', label: 'Ayarlar', icon: '⚙️', color: '#64748b' }
];

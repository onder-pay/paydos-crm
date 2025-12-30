import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { supabase, toCamelCase, toSnakeCase } from './lib/supabase';

// localStorage helper fonksiyonları (yedek olarak)
const storage = {
  get: (key, defaultVal) => {
    try {
      const item = localStorage.getItem(`paydos_${key}`);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(`paydos_${key}`, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
};

const defaultCustomers = [
  { id: 1, tcKimlik: '12345678901', firstName: 'Ahmet', lastName: 'Yılmaz', gender: 'Erkek', birthDate: '1985-03-15', birthPlace: 'Manisa', companyName: 'Yılmaz Tekstil', sector: 'Tekstil', position: 'Müdür', city: 'İzmir', phone: '+905321234567', email: 'ahmet@email.com', address: 'Alsancak No:45', tkMembership: 'TK123456789', passportNo: 'U12345678', passportStart: '2020-03-15', passportExpiry: '2026-03-15', nationality: 'Türkiye', passportDocuments1: [], passportDocuments2: [], greenPassport: 'Hayır', schengenCountry: 'Almanya', schengenVisaStart: '2025-06-20', schengenVisaEnd: '2026-01-10', schengenDocuments1: [], schengenDocuments2: [], schengenDocuments3: [], schengenDocuments4: [], usaVisa: 'Var', usaVisaStart: '2023-05-01', usaVisaEnd: '2033-05-01', usaDocuments: [], notes: 'VIP', createdAt: '2024-01-15', activities: [{ id: 1, type: 'customer_created', description: 'Müşteri kaydı oluşturuldu', date: '2024-01-15T10:00:00', user: 'Admin' }, { id: 2, type: 'visa_created', description: 'Almanya Schengen vize başvurusu oluşturuldu', date: '2025-12-01T14:30:00', user: 'Admin' }], tags: ['VIP', 'Kurumsal'] },
  { id: 2, tcKimlik: '98765432109', firstName: 'Elif', lastName: 'Demir', gender: 'Kadın', birthDate: '1990-07-22', birthPlace: 'Ankara', companyName: '', sector: '', position: '', city: 'İstanbul', phone: '+905449876543', email: 'elif@email.com', address: '', tkMembership: '', passportNo: 'U87654321', passportStart: '2021-12-01', passportExpiry: '2026-12-01', nationality: 'Türkiye', passportDocuments1: [], passportDocuments2: [], greenPassport: 'Hayır', schengenCountry: '', schengenVisaStart: '', schengenVisaEnd: '', schengenDocuments1: [], schengenDocuments2: [], schengenDocuments3: [], schengenDocuments4: [], usaVisa: 'Var', usaVisaStart: '2024-01-01', usaVisaEnd: '2034-01-01', usaDocuments: [], notes: '', createdAt: '2024-02-20', activities: [{ id: 1, type: 'customer_created', description: 'Müşteri kaydı oluşturuldu', date: '2024-02-20T09:15:00', user: 'Admin' }], tags: ['Bireysel'] }
];
const defaultVisaApplications = [{ id: 1, customerId: 1, customerName: 'Ahmet Yılmaz', visaType: 'Schengen', visaCategory: 'schengen', country: 'Almanya', purposeType: 'tourist', usaVisaType: '', usaConsulate: '', ukVisaType: '', ukVisaDuration: '', ukConsulate: '', russiaVisaType: '', uaeVisaType: '', passportValidityOk: 'Evet', passportHasPages: 'Evet', passportConditionOk: 'Evet', passportCheckDone: true, islem: 'Paydos', status: 'Randevu Bekliyor', applicationDate: '2025-12-01', appointmentDate: '2025-12-18', appointmentTime: '10:30', appointmentPnr: 'ABC123', visaResult: '', visaDuration: '', visaDurationType: 'gün', visaStartDate: '', visaEndDate: '', visaFee: '80', visaFeeCurrency: '€', paymentStatus: 'Ödenmedi', notes: '' }];
const defaultTours = [{ id: 1, name: 'Kapadokya Turu', destination: 'Nevşehir', startDate: '2025-01-15', endDate: '2025-01-18', duration: 4, price: 8500, capacity: 40, registered: 28, status: 'Açık', description: '3 gece 4 gün', notes: '' }];
const defaultHotelReservations = [{ id: 1, customerId: 1, customerName: 'Ahmet Yılmaz', hotelName: 'Hilton İzmir', city: 'İzmir', checkIn: '2025-01-10', checkOut: '2025-01-12', nights: 2, roomType: 'Deluxe', adults: 2, children: 0, totalPrice: 4500, commission: 450, status: 'Onaylandı', confirmationNo: 'HIZ-001', notes: '' }];
const defaultUsers = [
  { id: 1, email: 'admin@paydos.com', password: '123456', name: 'Admin', role: 'admin' },
  { id: 2, email: 'user@paydos.com', password: '123456', name: 'Kullanıcı', role: 'user' }
];

const turkishProvinces = ['Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'];
const schengenCountries = ['Almanya', 'Avusturya', 'Belçika', 'Çekya', 'Danimarka', 'Estonya', 'Finlandiya', 'Fransa', 'Hırvatistan', 'Hollanda', 'İspanya', 'İsveç', 'İsviçre', 'İtalya', 'İzlanda', 'Letonya', 'Liechtenstein', 'Litvanya', 'Lüksemburg', 'Macaristan', 'Malta', 'Norveç', 'Polonya', 'Portekiz', 'Slovakya', 'Slovenya', 'Yunanistan'];
const visaStatuses = ['Evrak Topluyor', 'Evrak Tamamlandı', 'Evraklar Gönderildi', 'E-posta Gönderildi', 'Randevu Bekliyor', 'Başvuru Yapıldı', 'Sonuç Bekliyor', 'Müşteri İptal Etti'];
const tourStatuses = ['Planlama', 'Açık', 'Dolu', 'Devam Ediyor', 'Tamamlandı', 'İptal'];
const hotelStatuses = ['Beklemede', 'Onaylandı', 'İptal', 'Tamamlandı'];
const roomTypes = ['Standard', 'Superior', 'Deluxe', 'Suite', 'Family', 'King', 'Twin'];

const labelStyle = { display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '500' };
const inputStyle = { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#e8f1f8', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
const selectStyle = { width: '100%', padding: '10px 12px', background: '#0f2744', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#e8f1f8', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
const dateSelectStyle = { padding: '10px 6px', background: '#0f2744', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#e8f1f8', fontSize: '13px', outline: 'none' };

const isValidEmail = (e) => !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const formatDate = (d) => {
  if (!d) return '-';
  if (typeof d !== 'string') d = String(d);
  if (d.includes('-')) return d.split('-').reverse().join('.');
  if (d.includes('.')) return d;
  return d;
};

// Safe date parsing - timezone-safe
const safeParseDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const [year, month, day] = parts.map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  // Create date at noon to avoid timezone issues
  const date = new Date(year, month - 1, day, 12, 0, 0);
  // Validate the date is real (e.g., Feb 30 would become Mar 2)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
};

// Safe number parsing for fees (handles "80 €", "80,00", empty, etc.)
const safeParseNumber = (val) => {
  if (!val) return 0;
  const cleaned = String(val).replace(/[€$£₺\s]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

// Get days left from date string (returns null if invalid)
const getDaysLeft = (dateStr) => {
  const date = safeParseDate(dateStr);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.ceil((date - today) / (1000 * 60 * 60 * 24));
};

// Generate unique ID
const generateUniqueId = () => Date.now() + Math.random();

function DateInput({ label, value, onChange }) {
  // Parse date string to object
  const parseDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return { day: '', month: '', year: '' };
    const parts = dateStr.split('-');
    if (parts.length !== 3) return { day: '', month: '', year: '' };
    return { 
      year: parts[0] || '', 
      month: parts[1] || '', 
      day: parts[2] || '' 
    };
  };

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // Sync with external value
  useEffect(() => {
    const parsed = parseDate(value);
    setDay(parsed.day);
    setMonth(parsed.month);
    setYear(parsed.year);
  }, [value]);

  // Get valid days for selected month/year
  const getDaysInMonth = (m, y) => {
    if (!m) return 31;
    const monthNum = parseInt(m);
    const yearNum = parseInt(y) || new Date().getFullYear();
    // 30 günlük aylar: 4, 6, 9, 11
    if ([4, 6, 9, 11].includes(monthNum)) return 30;
    // Şubat - artık yıl kontrolü
    if (monthNum === 2) {
      const isLeap = (yearNum % 4 === 0 && yearNum % 100 !== 0) || (yearNum % 400 === 0);
      return isLeap ? 29 : 28;
    }
    return 31;
  };

  const maxDays = getDaysInMonth(month, year);
  const days = Array.from({ length: maxDays }, (_, i) => String(i + 1).padStart(2, '0'));

  // Validate and build date
  const buildDate = (d, m, y) => {
    if (!d || !m || !y) return;
    const maxD = getDaysInMonth(m, y);
    const validDay = Math.min(parseInt(d), maxD);
    const dateStr = `${y}-${m}-${String(validDay).padStart(2, '0')}`;
    // Validate date
    const testDate = new Date(y, parseInt(m) - 1, validDay);
    if (isNaN(testDate.getTime())) return;
    onChange(dateStr);
  };

  // Handle changes
  const handleDayChange = (newDay) => {
    setDay(newDay);
    buildDate(newDay, month, year);
  };

  const handleMonthChange = (newMonth) => {
    setMonth(newMonth);
    // Gün değeri yeni ay için geçersizse düzelt
    const maxD = getDaysInMonth(newMonth, year);
    const validDay = day && parseInt(day) > maxD ? String(maxD).padStart(2, '0') : day;
    if (validDay !== day) setDay(validDay);
    buildDate(validDay, newMonth, year);
  };

  const handleYearChange = (newYear) => {
    setYear(newYear);
    // Şubat 29 için artık yıl kontrolü
    const maxD = getDaysInMonth(month, newYear);
    const validDay = day && parseInt(day) > maxD ? String(maxD).padStart(2, '0') : day;
    if (validDay !== day) setDay(validDay);
    buildDate(validDay, month, newYear);
  };

  const months = [
    {v:'01',l:'Ocak'}, {v:'02',l:'Şubat'}, {v:'03',l:'Mart'}, {v:'04',l:'Nisan'},
    {v:'05',l:'Mayıs'}, {v:'06',l:'Haziran'}, {v:'07',l:'Temmuz'}, {v:'08',l:'Ağustos'},
    {v:'09',l:'Eylül'}, {v:'10',l:'Ekim'}, {v:'11',l:'Kasım'}, {v:'12',l:'Aralık'}
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 120 }, (_, i) => String(currentYear - 100 + i));

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: '4px' }}>
        <select 
          value={day} 
          onChange={e => handleDayChange(e.target.value)} 
          style={{ ...dateSelectStyle, width: '70px' }}
        >
          <option value="">Gün</option>
          {days.map(d => <option key={d} value={d}>{parseInt(d)}</option>)}
        </select>
        <select 
          value={month} 
          onChange={e => handleMonthChange(e.target.value)} 
          style={{ ...dateSelectStyle, flex: 1 }}
        >
          <option value="">Ay</option>
          {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
        </select>
        <select 
          value={year} 
          onChange={e => handleYearChange(e.target.value)} 
          style={{ ...dateSelectStyle, width: '80px' }}
        >
          <option value="">Yıl</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
}

function FileUpload({ label, files = [], onChange }) {
  const ref = useRef(null);
  const add = (e) => { 
    const nf = Array.from(e.target.files).map(f => ({ name: f.name, data: URL.createObjectURL(f) })); 
    onChange([...files, ...nf]); 
  };
  const remove = (index) => {
    const file = files[index];
    // Memory leak önleme
    if (file?.data?.startsWith('blob:')) {
      URL.revokeObjectURL(file.data);
    }
    onChange(files.filter((_, x) => x !== index));
  };
  return (<div><label style={labelStyle}>{label}</label><div style={{ border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}><input ref={ref} type="file" accept="image/*,.pdf" multiple onChange={add} style={{ display: 'none' }} /><button type="button" onClick={() => ref.current?.click()} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', padding: '6px 12px', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}>📁 Dosya Seç</button>{files.length > 0 && <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>{files.map((f, i) => <div key={i} style={{ background: 'rgba(16,185,129,0.15)', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ color: '#10b981', maxWidth: '50px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span><button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0', fontSize: '12px' }}>×</button></div>)}</div>}</div></div>);
}

function FormInput({ label, ...p }) { return (<div><label style={labelStyle}>{label}</label><input {...p} style={inputStyle} /></div>); }
function StatCard({ value, label, color, onClick }) { return (<div onClick={onClick} style={{ background: `${color}15`, border: `1px solid ${color}30`, borderRadius: '10px', padding: '14px', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s ease' }} onMouseEnter={(e) => onClick && (e.currentTarget.style.transform = 'scale(1.02)', e.currentTarget.style.boxShadow = `0 4px 12px ${color}30`)} onMouseLeave={(e) => onClick && (e.currentTarget.style.transform = 'scale(1)', e.currentTarget.style.boxShadow = 'none')}><div style={{ fontSize: '22px', fontWeight: '700', color }}>{value}</div><div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{label}{onClick && <span style={{ marginLeft: '4px', fontSize: '9px' }}>📥</span>}</div></div>); }
function Modal({ children, onClose, title }) { return (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '20px' }}><div style={{ background: 'linear-gradient(180deg, #0f2744 0%, #0c1929 100%)', borderRadius: '12px', width: '100%', maxWidth: '400px', maxHeight: '85vh', overflow: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}><div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3 style={{ margin: 0, fontSize: '15px', flex: 1 }}>{title}</h3><button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', color: '#94a3b8', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button></div><div style={{ padding: '14px 16px' }}>{children}</div></div></div>); }
function InfoBox({ label, value, highlight }) { return (<div style={{ background: highlight ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)', borderRadius: '6px', padding: '8px', border: highlight ? '1px solid rgba(245,158,11,0.2)' : 'none' }}><p style={{ fontSize: '10px', color: highlight ? '#f59e0b' : '#64748b', marginBottom: '2px', textTransform: 'uppercase' }}>{label}</p><p style={{ fontSize: '12px', margin: 0, color: value ? (highlight ? '#f59e0b' : '#e8f1f8') : '#64748b' }}>{value || '-'}</p></div>); }
function InfoRow({ label, value }) { return (<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}><span style={{ color: '#94a3b8' }}>{label}:</span><span style={{ color: '#e8f1f8', fontWeight: '500' }}>{value || '-'}</span></div>); }

function DashboardModule({ customers, visaApplications, tours, hotelReservations, isMobile, setActiveModule }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  // Vize İstatistikleri
  const totalVisa = visaApplications.length;
  const approvedVisa = visaApplications.filter(v => v.visaResult === 'Onay').length;
  const rejectedVisa = visaApplications.filter(v => v.visaResult === 'Red').length;
  const pendingVisa = totalVisa - approvedVisa - rejectedVisa;
  const approvalRate = totalVisa > 0 ? Math.round((approvedVisa / totalVisa) * 100) : 0;
  
  // Bu Ay
  const thisMonthVisa = visaApplications.filter(v => {
    if (!v.applicationDate) return false;
    const d = safeParseDate(v.applicationDate);
    if (!d) return false;
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });
  
  // Ciro Hesaplama - para birimine göre ayrı
  const revenueByEUR = visaApplications.reduce((sum, v) => {
    if (v.visaFee && v.paymentStatus === 'Ödendi' && v.visaFeeCurrency === '€') {
      return sum + safeParseNumber(v.visaFee);
    }
    return sum;
  }, 0);
  const revenueByTRY = visaApplications.reduce((sum, v) => {
    if (v.visaFee && v.paymentStatus === 'Ödendi' && v.visaFeeCurrency === '₺') {
      return sum + safeParseNumber(v.visaFee);
    }
    return sum;
  }, 0);
  const pendingByEUR = visaApplications.reduce((sum, v) => {
    if (v.visaFee && v.paymentStatus !== 'Ödendi' && v.visaFeeCurrency === '€') {
      return sum + safeParseNumber(v.visaFee);
    }
    return sum;
  }, 0);
  const pendingByTRY = visaApplications.reduce((sum, v) => {
    if (v.visaFee && v.paymentStatus !== 'Ödendi' && v.visaFeeCurrency === '₺') {
      return sum + safeParseNumber(v.visaFee);
    }
    return sum;
  }, 0);
  
  // Yaklaşan Randevular
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingAppointments = visaApplications.filter(v => {
    if (!v.appointmentDate || v.visaResult === 'Onay' || v.visaResult === 'Red') return false;
    const appDate = safeParseDate(v.appointmentDate);
    if (!appDate) return false;
    const diff = Math.ceil((appDate - today) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 10;
  });
  
  // Hatırlatmalar
  const reminders = [];
  
  // Pasaport bitiş hatırlatmaları (6 ay içinde)
  const sixMonthsLater = new Date();
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
  customers.forEach(c => {
    if (c.passportExpiry) {
      const expiry = safeParseDate(c.passportExpiry);
      if (expiry && expiry <= sixMonthsLater && expiry >= today) {
        const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        reminders.push({
          type: 'passport',
          priority: daysLeft <= 30 ? 'high' : daysLeft <= 90 ? 'medium' : 'low',
          customer: `${c.firstName} ${c.lastName}`,
          customerId: c.id,
          message: `Pasaport ${daysLeft} gün sonra bitiyor`,
          date: c.passportExpiry,
          daysLeft
        });
      }
    }
  });
  
  // Schengen vize bitiş hatırlatmaları (1 ay içinde)
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
  customers.forEach(c => {
    if (c.schengenVisaEnd && c.schengenCountry) {
      const expiry = safeParseDate(c.schengenVisaEnd);
      if (expiry && expiry <= oneMonthLater && expiry >= today) {
        const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        reminders.push({
          type: 'schengen',
          priority: daysLeft <= 7 ? 'high' : daysLeft <= 14 ? 'medium' : 'low',
          customer: `${c.firstName} ${c.lastName}`,
          customerId: c.id,
          message: `${c.schengenCountry} Schengen vizesi ${daysLeft} gün sonra bitiyor`,
          date: c.schengenVisaEnd,
          daysLeft
        });
      }
    }
  });
  
  // ABD vize bitiş hatırlatmaları (3 ay içinde)
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  customers.forEach(c => {
    if (c.usaVisaEnd && c.usaVisa === 'Var') {
      const expiry = safeParseDate(c.usaVisaEnd);
      if (expiry && expiry <= threeMonthsLater && expiry >= today) {
        const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        reminders.push({
          type: 'usa',
          priority: daysLeft <= 30 ? 'high' : daysLeft <= 60 ? 'medium' : 'low',
          customer: `${c.firstName} ${c.lastName}`,
          customerId: c.id,
          message: `ABD vizesi ${daysLeft} gün sonra bitiyor`,
          date: c.usaVisaEnd,
          daysLeft
        });
      }
    }
  });
  
  // Sırala: önce yüksek öncelikli, sonra düşük gün sayısı
  reminders.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.daysLeft - b.daysLeft;
  });
  
  // Aylık Trend
  const monthlyTrend = [];
  const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const monthApps = visaApplications.filter(v => {
      if (!v.applicationDate) return false;
      const vd = safeParseDate(v.applicationDate);
      if (!vd) return false;
      return vd.getFullYear() === d.getFullYear() && vd.getMonth() === d.getMonth();
    });
    monthlyTrend.push({
      month: monthNames[d.getMonth()],
      total: monthApps.length,
      approved: monthApps.filter(v => v.visaResult === 'Onay').length,
      rejected: monthApps.filter(v => v.visaResult === 'Red').length
    });
  }
  const maxMonthly = Math.max(...monthlyTrend.map(m => m.total), 1);

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#e8f1f8' }}>📊 Dashboard</h2>
      
      {/* Ana Özet Kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <div onClick={() => setActiveModule('customers')} style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'transform 0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px' }}>👥</span>
            <span style={{ fontSize: '10px', color: '#f59e0b', background: 'rgba(245,158,11,0.2)', padding: '2px 8px', borderRadius: '10px' }}>Müşteri</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{customers.length}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Toplam Müşteri</div>
        </div>
        
        <div onClick={() => setActiveModule('visa')} style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'transform 0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px' }}>🛂</span>
            <span style={{ fontSize: '10px', color: '#3b82f6', background: 'rgba(59,130,246,0.2)', padding: '2px 8px', borderRadius: '10px' }}>Vize</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>{totalVisa}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Toplam Başvuru</div>
        </div>
        
        <div onClick={() => setActiveModule('tours')} style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'transform 0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px' }}>🌍</span>
            <span style={{ fontSize: '10px', color: '#10b981', background: 'rgba(16,185,129,0.2)', padding: '2px 8px', borderRadius: '10px' }}>Tur</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{tours.length}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Toplam Tur</div>
        </div>
        
        <div onClick={() => setActiveModule('hotels')} style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'transform 0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px' }}>🏨</span>
            <span style={{ fontSize: '10px', color: '#8b5cf6', background: 'rgba(139,92,246,0.2)', padding: '2px 8px', borderRadius: '10px' }}>Otel</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#8b5cf6' }}>{hotelReservations.length}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Toplam Rezervasyon</div>
        </div>
      </div>
      
      {/* Vize Detay ve Ciro */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Vize Durumu */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94a3b8' }}>🛂 Vize Başvuru Durumu</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>{totalVisa}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Toplam</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{approvedVisa}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Onaylanan</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>{rejectedVisa}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Reddedilen</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>%{approvalRate}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Onay Oranı</div>
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <div style={{ flex: approvedVisa || 1, height: '8px', background: '#10b981', borderRadius: '4px 0 0 4px' }} title={`${approvedVisa} Onay`} />
            <div style={{ flex: rejectedVisa || 0.1, height: '8px', background: '#ef4444' }} title={`${rejectedVisa} Red`} />
            <div style={{ flex: pendingVisa || 0.1, height: '8px', background: '#64748b', borderRadius: '0 4px 4px 0' }} title={`${pendingVisa} Beklemede`} />
          </div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '10px', color: '#10b981' }}>● Onay</span>
            <span style={{ fontSize: '10px', color: '#ef4444' }}>● Red</span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>● Beklemede</span>
          </div>
        </div>
        
        {/* Ciro */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94a3b8' }}>💰 Ciro Özeti</h3>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Tahsil Edilen</div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {revenueByEUR > 0 && <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>€{revenueByEUR.toLocaleString()}</div>}
              {revenueByTRY > 0 && <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>₺{revenueByTRY.toLocaleString()}</div>}
              {revenueByEUR === 0 && revenueByTRY === 0 && <div style={{ fontSize: '20px', fontWeight: '700', color: '#64748b' }}>-</div>}
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Bekleyen Ödeme</div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {pendingByEUR > 0 && <div style={{ fontSize: '18px', fontWeight: '600', color: '#ef4444' }}>€{pendingByEUR.toLocaleString()}</div>}
              {pendingByTRY > 0 && <div style={{ fontSize: '18px', fontWeight: '600', color: '#ef4444' }}>₺{pendingByTRY.toLocaleString()}</div>}
              {pendingByEUR === 0 && pendingByTRY === 0 && <div style={{ fontSize: '18px', fontWeight: '600', color: '#64748b' }}>-</div>}
            </div>
          </div>
          <div style={{ background: 'rgba(245,158,11,0.1)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Bu Ay Başvuru</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>{thisMonthVisa.length}</div>
          </div>
        </div>
      </div>
      
      {/* Yaklaşan Randevular ve Aylık Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
        {/* Yaklaşan Randevular */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#94a3b8' }}>⚠️ Yaklaşan Randevular (10 gün)</h3>
          {upcomingAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '13px' }}>Yaklaşan randevu yok ✓</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {upcomingAppointments.map(v => {
                const appDate = safeParseDate(v.appointmentDate);
                const diff = appDate ? Math.ceil((appDate - today) / (1000 * 60 * 60 * 24)) : 0;
                return (
                  <div key={v.id} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#e8f1f8' }}>{v.customerName}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{v.country} • {v.appointmentDate}</div>
                    </div>
                    <div style={{ background: diff === 0 ? '#ef4444' : diff <= 3 ? '#f59e0b' : '#3b82f6', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', color: 'white' }}>
                      {diff === 0 ? 'BUGÜN' : diff === 1 ? 'YARIN' : `${diff} gün`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Aylık Trend */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#94a3b8' }}>📈 Son 6 Ay Trendi</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', marginBottom: '8px' }}>
            {monthlyTrend.map((m, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '80px' }}>
                  <div style={{ width: '100%', height: `${(m.total / maxMonthly) * 80}px`, background: 'linear-gradient(180deg, #3b82f6, #1d4ed8)', borderRadius: '4px 4px 0 0', minHeight: m.total > 0 ? '4px' : '0' }} />
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>{m.month}</div>
                <div style={{ fontSize: '12px', color: '#e8f1f8', fontWeight: '600' }}>{m.total}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Otomatik Hatırlatmalar */}
      {reminders.length > 0 && (
        <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🔔</span> Otomatik Hatırlatmalar
              <span style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>{reminders.length}</span>
            </h3>
            <div style={{ display: 'flex', gap: '8px', fontSize: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> Acil</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} /> Orta</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> Düşük</span>
            </div>
          </div>
          
          {/* Kategorilere göre grupla */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px' }}>
            {/* Pasaport Hatırlatmaları */}
            {reminders.filter(r => r.type === 'passport').length > 0 && (
              <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px' }}>📕</span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444' }}>Pasaport ({reminders.filter(r => r.type === 'passport').length})</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                  {reminders.filter(r => r.type === 'passport').slice(0, 5).map((r, i) => (
                    <div key={i} onClick={() => setActiveModule('customers')} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '8px', cursor: 'pointer', borderLeft: `3px solid ${r.priority === 'high' ? '#ef4444' : r.priority === 'medium' ? '#f59e0b' : '#10b981'}` }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#e8f1f8' }}>{r.customer}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{r.message}</div>
                    </div>
                  ))}
                  {reminders.filter(r => r.type === 'passport').length > 5 && (
                    <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', padding: '4px' }}>+{reminders.filter(r => r.type === 'passport').length - 5} daha</div>
                  )}
                </div>
              </div>
            )}
            
            {/* Schengen Hatırlatmaları */}
            {reminders.filter(r => r.type === 'schengen').length > 0 && (
              <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px' }}>🇪🇺</span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#3b82f6' }}>Schengen Vize ({reminders.filter(r => r.type === 'schengen').length})</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                  {reminders.filter(r => r.type === 'schengen').slice(0, 5).map((r, i) => (
                    <div key={i} onClick={() => setActiveModule('customers')} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '8px', cursor: 'pointer', borderLeft: `3px solid ${r.priority === 'high' ? '#ef4444' : r.priority === 'medium' ? '#f59e0b' : '#10b981'}` }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#e8f1f8' }}>{r.customer}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{r.message}</div>
                    </div>
                  ))}
                  {reminders.filter(r => r.type === 'schengen').length > 5 && (
                    <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', padding: '4px' }}>+{reminders.filter(r => r.type === 'schengen').length - 5} daha</div>
                  )}
                </div>
              </div>
            )}
            
            {/* ABD Vize Hatırlatmaları */}
            {reminders.filter(r => r.type === 'usa').length > 0 && (
              <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px' }}>🇺🇸</span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444' }}>ABD Vize ({reminders.filter(r => r.type === 'usa').length})</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                  {reminders.filter(r => r.type === 'usa').slice(0, 5).map((r, i) => (
                    <div key={i} onClick={() => setActiveModule('customers')} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '8px', cursor: 'pointer', borderLeft: `3px solid ${r.priority === 'high' ? '#ef4444' : r.priority === 'medium' ? '#f59e0b' : '#10b981'}` }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#e8f1f8' }}>{r.customer}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{r.message}</div>
                    </div>
                  ))}
                  {reminders.filter(r => r.type === 'usa').length > 5 && (
                    <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', padding: '4px' }}>+{reminders.filter(r => r.type === 'usa').length - 5} daha</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) { setError('E-posta ve şifre gereklidir'); return; }
    const success = onLogin(email, password, rememberMe);
    if (!success) setError('E-posta veya şifre hatalı');
  };

  if (showForgotPassword) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0c1929 0%, #1a3a5c 50%, #0d2137 100%)', fontFamily: "'Segoe UI', sans-serif", padding: '20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '380px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔐</div>
            <h1 style={{ margin: 0, fontSize: '24px', color: '#e8f1f8', fontWeight: '700' }}>Şifremi Unuttum</h1>
            <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#94a3b8' }}>E-posta adresinizi girin</p>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>E-posta</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@paydos.com" style={inputStyle} />
          </div>
          <button onClick={() => { alert('Şifre sıfırlama linki e-posta adresinize gönderildi!'); setShowForgotPassword(false); }} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: '700', fontSize: '15px', cursor: 'pointer', marginBottom: '12px' }}>Şifre Sıfırlama Linki Gönder</button>
          <button onClick={() => setShowForgotPassword(false)} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#94a3b8', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}>← Giriş Ekranına Dön</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0c1929 0%, #1a3a5c 50%, #0d2137 100%)', fontFamily: "'Segoe UI', sans-serif", padding: '20px' }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>✈️</div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#e8f1f8', fontWeight: '700' }}>Paydos Turizm</h1>
          <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#94a3b8' }}>CRM Sistemine Giriş Yapın</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>E-posta</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@paydos.com" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Şifre</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" style={{ ...inputStyle, paddingRight: '40px' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}>{showPassword ? '🙈' : '👁️'}</button>
            </div>
          </div>

          {/* Beni Hatırla & Şifremi Unuttum */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#94a3b8' }}>
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#f59e0b' }} />
              Beni Hatırla
            </label>
            <button type="button" onClick={() => setShowForgotPassword(true)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}>Şifremi Unuttum</button>
          </div>

          {error && <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px', marginBottom: '16px', fontSize: '12px', color: '#ef4444', textAlign: 'center' }}>{error}</div>}

          <button type="submit" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '10px', color: '#0c1929', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>Giriş Yap</button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(() => { 
    const s = localStorage.getItem('paydos_logged_in') || sessionStorage.getItem('paydos_logged_in'); 
    return s === 'true'; 
  });
  const [currentUser, setCurrentUser] = useState(() => { 
    const s = localStorage.getItem('paydos_current_user') || sessionStorage.getItem('paydos_current_user'); 
    return s ? JSON.parse(s) : null; 
  });
  
  // UI state
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  
  // Data state - initialized empty, will be loaded from Supabase
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [visaApplications, setVisaApplications] = useState([]);
  const [tours, setTours] = useState([]);
  const [hotelReservations, setHotelReservations] = useState([]);
  const [islemFirmalari, setIslemFirmalari] = useState(['Paydos', 'RBN', 'Oğuz', 'İ Data', 'İ Data Mobil', 'Oğuzhan İst.']);
  const defaultEtiketler = [
    { name: 'VIP', color: '#f59e0b' },
    { name: 'Kurumsal', color: '#3b82f6' },
    { name: 'Bireysel', color: '#10b981' },
    { name: 'Fuar', color: '#8b5cf6' },
    { name: 'Potansiyel', color: '#06b6d4' },
    { name: 'Sorunlu', color: '#ef4444' }
  ];
  const [musteriEtiketleri, setMusteriEtiketleri] = useState(defaultEtiketler);
  const defaultWhatsappMesaj = `Sayın {isim} {hitap},

{ulke} {vizeTuru} vize başvurunuzla ilgili bilgilendirmek isteriz.

{randevuBilgisi}

📋 Başvurunuz için gerekli evrak listesi daha önce e-posta adresinize gönderilmiştir. Eğer tekrar göndermemizi isterseniz e-posta adresinize gönderebiliriz.

{evrakTeslimTarihi}

📧 Islak imzalı olmayan evrakları vize@paydostur.com adresimize gönderebilirsiniz.

💬 Sorularınız için bize her zaman ulaşabilirsiniz.

İyi günler dileriz,
Paydos Turizm`;
  const [whatsappMesajlar, setWhatsappMesajlar] = useState({ schengen: defaultWhatsappMesaj, usa: defaultWhatsappMesaj, uk: defaultWhatsappMesaj, russia: defaultWhatsappMesaj, uae: defaultWhatsappMesaj, china: defaultWhatsappMesaj });

  // Default değerler
  const defaultFirmalar = ['Paydos', 'RBN', 'Oğuz', 'İ Data', 'İ Data Mobil', 'Oğuzhan İst.'];

  // Load data on mount - Supabase'den yükle
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Supabase'den verileri çek
        const [usersRes, customersRes, visaRes, toursRes, hotelsRes, settingsRes] = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('customers').select('*').order('created_at', { ascending: false }),
          supabase.from('visa_applications').select('*').order('created_at', { ascending: false }),
          supabase.from('tours').select('*').order('created_at', { ascending: false }),
          supabase.from('hotel_reservations').select('*').order('created_at', { ascending: false }),
          supabase.from('settings').select('*')
        ]);

        // Verileri state'e yükle
        if (usersRes.data?.length > 0) {
          setUsers(toCamelCase(usersRes.data));
        } else {
          setUsers(defaultUsers);
        }

        if (customersRes.data?.length > 0) {
          const customersData = toCamelCase(customersRes.data).map(c => ({
            ...c,
            tags: Array.isArray(c.tags) ? c.tags : [],
            activities: Array.isArray(c.activities) ? c.activities : []
          }));
          setCustomers(customersData);
        } else {
          setCustomers(storage.get('customers', defaultCustomers));
        }

        if (visaRes.data?.length > 0) {
          setVisaApplications(toCamelCase(visaRes.data));
        } else {
          setVisaApplications(storage.get('visa', defaultVisaApplications));
        }

        if (toursRes.data?.length > 0) {
          setTours(toCamelCase(toursRes.data));
        } else {
          setTours(storage.get('tours', defaultTours));
        }

        if (hotelsRes.data?.length > 0) {
          setHotelReservations(toCamelCase(hotelsRes.data));
        } else {
          setHotelReservations(storage.get('hotels', defaultHotelReservations));
        }

        // Ayarları yükle
        if (settingsRes.data) {
          settingsRes.data.forEach(s => {
            if (s.key === 'firmalar' && s.value) setIslemFirmalari(s.value);
            if (s.key === 'etiketler' && s.value) setMusteriEtiketleri(s.value);
            if (s.key === 'whatsapp_mesajlar' && s.value) setWhatsappMesajlar(s.value);
          });
        }

        console.log('✅ Veriler Supabase\'den yüklendi');
      } catch (err) {
        console.error('❌ Supabase hatası, localStorage kullanılıyor:', err);
        // Fallback to localStorage
        setUsers(storage.get('users', defaultUsers));
        setCustomers(storage.get('customers', defaultCustomers));
        setVisaApplications(storage.get('visa', defaultVisaApplications));
        setTours(storage.get('tours', defaultTours));
        setHotelReservations(storage.get('hotels', defaultHotelReservations));
        setIslemFirmalari(storage.get('firmalar', defaultFirmalar));
        setMusteriEtiketleri(storage.get('etiketler', defaultEtiketler));
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  // Supabase'e kaydet - Customers
  const saveCustomerToSupabase = async (customer, isNew = false) => {
    try {
      const snakeData = toSnakeCase(customer);
      if (isNew) {
        delete snakeData.id;
        const { data, error } = await supabase.from('customers').insert([snakeData]).select();
        if (error) throw error;
        return data?.[0];
      } else {
        snakeData.updated_at = new Date().toISOString();
        const { error } = await supabase.from('customers').update(snakeData).eq('id', customer.id);
        if (error) throw error;
      }
    } catch (err) {
      console.error('Müşteri kaydetme hatası:', err);
    }
  };

  // Supabase'e kaydet - Visa
  const saveVisaToSupabase = async (visa, isNew = false) => {
    try {
      const snakeData = toSnakeCase(visa);
      if (isNew) {
        delete snakeData.id;
        const { data, error } = await supabase.from('visa_applications').insert([snakeData]).select();
        if (error) throw error;
        return data?.[0];
      } else {
        snakeData.updated_at = new Date().toISOString();
        const { error } = await supabase.from('visa_applications').update(snakeData).eq('id', visa.id);
        if (error) throw error;
      }
    } catch (err) {
      console.error('Vize kaydetme hatası:', err);
    }
  };

  // Supabase'e kaydet - Tours
  const saveTourToSupabase = async (tour, isNew = false) => {
    try {
      const snakeData = toSnakeCase(tour);
      if (isNew) {
        delete snakeData.id;
        const { data, error } = await supabase.from('tours').insert([snakeData]).select();
        if (error) throw error;
        return data?.[0];
      } else {
        snakeData.updated_at = new Date().toISOString();
        const { error } = await supabase.from('tours').update(snakeData).eq('id', tour.id);
        if (error) throw error;
      }
    } catch (err) {
      console.error('Tur kaydetme hatası:', err);
    }
  };

  // Supabase'e kaydet - Hotels
  const saveHotelToSupabase = async (hotel, isNew = false) => {
    try {
      const snakeData = toSnakeCase(hotel);
      if (isNew) {
        delete snakeData.id;
        const { data, error } = await supabase.from('hotel_reservations').insert([snakeData]).select();
        if (error) throw error;
        return data?.[0];
      } else {
        snakeData.updated_at = new Date().toISOString();
        const { error } = await supabase.from('hotel_reservations').update(snakeData).eq('id', hotel.id);
        if (error) throw error;
      }
    } catch (err) {
      console.error('Otel kaydetme hatası:', err);
    }
  };

  // Supabase'den sil
  const deleteFromSupabase = async (table, id) => {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error(`${table} silme hatası:`, err);
    }
  };

  // Ayarları Supabase'e kaydet
  const saveSettingsToSupabase = async (key, value) => {
    try {
      await supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    } catch (err) {
      console.error('Ayar kaydetme hatası:', err);
    }
  };

  // Auto-save to localStorage (backup) when data changes
  useEffect(() => {
    if (!isLoading) storage.set('customers', customers);
  }, [customers, isLoading]);
  
  useEffect(() => {
    if (!isLoading) storage.set('visa', visaApplications);
  }, [visaApplications, isLoading]);
  
  useEffect(() => {
    if (!isLoading) storage.set('users', users);
  }, [users, isLoading]);
  
  useEffect(() => {
    if (!isLoading) storage.set('tours', tours);
  }, [tours, isLoading]);
  
  useEffect(() => {
    if (!isLoading) storage.set('hotels', hotelReservations);
  }, [hotelReservations, isLoading]);
  
  useEffect(() => {
    if (!isLoading) {
      storage.set('firmalar', islemFirmalari);
      saveSettingsToSupabase('firmalar', islemFirmalari);
    }
  }, [islemFirmalari, isLoading]);
  
  useEffect(() => {
    if (!isLoading) {
      storage.set('etiketler', musteriEtiketleri);
      saveSettingsToSupabase('etiketler', musteriEtiketleri);
    }
  }, [musteriEtiketleri, isLoading]);

  // Window resize handler
  useEffect(() => { const h = () => { setIsMobile(window.innerWidth < 1024); if (window.innerWidth < 1024) setSidebarOpen(false); }; window.addEventListener('resize', h); if (window.innerWidth < 1024) setSidebarOpen(false); return () => window.removeEventListener('resize', h); }, []);

  const handleLogin = (email, password, rememberMe) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
      if (rememberMe) {
        localStorage.setItem('paydos_logged_in', 'true');
        localStorage.setItem('paydos_current_user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('paydos_logged_in', 'true');
        sessionStorage.setItem('paydos_current_user', JSON.stringify(user));
      }
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('paydos_logged_in');
    localStorage.removeItem('paydos_current_user');
    sessionStorage.removeItem('paydos_logged_in');
    sessionStorage.removeItem('paydos_current_user');
  };

  const modules = [{ id: 'dashboard', label: 'Dashboard', icon: '📊', color: '#06b6d4' }, { id: 'customers', label: 'Müşteri Data', icon: '👥', color: '#f59e0b' }, { id: 'visa', label: 'Vize Takip', icon: '🛂', color: '#3b82f6' }, { id: 'tours', label: 'Tur Yönetimi', icon: '🌍', color: '#10b981' }, { id: 'hotels', label: 'Otel Rezervasyon', icon: '🏨', color: '#8b5cf6' }, { id: 'settings', label: 'Ayarlar', icon: '⚙️', color: '#64748b' }];
  const stats = { dashboard: 0, customers: customers.length, visa: visaApplications.filter(v => v.status !== 'Onaylandı' && v.status !== 'Reddedildi').length, tours: tours.filter(t => t.status === 'Açık').length, hotels: hotelReservations.filter(h => h.status === 'Beklemede').length, settings: 0 };
  
  // Hatırlatma sayısı hesapla
  const reminderCount = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let count = 0;
    
    // Pasaport (6 ay içinde)
    const sixMonths = new Date();
    sixMonths.setMonth(sixMonths.getMonth() + 6);
    customers.forEach(c => {
      if (c.passportExpiry) {
        const exp = safeParseDate(c.passportExpiry);
        if (exp && exp <= sixMonths && exp >= today) count++;
      }
    });
    
    // Schengen (1 ay içinde)
    const oneMonth = new Date();
    oneMonth.setMonth(oneMonth.getMonth() + 1);
    customers.forEach(c => {
      if (c.schengenVisaEnd && c.schengenCountry) {
        const exp = safeParseDate(c.schengenVisaEnd);
        if (exp && exp <= oneMonth && exp >= today) count++;
      }
    });
    
    // ABD (3 ay içinde)
    const threeMonths = new Date();
    threeMonths.setMonth(threeMonths.getMonth() + 3);
    customers.forEach(c => {
      if (c.usaVisaEnd && c.usaVisa === 'Var') {
        const exp = safeParseDate(c.usaVisaEnd);
        if (exp && exp <= threeMonths && exp >= today) count++;
      }
    });
    
    return count;
  })();

  // Loading Screen
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #0c1929 0%, #1a3a5c 50%, #0d2137 100%)', fontFamily: "'Segoe UI', sans-serif", color: '#e8f1f8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 20px', animation: 'pulse 1.5s infinite' }}>✈️</div>
          <h2 style={{ margin: '0 0 10px', fontSize: '20px' }}>Paydos CRM</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Veriler yükleniyor...</p>
          <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', margin: '20px auto', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: '#f59e0b', animation: 'loading 1s infinite' }} />
          </div>
          <style>{`
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            @keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
          `}</style>
        </div>
      </div>
    );
  }

  // Login Ekranı
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', maxWidth: '100vw', overflow: 'hidden', background: 'linear-gradient(135deg, #0c1929 0%, #1a3a5c 50%, #0d2137 100%)', fontFamily: "'Segoe UI', sans-serif", color: '#e8f1f8' }}>
      <style>{`
        html, body, #root { margin: 0; padding: 0; overflow-x: hidden; width: 100%; max-width: 100vw; }
        select option { background: #1a3a5c; color: #e8f1f8; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select, textarea, button { font-size: 16px !important; }
        input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; accent-color: #f59e0b; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
      `}</style>
      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 199 }} />
      )}
      {(sidebarOpen || !isMobile) && (
        <aside style={{ width: isMobile ? '280px' : (sidebarOpen ? '240px' : '60px'), minWidth: isMobile ? '280px' : (sidebarOpen ? '240px' : '60px'), background: isMobile ? '#0c1929' : 'rgba(0,0,0,0.4)', borderRight: '1px solid rgba(255,255,255,0.1)', position: isMobile ? 'fixed' : 'sticky', top: 0, left: 0, height: '100vh', zIndex: 200, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>✈️</div>{(sidebarOpen || isMobile) && <span style={{ fontWeight: '700', fontSize: '15px' }}>Paydos Turizm</span>}</div>
            {isMobile && <button onClick={() => setSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>✕</button>}
          </div>
          <nav style={{ flex: 1, padding: '10px 6px' }}>
            {modules.map(m => (<button key={m.id} onClick={() => { setActiveModule(m.id); if (isMobile) setSidebarOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 12px', marginBottom: '4px', background: activeModule === m.id ? `${m.color}25` : 'transparent', border: activeModule === m.id ? `1px solid ${m.color}50` : '1px solid transparent', borderRadius: '8px', color: activeModule === m.id ? m.color : '#94a3b8', cursor: 'pointer', justifyContent: sidebarOpen || isMobile ? 'flex-start' : 'center' }}><span style={{ fontSize: '16px' }}>{m.icon}</span>{(sidebarOpen || isMobile) && <><span style={{ flex: 1, textAlign: 'left', fontWeight: activeModule === m.id ? '600' : '400', fontSize: '13px' }}>{m.label}</span>{stats[m.id] > 0 && <span style={{ background: m.color, color: '#0c1929', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '8px' }}>{stats[m.id]}</span>}</>}</button>))}
          </nav>
        </aside>
      )}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
        <header style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {isMobile && <button onClick={() => setSidebarOpen(true)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', width: '34px', height: '34px', cursor: 'pointer', fontSize: '16px' }}>☰</button>}
          {!isMobile && <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', width: '34px', height: '34px', cursor: 'pointer', fontSize: '14px' }}>{sidebarOpen ? '←' : '→'}</button>}
          <h1 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}><span>{modules.find(m => m.id === activeModule)?.icon}</span>{modules.find(m => m.id === activeModule)?.label}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Bildirim Zili */}
            <button onClick={() => setActiveModule('dashboard')} style={{ position: 'relative', background: reminderCount > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)', border: reminderCount > 0 ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
              🔔
              {reminderCount > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: '700', padding: '2px 5px', borderRadius: '10px', minWidth: '16px', textAlign: 'center' }}>{reminderCount > 99 ? '99+' : reminderCount}</span>
              )}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px' }}>
              <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#0c1929' }}>{currentUser?.name?.charAt(0) || 'U'}</div>
              {!isMobile && <span style={{ fontSize: '13px', color: '#e8f1f8' }}>{currentUser?.name}</span>}
            </div>
            <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', padding: '6px 12px', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>🚪 {!isMobile && 'Çıkış'}</button>
          </div>
        </header>
        <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? '12px' : '16px', maxWidth: '100%' }}>
          {activeModule === 'dashboard' && <DashboardModule customers={customers} visaApplications={visaApplications} tours={tours} hotelReservations={hotelReservations} isMobile={isMobile} setActiveModule={setActiveModule} />}
          {activeModule === 'customers' && <CustomerModule customers={customers} setCustomers={setCustomers} isMobile={isMobile} musteriEtiketleri={musteriEtiketleri} />}
          {activeModule === 'visa' && <VisaModule visaApplications={visaApplications} setVisaApplications={setVisaApplications} customers={customers} setCustomers={setCustomers} isMobile={isMobile} setActiveModule={setActiveModule} islemFirmalari={islemFirmalari} whatsappMesajlar={whatsappMesajlar} />}
          {activeModule === 'tours' && <TourModule tours={tours} setTours={setTours} isMobile={isMobile} />}
          {activeModule === 'hotels' && <HotelModule hotelReservations={hotelReservations} setHotelReservations={setHotelReservations} customers={customers} isMobile={isMobile} />}
          {activeModule === 'settings' && <SettingsModule currentUser={currentUser} setCurrentUser={setCurrentUser} users={users} setUsers={setUsers} isMobile={isMobile} islemFirmalari={islemFirmalari} setIslemFirmalari={setIslemFirmalari} whatsappMesajlar={whatsappMesajlar} setWhatsappMesajlar={setWhatsappMesajlar} defaultWhatsappMesaj={defaultWhatsappMesaj} musteriEtiketleri={musteriEtiketleri} setMusteriEtiketleri={setMusteriEtiketleri} />}
        </div>
      </main>
    </div>
  );
}

function CustomerModule({ customers, setCustomers, isMobile, musteriEtiketleri }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerModal, setCustomerModal] = useState(null);
  const [visaModal, setVisaModal] = useState(null);
  const [passportModal, setPassportModal] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [saveMessage, setSaveMessage] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const fileInputRef = useRef(null);

  const emptyForm = { tcKimlik: '', firstName: '', lastName: '', gender: '', birthDate: '', birthPlace: '', companyName: '', sector: '', position: '', city: '', phone: '+905', email: '', address: '', tkMembership: '', passportNo: '', passportStart: '', passportExpiry: '', nationality: 'Türkiye', passportDocuments1: [], passportDocuments2: [], greenPassport: 'Hayır', schengenCountry: '', schengenVisaStart: '', schengenVisaEnd: '', schengenDocuments1: [], schengenDocuments2: [], schengenDocuments3: [], schengenDocuments4: [], usaVisa: '', usaVisaStart: '', usaVisaEnd: '', usaDocuments: [], notes: '', activities: [], tags: [] };
  const [formData, setFormData] = useState(emptyForm);

  const filteredCustomers = customers.filter(c => { 
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return c.firstName?.toLowerCase().includes(s) || c.lastName?.toLowerCase().includes(s) || c.passportNo?.toLowerCase().includes(s) || c.tcKimlik?.includes(searchTerm) || c.phone?.includes(searchTerm) || c.email?.toLowerCase().includes(s);
  });

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName || !formData.tcKimlik) { alert('Ad, Soyad ve TC Kimlik zorunludur!'); return; }
    if (formData.tcKimlik.length !== 11) { alert('TC Kimlik No 11 haneli olmalıdır!'); return; }
    if (!formData.phone.startsWith('+905') || formData.phone.length < 13) { alert('Telefon +905 ile başlamalı!'); return; }
    if (formData.email && !isValidEmail(formData.email)) { alert('Geçerli e-posta giriniz!'); return; }
    // Tarih validasyonları safeParseDate ile
    const passportStart = safeParseDate(formData.passportStart);
    const passportExpiry = safeParseDate(formData.passportExpiry);
    if (passportStart && passportExpiry && passportExpiry <= passportStart) { alert('Pasaport bitiş tarihi veriliş tarihinden sonra olmalı!'); return; }
    const schengenStart = safeParseDate(formData.schengenVisaStart);
    const schengenEnd = safeParseDate(formData.schengenVisaEnd);
    if (schengenStart && schengenEnd && schengenEnd <= schengenStart) { alert('Schengen bitiş tarihi başlangıçtan sonra olmalı!'); return; }
    const usaStart = safeParseDate(formData.usaVisaStart);
    const usaEnd = safeParseDate(formData.usaVisaEnd);
    if (usaStart && usaEnd && usaEnd <= usaStart) { alert('ABD bitiş tarihi başlangıçtan sonra olmalı!'); return; }
    const newActivity = { id: generateUniqueId(), type: editingCustomer ? 'customer_updated' : 'customer_created', description: editingCustomer ? 'Müşteri bilgileri güncellendi' : 'Müşteri kaydı oluşturuldu', date: new Date().toISOString(), user: 'Admin' };
    if (editingCustomer) { 
      const updatedActivities = [...(formData.activities || []), newActivity];
      setCustomers(p => p.map(c => c.id === editingCustomer.id ? { ...c, ...formData, activities: updatedActivities } : c)); 
      setEditingCustomer({ ...editingCustomer, ...formData, activities: updatedActivities }); 
      setFormData(prev => ({ ...prev, activities: updatedActivities }));
    }
    else { const n = { id: generateUniqueId(), ...formData, activities: [newActivity], createdAt: new Date().toISOString().split('T')[0] }; setCustomers(p => [...p, n]); setEditingCustomer(n); setFormData(n); }
    setSaveMessage('Kaydedildi ✓'); setTimeout(() => setSaveMessage(''), 2000);
  };

  const handleClose = () => { setShowModal(false); setEditingCustomer(null); setActiveTab('personal'); setSaveMessage(''); };
  const handleDelete = (id) => { if (window.confirm('Silmek istediğinizden emin misiniz?')) setCustomers(p => p.filter(c => c.id !== id)); };
  const isPassportExpiring = (c) => { 
    if (!c.passportExpiry) return false; 
    const exp = safeParseDate(c.passportExpiry);
    if (!exp) return false;
    const d = new Date(); 
    d.setMonth(d.getMonth() + 6); 
    return exp <= d; 
  };
  const hasVisa = (c) => c.schengenCountry || c.greenPassport === 'Evet' || c.usaVisa === 'Var';
  const toggleSelect = (id) => setSelectedIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const toggleSelectAll = () => setSelectedIds(selectedIds.length === filteredCustomers.length ? [] : filteredCustomers.map(c => c.id));

  const exportToExcel = () => {
    const data = customers.map(c => ({ 'TC Kimlik': c.tcKimlik, 'Ad': c.firstName, 'Soyad': c.lastName, 'Cinsiyet': c.gender, 'Doğum Tarihi': formatDate(c.birthDate), 'Doğum Yeri': c.birthPlace, 'Telefon': c.phone, 'E-posta': c.email, 'Şirket': c.companyName, 'Sektör': c.sector, 'Pozisyon': c.position, 'İkametgah Şehri': c.city, 'Adres': c.address, 'THY': c.tkMembership, 'Pasaport No': c.passportNo, 'Pasaport Veriliş': formatDate(c.passportStart), 'Pasaport Bitiş': formatDate(c.passportExpiry), 'Yeşil Pasaport': c.greenPassport, 'Schengen Ülke': c.schengenCountry, 'Schengen Başlangıç': formatDate(c.schengenVisaStart), 'Schengen Bitiş': formatDate(c.schengenVisaEnd), 'ABD Vize': c.usaVisa, 'ABD Başlangıç': formatDate(c.usaVisaStart), 'ABD Bitiş': formatDate(c.usaVisaEnd), 'Etiketler': (c.tags || []).join(', '), 'Notlar': c.notes }));
    const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Müşteriler'); XLSX.writeFile(wb, `Paydos_Musteriler_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportExpiringToExcel = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sixMonths = new Date(); sixMonths.setMonth(sixMonths.getMonth() + 6);
    const oneMonth = new Date(); oneMonth.setMonth(oneMonth.getMonth() + 1);
    const threeMonths = new Date(); threeMonths.setMonth(threeMonths.getMonth() + 3);
    
    const expiringData = [];
    
    // Pasaport bitenler (6 ay içinde)
    customers.forEach(c => {
      if (c.passportExpiry) {
        const exp = safeParseDate(c.passportExpiry);
        if (exp && exp >= today && exp <= sixMonths) {
          const daysLeft = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
          expiringData.push({
            'Tür': '📕 Pasaport',
            'Ad': c.firstName,
            'Soyad': c.lastName,
            'Telefon': c.phone,
            'E-posta': c.email,
            'Bitiş Tarihi': formatDate(c.passportExpiry),
            'Kalan Gün': daysLeft,
            'Durum': daysLeft <= 30 ? 'ACİL' : daysLeft <= 90 ? 'ORTA' : 'DÜŞÜK'
          });
        }
      }
    });
    
    // Schengen vize bitenler (1 ay içinde)
    customers.forEach(c => {
      if (c.schengenVisaEnd && c.schengenCountry) {
        const exp = safeParseDate(c.schengenVisaEnd);
        if (exp && exp >= today && exp <= oneMonth) {
          const daysLeft = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
          expiringData.push({
            'Tür': '🇪🇺 Schengen (' + c.schengenCountry + ')',
            'Ad': c.firstName,
            'Soyad': c.lastName,
            'Telefon': c.phone,
            'E-posta': c.email,
            'Bitiş Tarihi': formatDate(c.schengenVisaEnd),
            'Kalan Gün': daysLeft,
            'Durum': daysLeft <= 7 ? 'ACİL' : daysLeft <= 14 ? 'ORTA' : 'DÜŞÜK'
          });
        }
      }
    });
    
    // ABD vize bitenler (3 ay içinde)
    customers.forEach(c => {
      if (c.usaVisaEnd && c.usaVisa === 'Var') {
        const exp = safeParseDate(c.usaVisaEnd);
        if (exp && exp >= today && exp <= threeMonths) {
          const daysLeft = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
          expiringData.push({
            'Tür': '🇺🇸 ABD Vize',
            'Ad': c.firstName,
            'Soyad': c.lastName,
            'Telefon': c.phone,
            'E-posta': c.email,
            'Bitiş Tarihi': formatDate(c.usaVisaEnd),
            'Kalan Gün': daysLeft,
            'Durum': daysLeft <= 30 ? 'ACİL' : daysLeft <= 60 ? 'ORTA' : 'DÜŞÜK'
          });
        }
      }
    });
    
    if (expiringData.length === 0) {
      alert('Yakında bitecek pasaport veya vize bulunamadı!');
      return;
    }
    
    // Kalan güne göre sırala
    expiringData.sort((a, b) => a['Kalan Gün'] - b['Kalan Gün']);
    
    const ws = XLSX.utils.json_to_sheet(expiringData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bitenler');
    XLSX.writeFile(wb, `Paydos_Bitenler_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Schengen vizeli müşterileri Excel'e aktar
  const exportSchengenToExcel = () => {
    const schengenCustomers = customers.filter(c => c.schengenCountry || c.greenPassport === 'Evet');
    if (schengenCustomers.length === 0) {
      alert('Schengen vizeli müşteri bulunamadı!');
      return;
    }
    const today = new Date();
    const data = schengenCustomers.map(c => {
      const daysLeft = c.schengenVisaEnd ? getDaysLeft(c.schengenVisaEnd) : null;
      return {
        'Ad': c.firstName,
        'Soyad': c.lastName,
        'Telefon': c.phone,
        'E-posta': c.email,
        'Şehir': c.city,
        'Yeşil Pasaport': c.greenPassport,
        'Schengen Ülke': c.schengenCountry || (c.greenPassport === 'Evet' ? 'Vizesiz' : '-'),
        'Vize Başlangıç': formatDate(c.schengenVisaStart),
        'Vize Bitiş': formatDate(c.schengenVisaEnd),
        'Kalan Gün': c.greenPassport === 'Evet' ? '∞' : (daysLeft !== null ? daysLeft : '-'),
        'Durum': c.greenPassport === 'Evet' ? 'Yeşil Pasaport' : (daysLeft !== null ? (daysLeft < 0 ? 'Süresi Dolmuş' : daysLeft <= 30 ? 'Kritik' : daysLeft <= 90 ? 'Yaklaşıyor' : 'Geçerli') : '-'),
        'Pasaport No': c.passportNo,
        'Pasaport Bitiş': formatDate(c.passportExpiry)
      };
    });
    // Kalan güne göre sırala (yeşil pasaport en sona)
    data.sort((a, b) => {
      if (a['Kalan Gün'] === '∞') return 1;
      if (b['Kalan Gün'] === '∞') return -1;
      if (a['Kalan Gün'] === '-') return 1;
      if (b['Kalan Gün'] === '-') return -1;
      return Number(a['Kalan Gün']) - Number(b['Kalan Gün']);
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Schengen Vizeli');
    XLSX.writeFile(wb, `Paydos_Schengen_Vizeli_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // ABD vizeli müşterileri Excel'e aktar
  const exportUSAToExcel = () => {
    const usaCustomers = customers.filter(c => c.usaVisa === 'Var');
    if (usaCustomers.length === 0) {
      alert('ABD vizeli müşteri bulunamadı!');
      return;
    }
    const data = usaCustomers.map(c => {
      const daysLeft = c.usaVisaEnd ? getDaysLeft(c.usaVisaEnd) : null;
      return {
        'Ad': c.firstName,
        'Soyad': c.lastName,
        'Telefon': c.phone,
        'E-posta': c.email,
        'Şehir': c.city,
        'Vize Başlangıç': formatDate(c.usaVisaStart),
        'Vize Bitiş': formatDate(c.usaVisaEnd),
        'Kalan Gün': daysLeft !== null ? daysLeft : '-',
        'Durum': daysLeft !== null ? (daysLeft < 0 ? 'Süresi Dolmuş' : daysLeft <= 90 ? 'Kritik' : daysLeft <= 180 ? 'Yaklaşıyor' : 'Geçerli') : '-',
        'Pasaport No': c.passportNo,
        'Pasaport Bitiş': formatDate(c.passportExpiry)
      };
    });
    // Kalan güne göre sırala
    data.sort((a, b) => {
      if (a['Kalan Gün'] === '-') return 1;
      if (b['Kalan Gün'] === '-') return -1;
      return Number(a['Kalan Gün']) - Number(b['Kalan Gün']);
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ABD Vizeli');
    XLSX.writeFile(wb, `Paydos_ABD_Vizeli_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const importFromExcel = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' }); const ws = wb.Sheets[wb.SheetNames[0]]; const data = XLSX.utils.sheet_to_json(ws);
      const parseDate = (d) => { 
        if (!d) return ''; 
        // Excel number date handling (days since 1900-01-01)
        if (typeof d === 'number') {
          const excelDate = new Date((d - 25569) * 86400 * 1000);
          if (!isNaN(excelDate.getTime())) {
            return excelDate.toISOString().split('T')[0];
          }
          return '';
        }
        const str = String(d);
        if (str.includes('.')) { 
          const [day, month, year] = str.split('.'); 
          return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; 
        } 
        if (str.includes('-')) return str;
        return ''; 
      };
      let added = 0, updated = 0;
      data.forEach(row => {
        const tc = String(row['TC Kimlik'] || '').trim(); if (!tc) return;
        const existing = customers.find(c => c.tcKimlik === tc);
        const nd = { tcKimlik: tc, firstName: row['Ad'] || '', lastName: row['Soyad'] || '', gender: row['Cinsiyet'] || '', birthDate: parseDate(row['Doğum Tarihi']), birthPlace: row['Doğum Yeri'] || '', phone: row['Telefon'] || '+905', email: row['E-posta'] || '', companyName: row['Şirket'] || '', sector: row['Sektör'] || '', position: row['Pozisyon'] || '', city: row['İkametgah Şehri'] || row['Şehir'] || '', address: row['Adres'] || '', tkMembership: row['THY'] || '', passportNo: String(row['Pasaport No'] || '').toUpperCase(), passportStart: parseDate(row['Pasaport Veriliş']), passportExpiry: parseDate(row['Pasaport Bitiş']), nationality: 'Türkiye', greenPassport: row['Yeşil Pasaport'] || 'Hayır', schengenCountry: row['Schengen Ülke'] || '', schengenVisaStart: parseDate(row['Schengen Başlangıç']), schengenVisaEnd: parseDate(row['Schengen Bitiş']), usaVisa: row['ABD Vize'] || '', usaVisaStart: parseDate(row['ABD Başlangıç']), usaVisaEnd: parseDate(row['ABD Bitiş']), notes: row['Notlar'] || '', passportDocuments1: [], passportDocuments2: [], schengenDocuments1: [], schengenDocuments2: [], schengenDocuments3: [], schengenDocuments4: [], usaDocuments: [], activities: [{ id: generateUniqueId(), type: 'customer_created', description: 'Excel ile içe aktarıldı', date: new Date().toISOString(), user: 'Admin' }], tags: Array.isArray(row['Etiketler']) ? row['Etiketler'] : (typeof row['Etiketler'] === 'string' && row['Etiketler'] ? row['Etiketler'].split(',').map(t => t.trim()).filter(t => t) : []) };
        if (existing) { setCustomers(p => p.map(c => c.tcKimlik === tc ? { ...c, ...nd } : c)); updated++; }
        else { setCustomers(p => [...p, { id: generateUniqueId(), ...nd, createdAt: new Date().toISOString().split('T')[0] }]); added++; }
      });
      alert(`Excel aktarıldı! ${added} yeni, ${updated} güncellendi`);
    };
    reader.readAsBinaryString(file); e.target.value = '';
  };

  const tabs = [{ id: 'personal', label: 'Kişisel', color: '#f59e0b' }, { id: 'passport', label: 'Pasaport', color: '#10b981' }, { id: 'schengen', label: 'Schengen', color: '#3b82f6' }, { id: 'usa', label: 'Amerika', color: '#ef4444' }, { id: 'activities', label: 'Aktiviteler', color: '#8b5cf6' }];

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '10px', marginBottom: '14px' }}>
        <StatCard value={customers.length} label="Toplam Müşteri" color="#3b82f6" />
        <StatCard value={customers.filter(c => isPassportExpiring(c)).length} label="Pasaport Dolacak" color="#f59e0b" />
        <StatCard value={customers.filter(c => c.schengenCountry || c.greenPassport === 'Evet').length} label="Schengen" color="#10b981" onClick={exportSchengenToExcel} />
        <StatCard value={customers.filter(c => c.usaVisa === 'Var').length} label="ABD Vizeli" color="#8b5cf6" onClick={exportUSAToExcel} />
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Müşteri ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, minWidth: '120px', padding: '9px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e8f1f8', fontSize: '13px', outline: 'none' }} />
        <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={importFromExcel} style={{ display: 'none' }} />
        <button onClick={() => fileInputRef.current?.click()} style={{ padding: '9px 12px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '8px', color: '#10b981', cursor: 'pointer', fontSize: '12px' }}>📥 Import</button>
        <button onClick={exportToExcel} style={{ padding: '9px 12px', background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)', borderRadius: '8px', color: '#3b82f6', cursor: 'pointer', fontSize: '12px' }}>📤 Export</button>
        <button onClick={exportExpiringToExcel} style={{ padding: '9px 12px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}>⚠️ Bitenler</button>
        <button onClick={() => { setEditingCustomer(null); setFormData(emptyForm); setActiveTab('personal'); setShowModal(true); }} style={{ padding: '9px 14px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '8px', color: '#0c1929', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>+ Yeni</button>
      </div>

      {selectedIds.length > 0 && (
        <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '8px 14px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
          <span style={{ fontWeight: '600', color: '#f59e0b', fontSize: '12px' }}>{selectedIds.length} seçildi</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setSelectedIds([])} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: '#94a3b8', cursor: 'pointer', fontSize: '11px' }}>Temizle</button>
            <button onClick={() => { if(window.confirm(`${selectedIds.length} müşteriyi sil?`)) { setCustomers(p => p.filter(c => !selectedIds.includes(c.id))); setSelectedIds([]); }}} style={{ padding: '5px 10px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', fontSize: '11px' }}>Sil</button>
          </div>
        </div>
      )}

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden', width: '100%' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
            <thead><tr style={{ background: 'rgba(0,0,0,0.3)' }}>
              <th style={{ textAlign: 'center', padding: '10px 8px', width: '35px' }}><input type="checkbox" checked={selectedIds.length === filteredCustomers.length && filteredCustomers.length > 0} onChange={toggleSelectAll} /></th>
              <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>Ad Soyad</th>
              <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>Doğum</th>
              <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>TC Kimlik</th>
              <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>Telefon</th>
              <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>E-posta</th>
              <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>Pasaport</th>
              <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>Vize</th>
              <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>İşlem</th>
            </tr></thead>
            <tbody>
              {filteredCustomers.length === 0 ? <tr><td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '13px' }}>Müşteri bulunamadı</td></tr> : filteredCustomers.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: selectedIds.includes(c.id) ? 'rgba(245,158,11,0.08)' : 'transparent' }}>
                  <td style={{ textAlign: 'center', padding: '10px 8px' }}><input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleSelect(c.id)} /></td>
                  <td style={{ padding: '10px 8px' }}>
                    <span onClick={() => setCustomerModal(c)} style={{ cursor: 'pointer', color: '#f59e0b', fontWeight: '500', fontSize: '12px' }}>{c.firstName} {c.lastName}</span>
                    {(c.tags || []).length > 0 && <div style={{ display: 'flex', gap: '3px', marginTop: '3px', flexWrap: 'wrap' }}>
                      {(c.tags || []).slice(0, 2).map(tag => {
                        const etiket = musteriEtiketleri.find(e => e.name === tag);
                        const color = etiket?.color || '#64748b';
                        return <span key={tag} style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '8px', background: `${color}20`, color: color, fontWeight: '500' }}>{tag}</span>;
                      })}
                      {(c.tags || []).length > 2 && <span style={{ fontSize: '9px', color: '#64748b' }}>+{(c.tags || []).length - 2}</span>}
                    </div>}
                  </td>
                  <td style={{ padding: '10px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}>{formatDate(c.birthDate)}</td>
                  <td style={{ padding: '10px 8px' }}><code style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 5px', borderRadius: '4px', fontSize: '10px' }}>{c.tcKimlik}</code></td>
                  <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}><a href={`https://wa.me/${c.phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none', fontSize: '11px' }}>{c.phone}</a></td>
                  <td style={{ padding: '10px 8px', fontSize: '11px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email ? <a href={`mailto:${c.email}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>{c.email}</a> : <span style={{ color: '#64748b' }}>-</span>}</td>
                  <td style={{ padding: '10px 8px' }}><span onClick={() => setPassportModal(c)} style={{ cursor: 'pointer', fontSize: '10px', padding: '2px 5px', borderRadius: '4px', background: isPassportExpiring(c) ? 'rgba(239,68,68,0.2)' : 'transparent', color: isPassportExpiring(c) ? '#ef4444' : '#e8f1f8' }}>{c.passportNo}</span></td>
                  <td style={{ padding: '10px 8px' }}>{hasVisa(c) ? <span onClick={() => setVisaModal(c)} style={{ cursor: 'pointer', padding: '2px 6px', background: 'rgba(59,130,246,0.15)', borderRadius: '4px', color: '#60a5fa', fontSize: '10px' }}>Detay</span> : <span style={{ color: '#64748b', fontSize: '10px' }}>-</span>}</td>
                  <td style={{ padding: '10px 8px' }}><div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}><button onClick={() => { setEditingCustomer(c); setFormData(c); setActiveTab('personal'); setShowModal(true); }} style={{ background: 'rgba(245,158,11,0.2)', border: 'none', borderRadius: '4px', width: '26px', height: '26px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✏️</button><button onClick={() => handleDelete(c.id)} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: '4px', width: '26px', height: '26px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑️</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {customerModal && <Modal onClose={() => setCustomerModal(null)} title="Müşteri Bilgileri"><div style={{ textAlign: 'center', marginBottom: '12px' }}><div style={{ width: '45px', height: '45px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontSize: '18px', fontWeight: '600', color: '#0c1929' }}>{customerModal.firstName?.charAt(0)}{customerModal.lastName?.charAt(0)}</div><h2 style={{ margin: '0 0 3px 0', fontSize: '15px' }}>{customerModal.firstName} {customerModal.lastName}</h2><p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>{customerModal.position || customerModal.companyName || 'Bireysel'}</p>{(customerModal.tags || []).length > 0 && <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '8px', flexWrap: 'wrap' }}>{(customerModal.tags || []).map(tag => { const etiket = musteriEtiketleri.find(e => e.name === tag); return <span key={tag} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '10px', background: etiket?.color || '#64748b', color: '#fff', fontWeight: '600' }}>{tag}</span>; })}</div>}</div><div style={{ display: 'grid', gap: '6px' }}><InfoBox label="Şirket" value={customerModal.companyName} /><InfoBox label="Sektör" value={customerModal.sector} /><InfoBox label="Pozisyon" value={customerModal.position} /><InfoBox label="Doğum Yeri" value={customerModal.birthPlace} /><InfoBox label="İkametgah Şehri" value={customerModal.city} /><InfoBox label="Adres" value={customerModal.address} /><InfoBox label="THY Miles&Smiles" value={customerModal.tkMembership} highlight />{customerModal.notes && <InfoBox label="Notlar" value={customerModal.notes} />}</div></Modal>}
      {passportModal && <Modal onClose={() => setPassportModal(null)} title="Pasaport Bilgileri">
        <div style={{ display: 'grid', gap: '8px' }}>
          <InfoRow label="Ad Soyad" value={`${passportModal.firstName} ${passportModal.lastName}`} />
          <InfoRow label="Pasaport No" value={passportModal.passportNo} />
          <InfoRow label="Uyruk" value={passportModal.nationality} />
          <InfoRow label="Veriliş Tarihi" value={passportModal.passportStart ? formatDate(passportModal.passportStart) : '-'} />
          
          {/* Bitiş Tarihi - Renkli */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}>
            <span style={{ color: '#94a3b8' }}>Bitiş Tarihi:</span>
            <span style={{ 
              color: passportModal.passportExpiry && new Date(passportModal.passportExpiry) < new Date(Date.now() + 180*24*60*60*1000) ? '#ef4444' : '#10b981', 
              fontWeight: '600' 
            }}>
              {passportModal.passportExpiry ? formatDate(passportModal.passportExpiry) : '-'}
            </span>
          </div>
          
          {/* 6 ay uyarısı */}
          {passportModal.passportExpiry && new Date(passportModal.passportExpiry) < new Date(Date.now() + 180*24*60*60*1000) && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', padding: '8px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#ef4444' }}>⚠️ Pasaport 6 ay içinde sona erecek!</p>
            </div>
          )}
          
          {passportModal.greenPassport === 'Evet' && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', padding: '8px', marginTop: '6px' }}><p style={{ margin: 0, fontSize: '11px', color: '#10b981' }}>✓ Yeşil Pasaport</p></div>}
          
          {/* Pasaport Görüntüleri */}
          <div style={{ marginTop: '10px' }}>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Pasaport Görüntüleri</p>
            {((passportModal.passportDocuments1?.length > 0 && passportModal.passportDocuments1[0]?.data) || (passportModal.passportDocuments2?.length > 0 && passportModal.passportDocuments2[0]?.data)) ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {passportModal.passportDocuments1?.filter(doc => doc?.data).map((doc, i) => (
                  <div key={`p1-${i}`} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={doc.data} alt="Pasaport 1" style={{ width: '100%', height: '120px', objectFit: 'cover', cursor: 'pointer' }} onClick={() => window.open(doc.data, '_blank')} />
                  </div>
                ))}
                {passportModal.passportDocuments2?.filter(doc => doc?.data).map((doc, i) => (
                  <div key={`p2-${i}`} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={doc.data} alt="Pasaport 2" style={{ width: '100%', height: '120px', objectFit: 'cover', cursor: 'pointer' }} onClick={() => window.open(doc.data, '_blank')} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>📷 Pasaport görüntüsü yüklenmemiş</p>
              </div>
            )}
          </div>
        </div>
      </Modal>}
      {visaModal && <Modal onClose={() => setVisaModal(null)} title="Vize Bilgileri">
        <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>{visaModal.firstName} {visaModal.lastName}</p>
        
        {visaModal.greenPassport === 'Evet' && (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#10b981', fontWeight: '500' }}>✓ Yeşil Pasaport - Schengen vizesiz</p>
          </div>
        )}
        
        {/* Schengen Vizesi */}
        {visaModal.schengenCountry && visaModal.greenPassport !== 'Evet' && (
          <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px' }}>🇪🇺 Schengen Vizesi</h4>
            <div style={{ display: 'grid', gap: '4px', marginBottom: '10px' }}>
              <InfoRow label="Ülke" value={visaModal.schengenCountry} />
              {visaModal.schengenVisaStart && <InfoRow label="Başlangıç" value={formatDate(visaModal.schengenVisaStart)} />}
              {visaModal.schengenVisaEnd && <InfoRow label="Bitiş" value={formatDate(visaModal.schengenVisaEnd)} />}
              {!visaModal.schengenVisaStart && !visaModal.schengenVisaEnd && <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>Tarih bilgisi girilmemiş</p>}
            </div>
            {/* Schengen Vize Görüntüsü */}
            <p style={{ fontSize: '10px', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Vize Görüntüsü</p>
            {(() => {
              const allDocs = [visaModal.schengenDocuments1, visaModal.schengenDocuments2, visaModal.schengenDocuments3, visaModal.schengenDocuments4].filter(d => d?.length > 0 && d[0]?.data);
              return allDocs.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                  {allDocs.map((docs, i) => docs.filter(doc => doc?.data).map((doc, j) => (
                    <div key={`${i}-${j}`} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(59,130,246,0.3)' }}>
                      <img src={doc.data} alt="Schengen Vize" style={{ width: '100%', height: '80px', objectFit: 'cover', cursor: 'pointer' }} onClick={() => window.open(doc.data, '_blank')} />
                    </div>
                  )))}
                </div>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(59,130,246,0.3)', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#64748b' }}>📷 Vize görüntüsü yüklenmemiş</p>
                </div>
              );
            })()}
          </div>
        )}
        
        {/* Amerika Vizesi */}
        {visaModal.usaVisa === 'Var' && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '12px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>🇺🇸 Amerika Vizesi</h4>
            <div style={{ display: 'grid', gap: '4px', marginBottom: '10px' }}>
              {visaModal.usaVisaStart && <InfoRow label="Başlangıç" value={formatDate(visaModal.usaVisaStart)} />}
              {visaModal.usaVisaEnd && <InfoRow label="Bitiş" value={formatDate(visaModal.usaVisaEnd)} />}
              {!visaModal.usaVisaStart && !visaModal.usaVisaEnd && <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Tarih bilgisi girilmemiş</p>}
            </div>
            {/* ABD Vize Görüntüsü */}
            <p style={{ fontSize: '10px', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Vize Görüntüsü</p>
            {visaModal.usaDocuments?.length > 0 && visaModal.usaDocuments[0]?.data ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {visaModal.usaDocuments.filter(doc => doc?.data).map((doc, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <img src={doc.data} alt="ABD Vize" style={{ width: '100%', height: '80px', objectFit: 'cover', cursor: 'pointer' }} onClick={() => window.open(doc.data, '_blank')} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(239,68,68,0.3)', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '10px', color: '#64748b' }}>📷 Vize görüntüsü yüklenmemiş</p>
              </div>
            )}
          </div>
        )}
        
        {/* Vize yoksa */}
        {!visaModal.schengenCountry && visaModal.greenPassport !== 'Evet' && visaModal.usaVisa !== 'Var' && (
          <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', padding: '20px' }}>Kayıtlı vize bilgisi bulunmuyor</p>
        )}
      </Modal>}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 300, padding: isMobile ? '0' : '16px' }}>
          <div style={{ background: 'linear-gradient(180deg, #0f2744 0%, #0c1929 100%)', borderRadius: isMobile ? '14px 14px 0 0' : '12px', width: '100%', maxWidth: '550px', maxHeight: isMobile ? '88vh' : '82vh', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f2744', flexShrink: 0 }}>
              <div><h3 style={{ margin: 0, fontSize: '14px' }}>{editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri'}</h3>{editingCustomer && <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8' }}>{editingCustomer.firstName} {editingCustomer.lastName}</p>}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{saveMessage && <span style={{ color: '#10b981', fontSize: '11px', fontWeight: '500' }}>{saveMessage}</span>}<button onClick={handleClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button></div>
            </div>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>{tabs.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: '9px 10px', background: 'transparent', border: 'none', borderBottom: activeTab === t.id ? `2px solid ${t.color}` : '2px solid transparent', color: activeTab === t.id ? t.color : '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>{t.label}</button>)}</div>
            <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px' }}>
              {activeTab === 'personal' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <FormInput label="TC Kimlik No *" value={formData.tcKimlik} onChange={(e) => setFormData({...formData, tcKimlik: e.target.value.replace(/\D/g, '').slice(0, 11)})} maxLength={11} />
                <div><label style={labelStyle}>Cinsiyet</label><select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} style={selectStyle}><option value="">Seçiniz</option><option value="Erkek">Erkek</option><option value="Kadın">Kadın</option></select></div>
                <FormInput label="Ad *" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                <FormInput label="Soyad *" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                <DateInput label="Doğum Tarihi" value={formData.birthDate} onChange={(v) => setFormData({...formData, birthDate: v})} />
                <div><label style={labelStyle}>Doğum Yeri</label><input value={formData.birthPlace} onChange={(e) => setFormData({...formData, birthPlace: e.target.value})} style={inputStyle} placeholder="" /></div>
                <div><label style={labelStyle}>İkametgah Şehri</label><select value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} style={selectStyle}><option value="">Seçiniz</option>{turkishProvinces.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <FormInput label="Telefon * (+905...)" value={formData.phone} onChange={(e) => { const v = e.target.value; if(v.startsWith('+905') || v === '+90' || v === '+9' || v === '+' || v === '') setFormData({...formData, phone: v || '+905'}); }} />
                <FormInput label="E-posta" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="ornek@email.com" />
                <FormInput label="Şirket" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} />
                <div><label style={labelStyle}>Sektör</label><select value={formData.sector} onChange={(e) => setFormData({...formData, sector: e.target.value})} style={selectStyle}><option value="">Seçiniz</option><option value="Tekstil">Tekstil</option><option value="İnşaat">İnşaat</option><option value="Gıda">Gıda</option><option value="Otomotiv">Otomotiv</option><option value="Turizm">Turizm</option><option value="Sağlık">Sağlık</option><option value="Eğitim">Eğitim</option><option value="Finans">Finans / Bankacılık</option><option value="Teknoloji">Teknoloji / Yazılım</option><option value="Enerji">Enerji</option><option value="Lojistik">Lojistik / Taşımacılık</option><option value="Tarım">Tarım</option><option value="Madencilik">Madencilik</option><option value="Kimya">Kimya / İlaç</option><option value="Mobilya">Mobilya / Ahşap</option><option value="Makine">Makine / Metal</option><option value="Perakende">Perakende / Ticaret</option><option value="Medya">Medya / Reklam</option><option value="Hukuk">Hukuk / Danışmanlık</option><option value="Gayrimenkul">Gayrimenkul</option><option value="Diğer">Diğer</option></select></div>
                <FormInput label="Pozisyon" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} />
                <div style={{ gridColumn: 'span 2' }}><FormInput label="Adres" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} /></div>
                <FormInput label="THY Miles&Smiles" value={formData.tkMembership} onChange={(e) => setFormData({...formData, tkMembership: e.target.value})} />
                <div></div>
                {/* Etiketler */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Etiketler</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                    {musteriEtiketleri.map(etiket => {
                      const isSelected = (formData.tags || []).includes(etiket.name);
                      return (
                        <button key={etiket.name} type="button" onClick={() => {
                          const currentTags = formData.tags || [];
                          if (isSelected) {
                            setFormData({...formData, tags: currentTags.filter(t => t !== etiket.name)});
                          } else {
                            setFormData({...formData, tags: [...currentTags, etiket.name]});
                          }
                        }} style={{ padding: '6px 12px', borderRadius: '16px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', background: isSelected ? etiket.color : 'rgba(255,255,255,0.05)', border: `1px solid ${isSelected ? etiket.color : 'rgba(255,255,255,0.1)'}`, color: isSelected ? '#fff' : '#94a3b8' }}>
                          {etiket.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Notlar</label><textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={2} style={inputStyle} /></div>
              </div>}
              {activeTab === 'passport' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <FormInput label="Pasaport No *" value={formData.passportNo} onChange={(e) => setFormData({...formData, passportNo: e.target.value.toUpperCase()})} />
                <FormInput label="Uyruk" value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})} />
                <DateInput label="Veriliş Tarihi" value={formData.passportStart} onChange={(v) => setFormData({...formData, passportStart: v})} />
                <DateInput label="Bitiş Tarihi *" value={formData.passportExpiry} onChange={(v) => setFormData({...formData, passportExpiry: v})} />
                <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Yeşil Pasaport</label><select value={formData.greenPassport} onChange={(e) => setFormData({...formData, greenPassport: e.target.value})} style={selectStyle}><option value="Hayır">Hayır</option><option value="Evet">Evet</option></select></div>
                {formData.greenPassport === 'Evet' && <div style={{ gridColumn: 'span 2', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '10px' }}><p style={{ margin: 0, color: '#10b981', fontSize: '12px' }}>✓ Yeşil pasaport - Schengen vizesiz</p></div>}
                <FileUpload label="Pasaport Görüntüsü 1" files={formData.passportDocuments1 || []} onChange={(f) => setFormData({...formData, passportDocuments1: f})} />
                <FileUpload label="Pasaport Görüntüsü 2" files={formData.passportDocuments2 || []} onChange={(f) => setFormData({...formData, passportDocuments2: f})} />
              </div>}
              {activeTab === 'schengen' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {formData.greenPassport === 'Evet' ? <div style={{ gridColumn: 'span 2', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '14px', textAlign: 'center' }}><p style={{ margin: 0, color: '#10b981', fontSize: '13px', fontWeight: '500' }}>✓ Yeşil Pasaport Sahibi</p><p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '11px' }}>Schengen vizesine gerek yok</p></div> : <>
                  <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Schengen Ülkesi</label><select value={formData.schengenCountry} onChange={(e) => setFormData({...formData, schengenCountry: e.target.value})} style={selectStyle}><option value="">Seçiniz</option>{schengenCountries.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <DateInput label="Vize Başlangıç" value={formData.schengenVisaStart} onChange={(v) => setFormData({...formData, schengenVisaStart: v})} />
                  <DateInput label="Vize Bitiş" value={formData.schengenVisaEnd} onChange={(v) => setFormData({...formData, schengenVisaEnd: v})} />
                  <div style={{ gridColumn: 'span 2' }}><FileUpload label="Schengen Vize Görüntüsü 1" files={formData.schengenDocuments1 || []} onChange={(f) => setFormData({...formData, schengenDocuments1: f})} /></div>
                  <div style={{ gridColumn: 'span 2' }}><FileUpload label="Schengen Vize Görüntüsü 2" files={formData.schengenDocuments2 || []} onChange={(f) => setFormData({...formData, schengenDocuments2: f})} /></div>
                  <div style={{ gridColumn: 'span 2' }}><FileUpload label="Schengen Vize Görüntüsü 3" files={formData.schengenDocuments3 || []} onChange={(f) => setFormData({...formData, schengenDocuments3: f})} /></div>
                  <div style={{ gridColumn: 'span 2' }}><FileUpload label="Schengen Vize Görüntüsü 4" files={formData.schengenDocuments4 || []} onChange={(f) => setFormData({...formData, schengenDocuments4: f})} /></div>
                </>}
              </div>}
              {activeTab === 'usa' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Amerika Vizesi</label><select value={formData.usaVisa} onChange={(e) => setFormData({...formData, usaVisa: e.target.value})} style={selectStyle}><option value="">Seçiniz</option><option value="Var">Var</option><option value="Yok">Yok</option></select></div>
                {formData.usaVisa === 'Var' && <>
                  <DateInput label="Vize Başlangıç" value={formData.usaVisaStart} onChange={(v) => setFormData({...formData, usaVisaStart: v})} />
                  <DateInput label="Vize Bitiş" value={formData.usaVisaEnd} onChange={(v) => setFormData({...formData, usaVisaEnd: v})} />
                  <div style={{ gridColumn: 'span 2' }}><FileUpload label="Amerika Vize Görüntüsü" files={formData.usaDocuments || []} onChange={(f) => setFormData({...formData, usaDocuments: f})} /></div>
                </>}
              </div>}
              {activeTab === 'activities' && <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#8b5cf6' }}>📋 Aktivite Geçmişi</h4>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{(formData.activities || []).length} kayıt</span>
                </div>
                {(formData.activities || []).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Henüz aktivite kaydı yok</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[...(formData.activities || [])].sort((a, b) => new Date(b.date) - new Date(a.date)).map((act, i) => (
                      <div key={act.id || i} style={{ 
                        display: 'flex', gap: '12px', padding: '12px', 
                        background: act.type === 'visa_created' ? 'rgba(59,130,246,0.1)' : act.type === 'visa_updated' ? 'rgba(16,185,129,0.1)' : act.type === 'payment' ? 'rgba(245,158,11,0.1)' : act.type === 'note' ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${act.type === 'visa_created' ? 'rgba(59,130,246,0.2)' : act.type === 'visa_updated' ? 'rgba(16,185,129,0.2)' : act.type === 'payment' ? 'rgba(245,158,11,0.2)' : act.type === 'note' ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '8px', alignItems: 'flex-start'
                      }}>
                        <div style={{ 
                          width: '32px', height: '32px', borderRadius: '50%', 
                          background: act.type === 'visa_created' ? 'rgba(59,130,246,0.2)' : act.type === 'visa_updated' ? 'rgba(16,185,129,0.2)' : act.type === 'payment' ? 'rgba(245,158,11,0.2)' : act.type === 'customer_created' ? 'rgba(34,197,94,0.2)' : act.type === 'customer_updated' ? 'rgba(251,146,60,0.2)' : 'rgba(139,92,246,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0
                        }}>
                          {act.type === 'visa_created' ? '🛂' : act.type === 'visa_updated' ? '✏️' : act.type === 'payment' ? '💰' : act.type === 'customer_created' ? '👤' : act.type === 'customer_updated' ? '📝' : act.type === 'appointment' ? '📅' : '📌'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#e8f1f8' }}>{act.description}</p>
                          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#64748b' }}>
                            <span>📅 {new Date(act.date).toLocaleDateString('tr-TR')} {new Date(act.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>👤 {act.user}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>}
            </div>
            <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button onClick={handleClose} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>Kapat</button>
              <button onClick={handleSave} style={{ flex: 2, padding: '10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '8px', color: '#0c1929', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>{editingCustomer ? 'Kaydet' : 'Ekle'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VisaModule({ visaApplications, setVisaApplications, customers, setCustomers, isMobile, setActiveModule, islemFirmalari, whatsappMesajlar }) {
  const [view, setView] = useState('main'); // main, wizard, list
  const [step, setStep] = useState(1); // 1: kategori, 2: schengen ülke, 3: vize türü, 4: müşteri
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [editingVisa, setEditingVisa] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [statsCountryFilter, setStatsCountryFilter] = useState('all');
  
  const emptyForm = { customerId: '', customerName: '', customerTc: '', customerBirthDate: '', customerPassportNo: '', customerPassportStart: '', customerPassportExpiry: '', customerPhone: '', customerEmail: '', customerGender: '', visaCategory: '', country: '', schengenCountry: '', purposeType: '', usaVisaType: 'B1/B2', usaConsulate: '', ukVisaType: '', ukVisaDuration: '', ukConsulate: '', russiaVisaType: '', uaeVisaType: '', passportValidityOk: '', passportHasPages: '', passportConditionOk: '', passportCheckDone: false, applicationDate: new Date().toISOString().split('T')[0], islem: '', status: 'Evrak Topluyor', appointmentDate: '', appointmentTime: '', appointmentPnr: '', visaResult: '', visaDuration: '', visaDurationType: 'gün', visaStartDate: '', visaEndDate: '', visaFee: '', visaFeeCurrency: '€', paymentStatus: '', notes: '' };
  const [formData, setFormData] = useState(emptyForm);

  const visaCategories = [
    { id: 'schengen', label: 'Schengen Vize Başvuru', icon: '🇪🇺', color: '#3b82f6', desc: 'Avrupa ülkeleri' },
    { id: 'usa', label: 'Amerika Vizesi Başvuru', icon: '🇺🇸', color: '#ef4444', desc: 'ABD B1/B2 vize' },
    { id: 'uk', label: 'İngiltere Vize Başvuru', icon: '🇬🇧', color: '#8b5cf6', desc: 'UK visitor visa' },
    { id: 'russia', label: 'Rusya Vizesi Başvuru', icon: '🇷🇺', color: '#f59e0b', desc: 'Rusya turist/iş' },
    { id: 'uae', label: 'BAE Vize Başvuru', icon: '🇦🇪', color: '#10b981', desc: 'Dubai/Abu Dhabi' },
    { id: 'china', label: 'Çin Vizesi Başvuru', icon: '🇨🇳', color: '#dc2626', desc: 'Çin turist/iş' },
  ];

  const schengenCountriesList = ['Almanya', 'Avusturya', 'Belçika', 'Çekya', 'Danimarka', 'Estonya', 'Finlandiya', 'Fransa', 'Hırvatistan', 'Hollanda', 'İspanya', 'İsveç', 'İsviçre', 'İtalya', 'İzlanda', 'Letonya', 'Liechtenstein', 'Litvanya', 'Lüksemburg', 'Macaristan', 'Malta', 'Norveç', 'Polonya', 'Portekiz', 'Slovakya', 'Slovenya', 'Yunanistan'];
  
  const purposeTypes = [
    { id: 'tourist', label: 'Turistik', icon: '🏖️' },
    { id: 'business', label: 'Ticari / İş', icon: '💼' },
    { id: 'family', label: 'Aile / Eş / Dost Ziyareti', icon: '👨‍👩‍👧‍👦' },
  ];

  const filteredVisas = visaApplications.filter(v => { 
    if (filter !== 'all' && v.status !== filter) return false; 
    if (!searchTerm) return true; 
    return v.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || v.country?.toLowerCase().includes(searchTerm.toLowerCase()); 
  });

  const filteredCustomers = customers.filter(c => {
    if (!customerSearch) return true;
    const s = customerSearch.toLowerCase();
    return c.firstName?.toLowerCase().includes(s) || c.lastName?.toLowerCase().includes(s) || c.tcKimlik?.includes(customerSearch) || c.phone?.includes(customerSearch);
  });

  const startWizard = (category) => {
    setFormData({ ...emptyForm, visaCategory: category.id, country: category.id === 'schengen' ? '' : getCategoryCountry(category.id) });
    setStep(category.id === 'schengen' ? 2 : 3);
    setView('wizard');
  };

  const getCategoryCountry = (cat) => ({ usa: 'Amerika', uk: 'İngiltere', russia: 'Rusya', uae: 'BAE', china: 'Çin' }[cat] || '');
  const getCategoryLabel = (cat) => visaCategories.find(c => c.id === cat)?.label || cat;

  const selectSchengenCountry = (country) => {
    setFormData({ ...formData, schengenCountry: country, country: country });
    setStep(3);
  };

  const selectPurpose = (purpose) => {
    setFormData({ ...formData, purposeType: purpose.id });
    setStep(4);
  };

  const selectCustomer = (customer) => {
    setFormData({ 
      ...formData, 
      customerId: customer.id, 
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerTc: customer.tcKimlik,
      customerBirthDate: customer.birthDate,
      customerPassportNo: customer.passportNo,
      customerPassportStart: customer.passportStart,
      customerPassportExpiry: customer.passportExpiry,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      customerGender: customer.gender
    });
  };

  const handleSave = () => {
    if (!formData.customerId) { alert('Lütfen müşteri seçiniz!'); return; }
    if (!formData.islem) { alert('Lütfen işlem seçiniz!'); return; }
    
    const newVisa = {
      id: editingVisa?.id || Date.now(),
      ...formData,
      visaType: formData.visaCategory === 'schengen' ? 'Schengen' : getCategoryCountry(formData.visaCategory),
      applicationDate: formData.applicationDate || new Date().toISOString().split('T')[0]
    };
    
    // Müşteriye aktivite ekle
    const countryName = formData.visaCategory === 'schengen' ? (formData.schengenCountry || 'Schengen') : getCategoryCountry(formData.visaCategory);
    const activities = [];
    
    if (!editingVisa) {
      // Yeni başvuru
      activities.push({ id: generateUniqueId(), type: 'visa_created', description: `${countryName} vize başvurusu oluşturuldu`, date: new Date().toISOString(), user: 'Admin' });
    } else {
      // Güncelleme - nelerin değiştiğini kontrol et
      if (editingVisa.visaResult !== formData.visaResult && formData.visaResult) {
        const resultText = formData.visaResult === 'Onaylandı' ? '✅ Vize onaylandı' : formData.visaResult === 'Reddedildi' ? '❌ Vize reddedildi' : `Vize sonucu: ${formData.visaResult}`;
        activities.push({ id: generateUniqueId(), type: formData.visaResult === 'Onaylandı' ? 'visa_approved' : formData.visaResult === 'Reddedildi' ? 'visa_rejected' : 'visa_updated', description: `${countryName} - ${resultText}`, date: new Date().toISOString(), user: 'Admin' });
      }
      if (editingVisa.paymentStatus !== formData.paymentStatus && formData.paymentStatus === 'Ödendi') {
        activities.push({ id: generateUniqueId(), type: 'payment', description: `${countryName} vize ücreti ödendi (${formData.visaFee}${formData.visaFeeCurrency})`, date: new Date().toISOString(), user: 'Admin' });
      }
      if (editingVisa.appointmentDate !== formData.appointmentDate && formData.appointmentDate) {
        activities.push({ id: generateUniqueId(), type: 'appointment', description: `${countryName} randevu tarihi: ${formatDate(formData.appointmentDate)}${formData.appointmentTime ? ' ' + formData.appointmentTime : ''}`, date: new Date().toISOString(), user: 'Admin' });
      }
      // Eğer hiçbir önemli değişiklik yoksa genel güncelleme aktivitesi
      if (activities.length === 0) {
        activities.push({ id: generateUniqueId(), type: 'visa_updated', description: `${countryName} vize başvurusu güncellendi`, date: new Date().toISOString(), user: 'Admin' });
      }
    }
    
    setCustomers(prev => prev.map(c => {
      if (c.id === formData.customerId) {
        return { ...c, activities: [...(c.activities || []), ...activities] };
      }
      return c;
    }));
    
    if (editingVisa) {
      setVisaApplications(p => p.map(v => v.id === editingVisa.id ? newVisa : v));
    } else {
      setVisaApplications(p => [...p, newVisa]);
    }
    
    setSaveMessage('Başvuru kaydedildi ✓');
    setTimeout(() => {
      setSaveMessage('');
      resetWizard();
    }, 1500);
  };

  const resetWizard = () => {
    setView('main');
    setStep(1);
    setFormData(emptyForm);
    setCustomerSearch('');
    setEditingVisa(null);
  };

  const handleDelete = (id) => { 
    if (window.confirm('Silmek istediğinizden emin misiniz?')) 
      setVisaApplications(p => p.filter(v => v.id !== id)); 
  };

  const editVisa = (visa) => {
    setEditingVisa(visa);
    setFormData(visa);
    setStep(4);
    setView('wizard');
  };

  const getStatusColor = (s) => ({ 'Evrak Toplama': '#94a3b8', 'Randevu Bekleniyor': '#f59e0b', 'Randevu Alındı': '#3b82f6', 'Başvuru Yapıldı': '#8b5cf6', 'Değerlendirmede': '#06b6d4', 'Onaylandı': '#10b981', 'Reddedildi': '#ef4444' }[s] || '#94a3b8');
  const getPurposeLabel = (id) => purposeTypes.find(p => p.id === id)?.label || id;
  
  // Randevu uyarısı - 10 gün veya daha az kaldıysa
  const getDaysUntilAppointment = (date) => {
    if (!date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);
    const diffTime = appointmentDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const isAppointmentSoon = (date) => {
    const days = getDaysUntilAppointment(date);
    return days !== null && days >= 0 && days <= 10;
  };
  
  const upcomingAppointments = visaApplications.filter(v => isAppointmentSoon(v.appointmentDate) && v.visaResult !== 'Onay' && v.visaResult !== 'Red');

  // Ana Ekran - Vize Kategorileri
  if (view === 'main') {
    return (
      <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        {/* İstatistikler */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)', gap: '10px', marginBottom: '20px' }}>
          <StatCard value={visaApplications.length} label="Toplam Başvuru" color="#3b82f6" />
          <StatCard value={visaApplications.filter(v => v.status === 'Randevu Alındı').length} label="Randevulu" color="#f59e0b" />
          <StatCard value={upcomingAppointments.length} label="Yaklaşan Randevu" color="#ef4444" icon="⚠️" />
          <StatCard value={visaApplications.filter(v => v.visaResult === 'Onay').length} label="Onaylanan" color="#10b981" />
          <StatCard value={visaApplications.filter(v => v.visaResult === 'Red').length} label="Reddedilen" color="#64748b" />
          <StatCard value={visaApplications.filter(v => v.paymentStatus === 'Ödenmedi').length} label="Ödeme Bekleyen" color="#8b5cf6" />
        </div>

        {/* Yaklaşan Randevu Uyarısı */}
        {upcomingAppointments.length > 0 && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444' }}>Yaklaşan Randevular (10 gün içinde)</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {upcomingAppointments.map(v => {
                const days = getDaysUntilAppointment(v.appointmentDate);
                return (
                  <div key={v.id} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '8px 12px', fontSize: '12px' }}>
                    <span style={{ fontWeight: '600', color: '#e8f1f8' }}>{v.customerName}</span>
                    <span style={{ color: '#94a3b8' }}> • {v.country} • </span>
                    <span style={{ color: '#ef4444', fontWeight: '600' }}>{days === 0 ? 'BUGÜN!' : days === 1 ? 'YARIN!' : `${days} gün`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* İstatistikler */}
        {(() => {
          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth();
          
          // Tüm ülkeleri al
          const allCountries = [...new Set(visaApplications.map(v => v.country || v.schengenCountry).filter(Boolean))].sort();
          
          // Filtrelenmiş başvurular
          const filteredApps = statsCountryFilter === 'all' 
            ? visaApplications 
            : visaApplications.filter(v => (v.country || v.schengenCountry) === statsCountryFilter);
          
          // Tüm zamanlar
          const totalApps = filteredApps.length;
          const approved = filteredApps.filter(v => v.visaResult === 'Onay').length;
          const rejected = filteredApps.filter(v => v.visaResult === 'Red').length;
          const pending = totalApps - approved - rejected;
          const approvalRate = totalApps > 0 ? Math.round((approved / totalApps) * 100) : 0;
          
          // Bu yıl
          const thisYearApps = filteredApps.filter(v => v.applicationDate?.startsWith(currentYear));
          const thisYearApproved = thisYearApps.filter(v => v.visaResult === 'Onay').length;
          const thisYearRejected = thisYearApps.filter(v => v.visaResult === 'Red').length;
          
          // Bu ay
          const thisMonthApps = filteredApps.filter(v => {
            if (!v.applicationDate) return false;
            const d = safeParseDate(v.applicationDate);
            if (!d) return false;
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
          });
          const thisMonthApproved = thisMonthApps.filter(v => v.visaResult === 'Onay').length;
          const thisMonthRejected = thisMonthApps.filter(v => v.visaResult === 'Red').length;
          
          // Ülke bazlı
          const countryStats = {};
          filteredApps.forEach(v => {
            const country = v.country || v.schengenCountry || 'Diğer';
            if (!countryStats[country]) countryStats[country] = { total: 0, approved: 0, rejected: 0 };
            countryStats[country].total++;
            if (v.visaResult === 'Onay') countryStats[country].approved++;
            if (v.visaResult === 'Red') countryStats[country].rejected++;
          });
          const topCountries = Object.entries(countryStats).sort((a, b) => b[1].total - a[1].total).slice(0, 5);
          
          // Aylık trend (son 6 ay)
          const monthlyTrend = [];
          for (let i = 5; i >= 0; i--) {
            const d = new Date(currentYear, currentMonth - i, 1);
            const monthApps = filteredApps.filter(v => {
              if (!v.applicationDate) return false;
              const vd = safeParseDate(v.applicationDate);
              if (!vd) return false;
              return vd.getFullYear() === d.getFullYear() && vd.getMonth() === d.getMonth();
            });
            monthlyTrend.push({
              month: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'][d.getMonth()],
              total: monthApps.length,
              approved: monthApps.filter(v => v.visaResult === 'Onay').length,
              rejected: monthApps.filter(v => v.visaResult === 'Red').length
            });
          }
          const maxMonthly = Math.max(...monthlyTrend.map(m => m.total), 1);
          
          return (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📊 Vize İstatistikleri {statsCountryFilter !== 'all' && <span style={{ color: '#3b82f6' }}>({statsCountryFilter})</span>}
                </h3>
                <select value={statsCountryFilter} onChange={(e) => setStatsCountryFilter(e.target.value)} style={{ padding: '6px 10px', background: '#1a3a5c', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#e8f1f8', cursor: 'pointer', fontSize: '11px' }}>
                  <option value="all">🌍 Tüm Ülkeler</option>
                  {allCountries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              {/* Özet Kartları */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>{totalApps}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Toplam Başvuru</div>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{approved}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Onaylanan</div>
                </div>
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>{rejected}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Reddedilen</div>
                </div>
                <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>%{approvalRate}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Onay Oranı</div>
                </div>
              </div>
              
              {/* Bu Ay / Bu Yıl */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>📅 Bu Ay</div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span style={{ fontSize: '13px' }}><strong style={{ color: '#e8f1f8' }}>{thisMonthApps.length}</strong> <span style={{ color: '#64748b' }}>başvuru</span></span>
                    <span style={{ fontSize: '13px' }}><strong style={{ color: '#10b981' }}>{thisMonthApproved}</strong> <span style={{ color: '#64748b' }}>onay</span></span>
                    <span style={{ fontSize: '13px' }}><strong style={{ color: '#ef4444' }}>{thisMonthRejected}</strong> <span style={{ color: '#64748b' }}>red</span></span>
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>📆 Bu Yıl ({currentYear})</div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span style={{ fontSize: '13px' }}><strong style={{ color: '#e8f1f8' }}>{thisYearApps.length}</strong> <span style={{ color: '#64748b' }}>başvuru</span></span>
                    <span style={{ fontSize: '13px' }}><strong style={{ color: '#10b981' }}>{thisYearApproved}</strong> <span style={{ color: '#64748b' }}>onay</span></span>
                    <span style={{ fontSize: '13px' }}><strong style={{ color: '#ef4444' }}>{thisYearRejected}</strong> <span style={{ color: '#64748b' }}>red</span></span>
                  </div>
                </div>
              </div>
              
              {/* Aylık Trend Grafiği */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>📈 Son 6 Ay Trendi</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px' }}>
                  {monthlyTrend.map((m, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        {m.approved > 0 && <div style={{ height: `${(m.approved / maxMonthly) * 60}px`, background: '#10b981', borderRadius: '2px 2px 0 0' }} title={`${m.approved} onay`} />}
                        {m.rejected > 0 && <div style={{ height: `${(m.rejected / maxMonthly) * 60}px`, background: '#ef4444', borderRadius: '0' }} title={`${m.rejected} red`} />}
                        {(m.total - m.approved - m.rejected) > 0 && <div style={{ height: `${((m.total - m.approved - m.rejected) / maxMonthly) * 60}px`, background: '#64748b', borderRadius: '0 0 2px 2px' }} title={`${m.total - m.approved - m.rejected} beklemede`} />}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>{m.month}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>{m.total}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#94a3b8' }}><div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px' }} /> Onay</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#94a3b8' }}><div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '2px' }} /> Red</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#94a3b8' }}><div style={{ width: '10px', height: '10px', background: '#64748b', borderRadius: '2px' }} /> Beklemede</div>
                </div>
              </div>
              
              {/* Ülke Bazlı */}
              {statsCountryFilter === 'all' && topCountries.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>🌍 Ülke Bazlı Dağılım (Top 5)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {topCountries.map(([country, data], i) => (
                      <div key={i} onClick={() => setStatsCountryFilter(country)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px', borderRadius: '4px', transition: 'background 0.2s' }}>
                        <div style={{ width: '80px', fontSize: '11px', color: '#e8f1f8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{country}</div>
                        <div style={{ flex: 1, height: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                          {data.approved > 0 && <div style={{ width: `${(data.approved / data.total) * 100}%`, background: '#10b981', height: '100%' }} />}
                          {data.rejected > 0 && <div style={{ width: `${(data.rejected / data.total) * 100}%`, background: '#ef4444', height: '100%' }} />}
                          {(data.total - data.approved - data.rejected) > 0 && <div style={{ width: `${((data.total - data.approved - data.rejected) / data.total) * 100}%`, background: '#64748b', height: '100%' }} />}
                        </div>
                        <div style={{ width: '30px', fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>{data.total}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Randevu Takvimi */}
        {(() => {
          const today = new Date();
          const currentMonth = today.getMonth();
          const currentYear = today.getFullYear();
          const firstDay = new Date(currentYear, currentMonth, 1).getDay();
          const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
          const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
          const dayNames = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'];
          
          const getAppointmentsForDay = (day) => {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            return visaApplications.filter(v => v.appointmentDate === dateStr);
          };
          
          const days = [];
          for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) days.push(null);
          for (let i = 1; i <= daysInMonth; i++) days.push(i);
          
          return (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📅 Randevu Takvimi - {monthNames[currentMonth]} {currentYear}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {dayNames.map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '10px', color: '#64748b', padding: '4px', fontWeight: '600' }}>{d}</div>
                ))}
                {days.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} />;
                  const appointments = getAppointmentsForDay(day);
                  const isToday = day === today.getDate();
                  const hasAppointment = appointments.length > 0;
                  return (
                    <div key={day} style={{ 
                      textAlign: 'center', 
                      padding: '6px 2px', 
                      borderRadius: '6px',
                      background: isToday ? 'rgba(59,130,246,0.3)' : hasAppointment ? 'rgba(239,68,68,0.2)' : 'transparent',
                      border: isToday ? '2px solid #3b82f6' : hasAppointment ? '1px solid rgba(239,68,68,0.5)' : '1px solid transparent',
                      cursor: hasAppointment ? 'pointer' : 'default',
                      position: 'relative'
                    }} title={hasAppointment ? appointments.map(a => `${a.customerName} - ${a.country}`).join('\n') : ''}>
                      <div style={{ fontSize: '12px', color: isToday ? '#3b82f6' : hasAppointment ? '#ef4444' : '#e8f1f8', fontWeight: isToday || hasAppointment ? '600' : '400' }}>{day}</div>
                      {hasAppointment && (
                        <div style={{ fontSize: '8px', color: '#ef4444', marginTop: '2px' }}>{appointments.length} randevu</div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Takvim Altı Legend */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#94a3b8' }}>
                  <div style={{ width: '12px', height: '12px', background: 'rgba(59,130,246,0.3)', border: '2px solid #3b82f6', borderRadius: '3px' }} />
                  Bugün
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#94a3b8' }}>
                  <div style={{ width: '12px', height: '12px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)', borderRadius: '3px' }} />
                  Randevu Var
                </div>
              </div>
            </div>
          );
        })()}

        {/* Vize Başvuru Butonları */}
        <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', color: '#94a3b8' }}>Yeni Vize Başvurusu</h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {visaCategories.map(cat => (
            <button key={cat.id} onClick={() => startWizard(cat)} style={{ background: `${cat.color}15`, border: `2px solid ${cat.color}40`, borderRadius: '12px', padding: '20px 16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{cat.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: cat.color, marginBottom: '4px' }}>{cat.label}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{cat.desc}</div>
            </button>
          ))}
        </div>

        {/* Mevcut Başvurular */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Mevcut Başvurular</h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input type="text" placeholder="Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e8f1f8', outline: 'none', fontSize: '12px', width: '120px' }} />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '8px', background: '#1a3a5c', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#e8f1f8', cursor: 'pointer', fontSize: '11px' }}>
              <option value="all">Tümü</option>
              {visaStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
              <thead><tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>Müşteri</th>
                <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>Ülke</th>
                <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>İşlem</th>
                <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>Randevu</th>
                <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>Sonuç</th>
                <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>Ücret</th>
                <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>Ödeme</th>
                <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>Durum</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>Aksiyon</th>
              </tr></thead>
              <tbody>
                {filteredVisas.length === 0 ? (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '13px' }}>Başvuru bulunamadı</td></tr>
                ) : filteredVisas.map(v => {
                  const daysLeft = getDaysUntilAppointment(v.appointmentDate);
                  const isSoon = isAppointmentSoon(v.appointmentDate) && v.visaResult !== 'Onay' && v.visaResult !== 'Red';
                  return (
                  <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: isSoon ? 'rgba(239,68,68,0.1)' : 'transparent' }}>
                    <td style={{ padding: '10px 8px', fontWeight: '500', fontSize: '12px' }}>{v.customerName}</td>
                    <td style={{ padding: '10px 8px', fontSize: '11px' }}>
                      {v.country}
                      {v.visaCategory === 'usa' && v.usaVisaType && <span style={{ color: '#ef4444', fontSize: '10px' }}> ({v.usaVisaType})</span>}
                      {v.visaCategory === 'usa' && v.usaConsulate && <span style={{ color: '#64748b', fontSize: '10px' }}> - {v.usaConsulate}</span>}
                      {v.visaCategory === 'uk' && v.ukVisaType && <span style={{ color: '#8b5cf6', fontSize: '10px' }}> ({v.ukVisaType})</span>}
                      {v.visaCategory === 'uk' && v.ukVisaDuration && <span style={{ color: '#10b981', fontSize: '10px' }}> {v.ukVisaDuration}</span>}
                      {v.visaCategory === 'uk' && v.ukConsulate && <span style={{ color: '#64748b', fontSize: '10px' }}> - {v.ukConsulate}</span>}
                      {v.visaCategory === 'russia' && v.russiaVisaType && <span style={{ color: '#f59e0b', fontSize: '10px' }}> ({v.russiaVisaType.replace(/-/g, ' ').replace(/(\d+)(gun|ay|saat)/g, '$1 $2')})</span>}
                      {v.visaCategory === 'uae' && v.uaeVisaType && <span style={{ color: '#10b981', fontSize: '10px' }}> ({v.uaeVisaType.replace(/-/g, ' ')})</span>}
                    </td>
                    <td style={{ padding: '10px 8px', fontSize: '11px', color: '#f59e0b' }}>{v.islem || '-'}</td>
                    <td style={{ padding: '10px 8px', fontSize: '10px', whiteSpace: 'nowrap' }}>
                      {v.appointmentDate ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {isSoon && <span title={`${daysLeft} gün kaldı!`} style={{ fontSize: '12px' }}>⚠️</span>}
                          <span style={{ color: isSoon ? '#ef4444' : '#e8f1f8', fontWeight: isSoon ? '600' : '400' }}>
                            {formatDate(v.appointmentDate)}{v.appointmentTime ? ' ' + v.appointmentTime : ''}
                          </span>
                          {isSoon && <span style={{ fontSize: '9px', color: '#ef4444', fontWeight: '600' }}>({daysLeft === 0 ? 'BUGÜN!' : daysLeft === 1 ? 'YARIN!' : `${daysLeft} gün`})</span>}
                        </div>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '10px 8px' }}>{v.visaResult ? <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', background: v.visaResult === 'Onay' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: v.visaResult === 'Onay' ? '#10b981' : '#ef4444' }}>{v.visaResult}</span> : <span style={{ color: '#64748b', fontSize: '10px' }}>-</span>}</td>
                    <td style={{ padding: '10px 8px', fontSize: '11px', color: '#f59e0b', fontWeight: '500' }}>{v.visaFee ? `${v.visaFeeCurrency || '€'}${v.visaFee}` : '-'}</td>
                    <td style={{ padding: '10px 8px' }}>{v.paymentStatus ? <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', background: v.paymentStatus === 'Ödendi' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: v.paymentStatus === 'Ödendi' ? '#10b981' : '#ef4444' }}>{v.paymentStatus === 'Ödendi' ? '✓' : '✗'}</span> : <span style={{ color: '#64748b', fontSize: '10px' }}>-</span>}</td>
                    <td style={{ padding: '10px 8px' }}><span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', background: `${getStatusColor(v.status)}25`, color: getStatusColor(v.status), whiteSpace: 'nowrap' }}>{v.status}</span></td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
                        <button onClick={() => editVisa(v)} style={{ background: 'rgba(59,130,246,0.2)', border: 'none', borderRadius: '4px', width: '26px', height: '26px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✏️</button>
                        <button onClick={() => handleDelete(v.id)} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: '4px', width: '26px', height: '26px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Wizard Ekranı
  return (
    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={resetWizard} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', color: '#94a3b8', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <div>
          <h2 style={{ margin: 0, fontSize: '16px' }}>{editingVisa ? 'Başvuru Düzenle' : 'Yeni Vize Başvurusu'}</h2>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
            {formData.visaCategory && getCategoryLabel(formData.visaCategory)}
            {formData.schengenCountry && ` → ${formData.schengenCountry}`}
            {formData.purposeType && ` → ${getPurposeLabel(formData.purposeType)}`}
          </p>
        </div>
        {saveMessage && <span style={{ marginLeft: 'auto', color: '#10b981', fontSize: '13px', fontWeight: '500' }}>{saveMessage}</span>}
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= s ? '#3b82f6' : 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>

      {/* Step 2: Schengen Ülke Seçimi */}
      {step === 2 && formData.visaCategory === 'schengen' && (
        <div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>Schengen Ülkesi Seçin</h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '10px' }}>
            {schengenCountriesList.map(country => (
              <button key={country} onClick={() => selectSchengenCountry(country)} style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '10px', padding: '14px', cursor: 'pointer', color: '#e8f1f8', fontSize: '13px', fontWeight: '500', textAlign: 'center' }}>
                {country}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Vize Türü Seçimi */}
      {step === 3 && (
        <div>
          {/* Pasaport Kontrolü - önce bu sorular cevaplanmalı */}
          {!formData.passportCheckDone ? (
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>⚠️ Pasaport Kontrolü</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>Vize başvurusuna devam etmeden önce aşağıdaki soruları cevaplayın.</p>
              
              {/* Soru 1: Geçerlilik Süresi */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600', color: '#e8f1f8' }}>📅 Pasaportun dönüş tarihinden itibaren en az 6 ay geçerli mi?</p>
                <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#94a3b8' }}>Çoğu ülke, dönüş tarihinden itibaren en az 6 ay geçerli pasaport ister.</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setFormData({...formData, passportValidityOk: 'Evet'})} style={{ flex: 1, padding: '12px', background: formData.passportValidityOk === 'Evet' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)', border: formData.passportValidityOk === 'Evet' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', cursor: 'pointer', color: formData.passportValidityOk === 'Evet' ? '#10b981' : '#94a3b8', fontWeight: '600', fontSize: '13px' }}>✓ Evet</button>
                  <button onClick={() => setFormData({...formData, passportValidityOk: 'Hayır'})} style={{ flex: 1, padding: '12px', background: formData.passportValidityOk === 'Hayır' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)', border: formData.passportValidityOk === 'Hayır' ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', cursor: 'pointer', color: formData.passportValidityOk === 'Hayır' ? '#ef4444' : '#94a3b8', fontWeight: '600', fontSize: '13px' }}>✗ Hayır</button>
                </div>
                {formData.passportValidityOk === 'Hayır' && (
                  <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#ef4444' }}>⛔ Pasaport geçerlilik süresi yetersiz. Önce pasaport yenileme işlemi yapılmalıdır.</p>
                  </div>
                )}
              </div>

              {/* Soru 2: Boş Sayfa */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600', color: '#e8f1f8' }}>📄 Pasaportta en az 1-2 boş vize sayfası var mı?</p>
                <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#94a3b8' }}>Vize damgası için yeterli boş sayfa gereklidir.</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setFormData({...formData, passportHasPages: 'Evet'})} style={{ flex: 1, padding: '12px', background: formData.passportHasPages === 'Evet' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)', border: formData.passportHasPages === 'Evet' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', cursor: 'pointer', color: formData.passportHasPages === 'Evet' ? '#10b981' : '#94a3b8', fontWeight: '600', fontSize: '13px' }}>✓ Evet</button>
                  <button onClick={() => setFormData({...formData, passportHasPages: 'Hayır'})} style={{ flex: 1, padding: '12px', background: formData.passportHasPages === 'Hayır' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)', border: formData.passportHasPages === 'Hayır' ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', cursor: 'pointer', color: formData.passportHasPages === 'Hayır' ? '#ef4444' : '#94a3b8', fontWeight: '600', fontSize: '13px' }}>✗ Hayır</button>
                </div>
                {formData.passportHasPages === 'Hayır' && (
                  <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#ef4444' }}>⛔ Pasaportta yeterli boş sayfa yok. Önce yeni pasaport alınmalıdır.</p>
                  </div>
                )}
              </div>

              {/* Soru 3: Yıpranma Durumu */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600', color: '#e8f1f8' }}>🔍 Pasaport iyi durumda mı? (Yırtık, kopuk, zarar görmemiş)</p>
                <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#94a3b8' }}>Yırtık, kopuk veya zarar görmüş pasaportlar reddedilebilir.</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setFormData({...formData, passportConditionOk: 'Evet'})} style={{ flex: 1, padding: '12px', background: formData.passportConditionOk === 'Evet' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)', border: formData.passportConditionOk === 'Evet' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', cursor: 'pointer', color: formData.passportConditionOk === 'Evet' ? '#10b981' : '#94a3b8', fontWeight: '600', fontSize: '13px' }}>✓ Evet</button>
                  <button onClick={() => setFormData({...formData, passportConditionOk: 'Hayır'})} style={{ flex: 1, padding: '12px', background: formData.passportConditionOk === 'Hayır' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)', border: formData.passportConditionOk === 'Hayır' ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', cursor: 'pointer', color: formData.passportConditionOk === 'Hayır' ? '#ef4444' : '#94a3b8', fontWeight: '600', fontSize: '13px' }}>✗ Hayır</button>
                </div>
                {formData.passportConditionOk === 'Hayır' && (
                  <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#ef4444' }}>⛔ Hasarlı pasaport ile vize başvurusu yapılamaz. Önce yeni pasaport alınmalıdır.</p>
                  </div>
                )}
              </div>

              {/* Devam veya Uyarı */}
              {(formData.passportValidityOk === 'Hayır' || formData.passportHasPages === 'Hayır' || formData.passportConditionOk === 'Hayır') ? (
                <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>⛔ Başvuru Yapılamaz</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#f87171' }}>Pasaport gereklilikleri karşılanmadan vize başvurusu yapılamaz.</p>
                  <button onClick={resetWizard} style={{ marginTop: '12px', padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>← Ana Sayfaya Dön</button>
                </div>
              ) : (
                <button 
                  onClick={() => setFormData({...formData, passportCheckDone: true})} 
                  disabled={!formData.passportValidityOk || !formData.passportHasPages || !formData.passportConditionOk}
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    background: (formData.passportValidityOk === 'Evet' && formData.passportHasPages === 'Evet' && formData.passportConditionOk === 'Evet') ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.1)', 
                    border: 'none', 
                    borderRadius: '10px', 
                    color: (formData.passportValidityOk === 'Evet' && formData.passportHasPages === 'Evet' && formData.passportConditionOk === 'Evet') ? 'white' : '#64748b', 
                    fontWeight: '600', 
                    cursor: (formData.passportValidityOk === 'Evet' && formData.passportHasPages === 'Evet' && formData.passportConditionOk === 'Evet') ? 'pointer' : 'not-allowed', 
                    fontSize: '14px' 
                  }}
                >
                  {(formData.passportValidityOk === 'Evet' && formData.passportHasPages === 'Evet' && formData.passportConditionOk === 'Evet') ? '✓ Pasaport Uygun - Devam Et' : 'Tüm soruları cevaplayın'}
                </button>
              )}
            </div>
          ) : (
            /* Pasaport kontrolü tamamlandı - Vize türü seçimi göster */
            <div>
              {/* Pasaport OK badge */}
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>✅</span>
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '500' }}>Pasaport kontrolü tamamlandı</span>
                <button onClick={() => setFormData({...formData, passportCheckDone: false})} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}>Düzenle</button>
              </div>

          {/* ABD Vizesi için B1/B2 ve Konsolosluk Seçimi */}
          {formData.visaCategory === 'usa' ? (
            <>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>ABD Vize Bilgileri</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Vize Türü */}
                <div>
                  <label style={labelStyle}>Vize Türü</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['B1/B2', 'B1', 'B2'].map(type => (
                      <button key={type} onClick={() => setFormData({...formData, usaVisaType: type})} style={{ flex: 1, padding: '14px', background: formData.usaVisaType === type ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)', border: formData.usaVisaType === type ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', color: formData.usaVisaType === type ? '#ef4444' : '#94a3b8', fontWeight: '600', fontSize: '14px' }}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Konsolosluk */}
                <div>
                  <label style={labelStyle}>Konsolosluk</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['Ankara', 'İstanbul'].map(city => (
                      <button key={city} onClick={() => setFormData({...formData, usaConsulate: city})} style={{ flex: 1, padding: '14px', background: formData.usaConsulate === city ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)', border: formData.usaConsulate === city ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', color: formData.usaConsulate === city ? '#3b82f6' : '#94a3b8', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <span>{city === 'Ankara' ? '🏛️' : '🌉'}</span> {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => { if (!formData.usaConsulate) { alert('Konsolosluk seçiniz'); return; } setStep(4); }} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Devam Et →</button>
            </>
          ) : formData.visaCategory === 'uk' ? (
            /* İngiltere Vizesi için özel seçimler */
            <>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>🇬🇧 İngiltere Vize Bilgileri</h3>
              
              {/* Vize Türü */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Vize Türü</label>
                <select value={formData.ukVisaType} onChange={(e) => setFormData({...formData, ukVisaType: e.target.value})} style={selectStyle}>
                  <option value="">Seçiniz</option>
                  <option value="Turist">Turist Vizesi</option>
                  <option value="Aile/Arkadaş Ziyareti">Aile/Arkadaş Ziyareti Vizesi</option>
                  <option value="Ticari">Ticari Vize</option>
                  <option value="Şoför">Şoför Vizesi</option>
                  <option value="Öğrenci">Öğrenci Vizesi</option>
                  <option value="Tıbbi Tedavi">Tıbbi Tedavi Amaçlı Vize</option>
                  <option value="Tier 4 Öğrenci">Tier 4 Öğrenci Vizesi</option>
                  <option value="Çalışma">Çalışma Vizesi</option>
                  <option value="Ekspres">Ekspres Vizesi</option>
                  <option value="Aile Birleşimi">Aile Birleşimi Vizesi (Yerleşim)</option>
                  <option value="Transit">Transit Vize</option>
                </select>
              </div>

              {/* Vize Süresi ve Konsolosluk */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Vize Süresi */}
                <div>
                  <label style={labelStyle}>Vize Süresi</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {['6 Ay', '2 Yıl', '5 Yıl', '10 Yıl'].map(duration => (
                      <button key={duration} onClick={() => setFormData({...formData, ukVisaDuration: duration})} style={{ padding: '12px', background: formData.ukVisaDuration === duration ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)', border: formData.ukVisaDuration === duration ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', color: formData.ukVisaDuration === duration ? '#8b5cf6' : '#94a3b8', fontWeight: '600', fontSize: '13px' }}>
                        {duration}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Konsolosluk */}
                <div>
                  <label style={labelStyle}>Konsolosluk</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['İzmir', 'Ankara', 'İstanbul'].map(city => (
                      <button key={city} onClick={() => setFormData({...formData, ukConsulate: city})} style={{ flex: 1, padding: '12px', background: formData.ukConsulate === city ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)', border: formData.ukConsulate === city ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', color: formData.ukConsulate === city ? '#3b82f6' : '#94a3b8', fontWeight: '600', fontSize: '12px' }}>
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={() => { 
                if (!formData.ukVisaType) { alert('Vize türü seçiniz'); return; } 
                if (!formData.ukVisaDuration) { alert('Vize süresi seçiniz'); return; } 
                if (!formData.ukConsulate) { alert('Konsolosluk seçiniz'); return; } 
                setStep(4); 
              }} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Devam Et →</button>
            </>
          ) : formData.visaCategory === 'russia' ? (
            /* Rusya Vizesi için özel seçimler */
            <>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>🇷🇺 Rusya Vize Türü Seçin</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '10px' }}>
                {[
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
                ].map(type => (
                  <button key={type.id} onClick={() => { setFormData({...formData, russiaVisaType: type.id}); setStep(4); }} style={{ padding: '14px', background: formData.russiaVisaType === type.id ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)', border: formData.russiaVisaType === type.id ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#e8f1f8', marginBottom: '4px' }}>{type.label}</div>
                    <div style={{ fontSize: '11px', color: '#f59e0b' }}>{type.sub}</div>
                  </button>
                ))}
              </div>
            </>
          ) : formData.visaCategory === 'uae' ? (
            /* BAE Vizesi için özel seçimler */
            <>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>🇦🇪 BAE Vize Türü Seçin</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '10px' }}>
                {[
                  { id: '14gun-tek', label: '14 Günlük BAE Vizesi', sub: 'Tek Girişli' },
                  { id: '30gun-tek', label: '30 Günlük BAE Vizesi', sub: 'Tek Girişli' },
                  { id: '30gun-cok', label: '30 Günlük BAE Vizesi', sub: 'Çok Girişli' },
                  { id: '90gun-tek', label: '90 Günlük BAE Vizesi', sub: 'Tek Girişli' },
                  { id: '90gun-cok', label: '90 Günlük BAE Vizesi', sub: 'Çok Girişli' },
                  { id: '48saat-transit', label: '48 Saatlik Transit Vize', sub: 'Transit' },
                  { id: '96saat-transit', label: '96 Saatlik Transit Vize', sub: 'Transit' },
                  { id: 'cruise', label: 'BAE Cruise Vizesi', sub: 'Cruise' },
                ].map(type => (
                  <button key={type.id} onClick={() => { setFormData({...formData, uaeVisaType: type.id}); setStep(4); }} style={{ padding: '14px', background: formData.uaeVisaType === type.id ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)', border: formData.uaeVisaType === type.id ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#e8f1f8', marginBottom: '4px' }}>{type.label}</div>
                    <div style={{ fontSize: '11px', color: '#10b981' }}>{type.sub}</div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Diğer vizeler için standart amaç seçimi */
            <>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>Vize Türü Seçin</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px' }}>
                {purposeTypes.map(purpose => (
                  <button key={purpose.id} onClick={() => selectPurpose(purpose)} style={{ background: formData.purposeType === purpose.id ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)', border: formData.purposeType === purpose.id ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px 16px', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', marginBottom: '10px' }}>{purpose.icon}</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#e8f1f8' }}>{purpose.label}</div>
                  </button>
                ))}
              </div>
            </>
          )}
            </div>
          )}
        </div>
      )}

      {/* Step 4: Müşteri Seçimi ve Detaylar */}
      {step === 4 && (
        <div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>Müşteri Bilgileri</h3>
          
          {/* Müşteri Arama */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Müşteri Ara (TC, Ad, Telefon)</label>
            <input type="text" placeholder="Müşteri ara..." value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} style={{ ...inputStyle, marginBottom: '10px' }} />
            
            {customerSearch && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', maxHeight: '200px', overflow: 'auto' }}>
                {filteredCustomers.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 10px 0' }}>Müşteri bulunamadı</p>
                    <button onClick={() => setActiveModule('customers')} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '6px', padding: '8px 16px', color: '#0c1929', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>+ Yeni Müşteri Ekle</button>
                  </div>
                ) : filteredCustomers.slice(0, 5).map(c => (
                  <div key={c.id} onClick={() => { selectCustomer(c); setCustomerSearch(''); }} style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#e8f1f8' }}>{c.firstName} {c.lastName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{c.tcKimlik} • {c.phone}</div>
                    </div>
                    <span style={{ color: '#3b82f6', fontSize: '11px' }}>Seç →</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seçili Müşteri Bilgileri */}
          {formData.customerId && (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#10b981' }}>✓ {formData.customerName}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8' }}>Müşteri seçildi</p>
                </div>
                <button onClick={() => setFormData({ ...formData, customerId: '', customerName: '', customerTc: '', customerBirthDate: '', customerPassportNo: '', customerPassportStart: '', customerPassportExpiry: '', customerPhone: '', customerEmail: '' })} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', padding: '6px 10px', color: '#94a3b8', cursor: 'pointer', fontSize: '11px' }}>Değiştir</button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>TC Kimlik No</p>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#e8f1f8', fontWeight: '500' }}>{formData.customerTc || '-'}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Doğum Tarihi</p>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#e8f1f8', fontWeight: '500' }}>{formatDate(formData.customerBirthDate) || '-'}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Pasaport No</p>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#e8f1f8', fontWeight: '500' }}>{formData.customerPassportNo || '-'}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Telefon</p>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#e8f1f8', fontWeight: '500' }}>{formData.customerPhone || '-'}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>E-posta</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#60a5fa', fontWeight: '500' }}>{formData.customerEmail || '-'}</p>
                    {formData.customerEmail && (
                      <a href={`mailto:${formData.customerEmail}`} style={{ background: 'rgba(59,130,246,0.2)', border: 'none', borderRadius: '4px', padding: '4px 8px', color: '#60a5fa', fontSize: '10px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ✉️ Gönder
                      </a>
                    )}
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Pasaport Veriliş</p>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#e8f1f8', fontWeight: '500' }}>{formatDate(formData.customerPassportStart) || '-'}</p>
                </div>
                <div style={{ gridColumn: isMobile ? '1' : 'span 2', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '10px' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Pasaport Bitiş</p>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: new Date(formData.customerPassportExpiry) <= new Date(new Date().setMonth(new Date().getMonth() + 6)) ? '#ef4444' : '#e8f1f8', fontWeight: '500' }}>{formatDate(formData.customerPassportExpiry) || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Başvuru Bilgileri */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <DateInput label="Başvuru Tarihi" value={formData.applicationDate} onChange={(v) => setFormData({...formData, applicationDate: v})} />
            <div>
              <label style={labelStyle}>İşlem</label>
              <select value={formData.islem} onChange={(e) => setFormData({...formData, islem: e.target.value})} style={selectStyle}>
                <option value="">Seçiniz</option>
                {islemFirmalari.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
              <label style={labelStyle}>Durum</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={selectStyle}>
                {visaStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Randevu Bilgileri */}
          <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>{formData.visaCategory === 'uae' ? 'Evrak Gönderim Bilgileri' : 'Randevu Bilgileri'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <DateInput label={formData.visaCategory === 'uae' ? 'Evrak Gönderilme Tarihi' : 'Randevu Tarihi'} value={formData.appointmentDate} onChange={(v) => setFormData({...formData, appointmentDate: v})} />
            {formData.visaCategory !== 'uae' && (
              <div>
                <label style={labelStyle}>Randevu Saati</label>
                <input type="text" value={formData.appointmentTime} onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})} style={inputStyle} placeholder="09:30" maxLength="5" />
              </div>
            )}
            {formData.visaCategory !== 'uae' && (
              <FormInput label="Randevu PNR" value={formData.appointmentPnr} onChange={(e) => setFormData({...formData, appointmentPnr: e.target.value.toUpperCase()})} placeholder="PNR kodu" />
            )}
            {formData.customerPhone && formData.visaCategory !== 'uae' && (
              <div style={{ gridColumn: isMobile ? '1' : 'span 3', marginTop: '8px' }}>
                <button onClick={() => {
                  const hitap = formData.customerGender === 'Erkek' ? 'Bey' : formData.customerGender === 'Kadın' ? 'Hanımefendi' : '';
                  const isim = formData.customerName?.split(' ')[0] || '';
                  const ulke = formData.visaCategory === 'usa' ? '' : formData.country || formData.schengenCountry || '';
                  const vizeTuru = formData.visaCategory === 'schengen' ? 'Schengen' : formData.visaCategory === 'usa' ? 'Amerika' : formData.visaCategory === 'uk' ? 'İngiltere' : formData.visaCategory === 'russia' ? 'Rusya' : formData.visaCategory === 'uae' ? 'BAE' : formData.visaCategory === 'china' ? 'Çin' : '';
                  const randevuStr = formData.appointmentDate ? `📅 ${formData.visaCategory === 'uae' ? 'Evrak gönderilme tarihiniz' : 'Randevu tarihiniz'}: ${formatDate(formData.appointmentDate)}${formData.appointmentTime && formData.visaCategory !== 'uae' ? ' saat ' + formData.appointmentTime : ''}${formData.appointmentPnr && formData.visaCategory !== 'uae' ? '\nPNR: ' + formData.appointmentPnr : ''}` : '';
                  const evrakTeslimStr = formData.appointmentDate && formData.visaCategory !== 'uae' ? `⏰ Evraklarınızı en geç ${formatDate(new Date(new Date(formData.appointmentDate).getTime() - 10*24*60*60*1000).toISOString().split('T')[0])} tarihine kadar hazırlayıp bize teslim etmeniz gerekmektedir.` : '';
                  const template = whatsappMesajlar[formData.visaCategory] || whatsappMesajlar.schengen;
                  const mesaj = template
                    .replace('{isim}', isim)
                    .replace('{hitap}', hitap)
                    .replace('{ulke}', ulke)
                    .replace('{vizeTuru}', vizeTuru)
                    .replace('{randevuBilgisi}', randevuStr)
                    .replace('{evrakTeslimTarihi}', evrakTeslimStr)
                    .replace(/\n\n\n+/g, '\n\n')
                    .trim();
                  const phone = formData.customerPhone.replace(/\D/g, '');
                  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(mesaj)}`, '_blank');
                }} style={{ width: '100%', padding: '10px 16px', background: 'linear-gradient(135deg, #25D366, #128C7E)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  📱 WhatsApp ile Bilgi Gönder
                </button>
              </div>
            )}
          </div>

          {/* Vize Sonuç Bilgileri */}
          <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Vize Sonuç</h4>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Sonuç</label>
              <select value={formData.visaResult} onChange={(e) => setFormData({...formData, visaResult: e.target.value})} style={selectStyle}>
                <option value="">Beklemede</option>
                <option value="Onay">✓ Onay</option>
                <option value="Red">✗ Red</option>
              </select>
            </div>
          </div>

          {/* Onay Detayları - Sadece Onay seçiliyse göster */}
          {formData.visaResult === 'Onay' && (
            <>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#10b981', borderBottom: '1px solid rgba(16,185,129,0.3)', paddingBottom: '8px' }}>✓ Vize Onay Detayları</h4>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Vize Süresi</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input type="number" value={formData.visaDuration} onChange={(e) => setFormData({...formData, visaDuration: e.target.value})} style={{ ...inputStyle, width: '70px' }} placeholder="0" />
                    <select value={formData.visaDurationType} onChange={(e) => setFormData({...formData, visaDurationType: e.target.value})} style={{ ...selectStyle, flex: 1 }}>
                      <option value="gün">Gün</option>
                      <option value="ay">Ay</option>
                      <option value="yıl">Yıl</option>
                    </select>
                  </div>
                </div>
                <DateInput label="Vize Başlangıç" value={formData.visaStartDate} onChange={(v) => setFormData({...formData, visaStartDate: v})} />
                <DateInput label="Vize Bitiş" value={formData.visaEndDate} onChange={(v) => setFormData({...formData, visaEndDate: v})} />
              </div>
            </>
          )}

          {/* Ücret */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Vize Ücreti</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <select value={formData.visaFeeCurrency} onChange={(e) => setFormData({...formData, visaFeeCurrency: e.target.value})} style={{ ...selectStyle, width: '70px', padding: '10px 8px' }}>
                  <option value="€">€ EUR</option>
                  <option value="$">$ USD</option>
                  <option value="£">£ GBP</option>
                  <option value="₺">₺ TL</option>
                </select>
                <input type="number" value={formData.visaFee} onChange={(e) => setFormData({...formData, visaFee: e.target.value})} style={{ ...inputStyle, flex: 1 }} placeholder="0" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Ödeme Durumu</label>
              <select value={formData.paymentStatus} onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})} style={selectStyle}>
                <option value="">Seçiniz</option>
                <option value="Ödendi">✓ Ödendi</option>
                <option value="Ödenmedi">✗ Ödenmedi</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Notlar</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={2} style={inputStyle} placeholder="Ek notlar..." />
          </div>

          {/* Kaydet Butonu */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep(3)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>← Geri</button>
            <button onClick={handleSave} disabled={!formData.customerId || !formData.islem} style={{ flex: 2, padding: '12px', background: (formData.customerId && formData.islem) ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: (formData.customerId && formData.islem) ? 'white' : '#64748b', fontWeight: '600', cursor: (formData.customerId && formData.islem) ? 'pointer' : 'not-allowed', fontSize: '14px' }}>Başvuruyu Kaydet</button>
          </div>
        </div>
      )}
    </div>
  );
}

function TourModule({ tours, setTours, isMobile }) {
  return (
    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🌍</div>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#10b981' }}>Tur Yönetimi</h2>
        <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Bu modül yakında aktif olacak</p>
      </div>
    </div>
  );
}

function HotelModule({ hotelReservations, setHotelReservations, customers, isMobile }) {
  return (
    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏨</div>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#8b5cf6' }}>Otel Rezervasyon</h2>
        <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Bu modül yakında aktif olacak</p>
      </div>
    </div>
  );
}

function SettingsModule({ currentUser, setCurrentUser, users, setUsers, isMobile, islemFirmalari, setIslemFirmalari, whatsappMesajlar, setWhatsappMesajlar, defaultWhatsappMesaj, musteriEtiketleri, setMusteriEtiketleri }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [saveMessage, setSaveMessage] = useState('');
  const [profileForm, setProfileForm] = useState({ name: currentUser?.name || '', email: currentUser?.email || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [newFirma, setNewFirma] = useState('');
  const [selectedWhatsappCountry, setSelectedWhatsappCountry] = useState('schengen');

  const tabs = [
    { id: 'profile', label: 'Profil', icon: '👤' },
    { id: 'password', label: 'Şifre Değiştir', icon: '🔐' },
    { id: 'users', label: 'Kullanıcılar', icon: '👥' },
    { id: 'firmalar', label: 'Firmalar', icon: '🏢' },
    { id: 'whatsapp', label: 'WhatsApp Mesajı', icon: '📱' },
    { id: 'etiketler', label: 'Etiketler', icon: '🏷️' }
  ];

  const handleProfileSave = () => {
    if (!profileForm.name || !profileForm.email) { alert('Ad ve e-posta gereklidir'); return; }
    const updatedUser = { ...currentUser, name: profileForm.name, email: profileForm.email };
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    localStorage.setItem('paydos_current_user', JSON.stringify(updatedUser));
    setSaveMessage('Profil güncellendi ✓');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const handlePasswordChange = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) { alert('Tüm alanları doldurun'); return; }
    if (passwordForm.currentPassword !== currentUser.password) { alert('Mevcut şifre hatalı'); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { alert('Yeni şifreler eşleşmiyor'); return; }
    if (passwordForm.newPassword.length < 4) { alert('Şifre en az 4 karakter olmalı'); return; }
    const updatedUser = { ...currentUser, password: passwordForm.newPassword };
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    localStorage.setItem('paydos_current_user', JSON.stringify(updatedUser));
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setSaveMessage('Şifre değiştirildi ✓');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const handleAddUser = () => {
    if (!newUserForm.name || !newUserForm.email || !newUserForm.password) { alert('Tüm alanları doldurun'); return; }
    if (users.find(u => u.email === newUserForm.email)) { alert('Bu e-posta zaten kayıtlı'); return; }
    const newUser = { id: generateUniqueId(), ...newUserForm };
    setUsers([...users, newUser]);
    setNewUserForm({ name: '', email: '', password: '', role: 'user' });
    setShowAddUser(false);
    setSaveMessage('Kullanıcı eklendi ✓');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const handleDeleteUser = (id) => {
    if (id === currentUser.id) { alert('Kendinizi silemezsiniz'); return; }
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      {saveMessage && <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '10px 16px', marginBottom: '16px', fontSize: '13px', color: '#10b981', textAlign: 'center' }}>{saveMessage}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '10px 16px', background: activeTab === tab.id ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)', border: activeTab === tab.id ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: activeTab === tab.id ? '#f59e0b' : '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === tab.id ? '600' : '400', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Profil Tab */}
      {activeTab === 'profile' && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', maxWidth: '500px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', color: '#e8f1f8' }}>👤 Profil Bilgileri</h3>
          <div style={{ display: 'grid', gap: '14px' }}>
            <FormInput label="Ad Soyad" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} />
            <FormInput label="E-posta" type="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} />
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Rol</p>
              <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#e8f1f8', fontWeight: '500' }}>{currentUser?.role === 'admin' ? '👑 Yönetici' : '👤 Kullanıcı'}</p>
            </div>
            <button onClick={handleProfileSave} style={{ padding: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '8px', color: '#0c1929', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Kaydet</button>
          </div>
        </div>
      )}

      {/* Şifre Değiştir Tab */}
      {activeTab === 'password' && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', maxWidth: '500px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', color: '#e8f1f8' }}>🔐 Şifre Değiştir</h3>
          <div style={{ display: 'grid', gap: '14px' }}>
            <FormInput label="Mevcut Şifre" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} />
            <FormInput label="Yeni Şifre" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
            <FormInput label="Yeni Şifre (Tekrar)" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} />
            <button onClick={handlePasswordChange} style={{ padding: '12px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Şifreyi Değiştir</button>
          </div>
        </div>
      )}

      {/* Kullanıcılar Tab */}
      {activeTab === 'users' && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#e8f1f8' }}>👥 Kullanıcı Yönetimi</h3>
            {currentUser?.role === 'admin' && (
              <button onClick={() => setShowAddUser(true)} style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '6px', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>+ Yeni Kullanıcı</button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', fontWeight: '600', color: '#94a3b8' }}>Ad Soyad</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', fontWeight: '600', color: '#94a3b8' }}>E-posta</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', fontWeight: '600', color: '#94a3b8' }}>Rol</th>
                {currentUser?.role === 'admin' && <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: '11px', fontWeight: '600', color: '#94a3b8' }}>İşlem</th>}
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', fontSize: '13px', fontWeight: '500' }}>{u.name} {u.id === currentUser.id && <span style={{ fontSize: '10px', color: '#f59e0b' }}>(Sen)</span>}</td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#94a3b8' }}>{u.email}</td>
                    <td style={{ padding: '12px' }}><span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', background: u.role === 'admin' ? 'rgba(245,158,11,0.2)' : 'rgba(100,116,139,0.2)', color: u.role === 'admin' ? '#f59e0b' : '#94a3b8' }}>{u.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}</span></td>
                    {currentUser?.role === 'admin' && (
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {u.id !== currentUser.id && (
                          <button onClick={() => handleDeleteUser(u.id)} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: '4px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>🗑️</button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Firmalar Tab */}
      {activeTab === 'firmalar' && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>🏢 İşlem Firmaları</h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>Vize başvurularında kullanılacak firma listesini yönetin.</p>
          
          {/* Firma Ekle */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input type="text" value={newFirma} onChange={(e) => setNewFirma(e.target.value)} placeholder="Firma adı..." style={{ flex: 1, padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e8f1f8', outline: 'none', fontSize: '13px' }} />
            <button onClick={() => { if (newFirma.trim() && !islemFirmalari.includes(newFirma.trim())) { setIslemFirmalari([...islemFirmalari, newFirma.trim()]); setNewFirma(''); setSaveMessage('Firma eklendi ✓'); setTimeout(() => setSaveMessage(''), 2000); } }} style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>+ Ekle</button>
          </div>
          
          {/* Firma Listesi */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {islemFirmalari.map((firma, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '8px 12px' }}>
                <span style={{ fontSize: '13px', color: '#f59e0b' }}>{firma}</span>
                <button onClick={() => { if (window.confirm(`"${firma}" firmasını silmek istiyor musunuz?`)) { setIslemFirmalari(islemFirmalari.filter((_, idx) => idx !== i)); setSaveMessage('Firma silindi ✓'); setTimeout(() => setSaveMessage(''), 2000); } }} style={{ background: 'rgba(239,68,68,0.2)', border: 'none', borderRadius: '4px', width: '20px', height: '20px', cursor: 'pointer', color: '#ef4444', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WhatsApp Mesaj Şablonu Tab */}
      {activeTab === 'whatsapp' && (() => {
        const ulkeler = [
          { id: 'schengen', label: '🇪🇺 Schengen' },
          { id: 'usa', label: '🇺🇸 Amerika' },
          { id: 'uk', label: '🇬🇧 İngiltere' },
          { id: 'russia', label: '🇷🇺 Rusya' },
          { id: 'uae', label: '🇦🇪 BAE' },
          { id: 'china', label: '🇨🇳 Çin' }
        ];
        return (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>📱 WhatsApp Mesaj Şablonları</h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>Her ülke için farklı WhatsApp mesaj şablonu belirleyebilirsiniz.</p>
          
          {/* Ülke Seçimi */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Ülke Seçin</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ulkeler.map(u => (
                <button key={u.id} onClick={() => setSelectedWhatsappCountry(u.id)} style={{ padding: '8px 16px', background: selectedWhatsappCountry === u.id ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255,255,255,0.05)', border: selectedWhatsappCountry === u.id ? 'none' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: selectedWhatsappCountry === u.id ? '#0c1929' : '#94a3b8', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>{u.label}</button>
              ))}
            </div>
          </div>
          
          <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
            <p style={{ fontSize: '11px', color: '#3b82f6', margin: '0 0 8px 0', fontWeight: '600' }}>Kullanılabilir Değişkenler:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['{isim}', '{hitap}', '{ulke}', '{vizeTuru}', '{randevuBilgisi}', '{evrakTeslimTarihi}'].map(v => (
                <span key={v} style={{ background: 'rgba(59,130,246,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', color: '#60a5fa' }}>{v}</span>
              ))}
            </div>
          </div>
          
          <textarea 
            value={whatsappMesajlar[selectedWhatsappCountry] || ''} 
            onChange={(e) => setWhatsappMesajlar({...whatsappMesajlar, [selectedWhatsappCountry]: e.target.value})} 
            style={{ width: '100%', minHeight: '300px', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e8f1f8', outline: 'none', fontSize: '13px', fontFamily: 'monospace', resize: 'vertical' }} 
          />
          
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button onClick={() => { setSaveMessage(`${ulkeler.find(u => u.id === selectedWhatsappCountry)?.label} mesaj şablonu kaydedildi ✓`); setTimeout(() => setSaveMessage(''), 2000); }} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>💾 Kaydet</button>
            <button onClick={() => { 
              if (window.confirm(`${ulkeler.find(u => u.id === selectedWhatsappCountry)?.label} için varsayılan mesaja dönmek istediğinizden emin misiniz?`)) {
                setWhatsappMesajlar({...whatsappMesajlar, [selectedWhatsappCountry]: defaultWhatsappMesaj});
                setSaveMessage('Varsayılan mesaja dönüldü ✓'); 
                setTimeout(() => setSaveMessage(''), 2000);
              }
            }} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#94a3b8', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>🔄 Varsayılana Dön</button>
            <button onClick={() => { 
              if (window.confirm('Tüm ülkeler için varsayılan mesaja dönmek istediğinizden emin misiniz?')) {
                setWhatsappMesajlar({ schengen: defaultWhatsappMesaj, usa: defaultWhatsappMesaj, uk: defaultWhatsappMesaj, russia: defaultWhatsappMesaj, uae: defaultWhatsappMesaj, china: defaultWhatsappMesaj });
                setSaveMessage('Tüm mesajlar varsayılana döndürüldü ✓'); 
                setTimeout(() => setSaveMessage(''), 2000);
              }
            }} style={{ padding: '10px 20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>🔄 Tümünü Sıfırla</button>
          </div>
        </div>
        );
      })()}

      {/* Etiketler Tab */}
      {activeTab === 'etiketler' && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>🏷️ Müşteri Etiketleri</h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>Müşterilere atanabilecek etiketleri yönetin. Her etiket için isim ve renk belirleyebilirsiniz.</p>
          
          {/* Yeni Etiket Ekle */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#10b981' }}>+ Yeni Etiket Ekle</h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Etiket Adı</label>
                <input type="text" id="newTagName" placeholder="Örn: Premium" style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#e8f1f8', outline: 'none', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Renk</label>
                <input type="color" id="newTagColor" defaultValue="#f59e0b" style={{ width: '50px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }} />
              </div>
              <button onClick={() => {
                const nameInput = document.getElementById('newTagName');
                const colorInput = document.getElementById('newTagColor');
                const name = nameInput.value.trim();
                const color = colorInput.value;
                if (!name) { alert('Etiket adı giriniz!'); return; }
                if (musteriEtiketleri.some(e => e.name.toLowerCase() === name.toLowerCase())) { alert('Bu etiket zaten mevcut!'); return; }
                setMusteriEtiketleri([...musteriEtiketleri, { name, color }]);
                nameInput.value = '';
                colorInput.value = '#f59e0b';
                setSaveMessage('Etiket eklendi ✓'); setTimeout(() => setSaveMessage(''), 2000);
              }} style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '6px', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>Ekle</button>
            </div>
          </div>
          
          {/* Mevcut Etiketler */}
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#94a3b8' }}>Mevcut Etiketler ({musteriEtiketleri.length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {musteriEtiketleri.map((etiket, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: etiket.color, flexShrink: 0 }} />
                  <input 
                    type="text" 
                    value={etiket.name} 
                    onChange={(e) => {
                      const newEtiketler = [...musteriEtiketleri];
                      newEtiketler[index] = { ...etiket, name: e.target.value };
                      setMusteriEtiketleri(newEtiketler);
                    }}
                    style={{ flex: 1, padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#e8f1f8', outline: 'none', fontSize: '13px' }} 
                  />
                  <input 
                    type="color" 
                    value={etiket.color} 
                    onChange={(e) => {
                      const newEtiketler = [...musteriEtiketleri];
                      newEtiketler[index] = { ...etiket, color: e.target.value };
                      setMusteriEtiketleri(newEtiketler);
                    }}
                    style={{ width: '40px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer' }} 
                  />
                  <span style={{ padding: '4px 10px', borderRadius: '12px', background: etiket.color, color: '#fff', fontSize: '11px', fontWeight: '600' }}>{etiket.name}</span>
                  <button onClick={() => {
                    if (window.confirm(`"${etiket.name}" etiketini silmek istiyor musunuz?`)) {
                      setMusteriEtiketleri(musteriEtiketleri.filter((_, i) => i !== index));
                      setSaveMessage('Etiket silindi ✓'); setTimeout(() => setSaveMessage(''), 2000);
                    }
                  }} style={{ background: 'rgba(239,68,68,0.2)', border: 'none', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer', color: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Yeni Kullanıcı Modal */}
      {showAddUser && (
        <Modal onClose={() => setShowAddUser(false)} title="Yeni Kullanıcı Ekle">
          <div style={{ display: 'grid', gap: '12px' }}>
            <FormInput label="Ad Soyad" value={newUserForm.name} onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})} />
            <FormInput label="E-posta" type="email" value={newUserForm.email} onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})} />
            <FormInput label="Şifre" type="password" value={newUserForm.password} onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})} />
            <div>
              <label style={labelStyle}>Rol</label>
              <select value={newUserForm.role} onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value})} style={selectStyle}>
                <option value="user">Kullanıcı</option>
                <option value="admin">Yönetici</option>
              </select>
            </div>
            <button onClick={handleAddUser} style={{ padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '14px', marginTop: '8px' }}>Kullanıcı Ekle</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

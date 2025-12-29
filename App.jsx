import { useState, useRef, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { supabase, toCamelCase, toSnakeCase } from './lib/supabase';

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
function StatCard({ value, label, color }) { return (<div style={{ background: `${color}15`, border: `1px solid ${color}30`, borderRadius: '10px', padding: '14px' }}><div style={{ fontSize: '22px', fontWeight: '700', color }}>{value}</div><div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{label}</div></div>); }
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
   
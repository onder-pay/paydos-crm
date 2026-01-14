// ============================================
// PAYDOS CRM - HELPER FUNCTIONS
// Tüm utility fonksiyonları
// ============================================

/**
 * E-posta validasyonu
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email) return true; // Boş kabul edilir
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * TC Kimlik validasyonu
 * @param {string} tc 
 * @returns {boolean}
 */
export const isValidTcKimlik = (tc) => {
  if (!tc) return false;
  if (tc.length !== 11) return false;
  if (!/^\d+$/.test(tc)) return false;
  if (tc[0] === '0') return false;
  return true;
};

/**
 * Telefon validasyonu (+905 ile başlamalı)
 * @param {string} phone 
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  return phone.startsWith('+905') && phone.length >= 13;
};

/**
 * Tarih formatla (YYYY-MM-DD -> DD.MM.YYYY)
 * @param {string} dateStr 
 * @returns {string}
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  if (typeof dateStr !== 'string') dateStr = String(dateStr);
  if (dateStr.includes('-')) return dateStr.split('-').reverse().join('.');
  if (dateStr.includes('.')) return dateStr;
  return dateStr;
};

/**
 * Güvenli tarih parse (timezone-safe)
 * @param {string} dateStr - YYYY-MM-DD formatında
 * @returns {Date|null}
 */
export const safeParseDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  
  const [year, month, day] = parts.map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  
  // Öğlen 12'de oluştur - timezone sorunlarını önler
  const date = new Date(year, month - 1, day, 12, 0, 0);
  
  // Tarihin geçerli olduğunu kontrol et (örn: 30 Şubat geçersiz)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  
  return date;
};

/**
 * Güvenli sayı parse (para değerleri için)
 * "80 €", "80,00", boş değer vb. handle eder
 * @param {*} val 
 * @returns {number}
 */
export const safeParseNumber = (val) => {
  if (!val) return 0;
  const cleaned = String(val).replace(/[€$£₺\s]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

/**
 * Tarihe kaç gün kaldığını hesapla
 * @param {string} dateStr - YYYY-MM-DD formatında
 * @returns {number|null}
 */
export const getDaysLeft = (dateStr) => {
  const date = safeParseDate(dateStr);
  if (!date) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  return Math.ceil((date - today) / (1000 * 60 * 60 * 24));
};

/**
 * Unique ID üret
 * @returns {number}
 */
export const generateUniqueId = () => Date.now() + Math.random();

/**
 * Aydaki gün sayısını hesapla
 * @param {string|number} month - 01-12
 * @param {string|number} year 
 * @returns {number}
 */
export const getDaysInMonth = (month, year) => {
  if (!month) return 31;
  const monthNum = parseInt(month);
  const yearNum = parseInt(year) || new Date().getFullYear();
  
  // 30 günlük aylar: 4, 6, 9, 11
  if ([4, 6, 9, 11].includes(monthNum)) return 30;
  
  // Şubat - artık yıl kontrolü
  if (monthNum === 2) {
    const isLeap = (yearNum % 4 === 0 && yearNum % 100 !== 0) || (yearNum % 400 === 0);
    return isLeap ? 29 : 28;
  }
  
  return 31;
};

/**
 * İki tarih arasındaki gün sayısı
 * @param {string} startDate 
 * @param {string} endDate 
 * @returns {number}
 */
export const calculateDaysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = safeParseDate(startDate);
  const end = safeParseDate(endDate);
  if (!start || !end) return 0;
  
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
};

/**
 * Gece sayısı hesapla (otel için)
 * @param {string} checkIn 
 * @param {string} checkOut 
 * @returns {number}
 */
export const calculateNights = (checkIn, checkOut) => {
  const nights = calculateDaysBetween(checkIn, checkOut);
  return nights > 0 ? nights : 1;
};

/**
 * Pasaport 6 ay içinde bitiyor mu?
 * @param {string} expiryDate 
 * @returns {boolean}
 */
export const isPassportExpiringSoon = (expiryDate) => {
  if (!expiryDate) return false;
  const expiry = safeParseDate(expiryDate);
  if (!expiry) return false;
  
  const sixMonthsLater = new Date();
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
  
  return expiry <= sixMonthsLater;
};

/**
 * Randevu yaklaşıyor mu? (10 gün içinde)
 * @param {string} appointmentDate 
 * @returns {boolean}
 */
export const isAppointmentSoon = (appointmentDate) => {
  const days = getDaysLeft(appointmentDate);
  return days !== null && days >= 0 && days <= 10;
};

/**
 * Komisyon hesapla
 * @param {number} total 
 * @param {Object} hotel - commissionType, commissionValue
 * @returns {number}
 */
export const calculateCommission = (total, hotel) => {
  if (!hotel || !total) return 0;
  
  if (hotel.commissionType === 'percent') {
    return parseFloat((parseFloat(total) * parseFloat(hotel.commissionValue) / 100).toFixed(2));
  }
  
  return parseFloat(hotel.commissionValue) || 0;
};

/**
 * WhatsApp mesajı için telefon numarası formatla
 * @param {string} phone 
 * @returns {string}
 */
export const formatPhoneForWhatsApp = (phone) => {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
};

/**
 * WhatsApp link oluştur
 * @param {string} phone 
 * @param {string} message 
 * @returns {string}
 */
export const createWhatsAppLink = (phone, message = '') => {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}${message ? `?text=${encodedMessage}` : ''}`;
};

/**
 * Bugünün tarihini YYYY-MM-DD formatında döndür
 * @returns {string}
 */
export const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Yıl array'i oluştur (geçmiş 100 yıl + gelecek 20 yıl)
 * @returns {string[]}
 */
export const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 120 }, (_, i) => String(currentYear - 100 + i));
};

/**
 * Gün array'i oluştur (01-31)
 * @param {number} maxDays 
 * @returns {string[]}
 */
export const generateDayOptions = (maxDays = 31) => {
  return Array.from({ length: maxDays }, (_, i) => String(i + 1).padStart(2, '0'));
};

/**
 * Objeyi snake_case'e çevir (Supabase için)
 * @param {Object} obj 
 * @returns {Object}
 */
export const toSnakeCase = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    acc[snakeKey] = obj[key];
    return acc;
  }, {});
};

/**
 * Objeyi camelCase'e çevir (JS için)
 * @param {Object|Array} data 
 * @returns {Object|Array}
 */
export const toCamelCase = (data) => {
  if (Array.isArray(data)) {
    return data.map(item => toCamelCase(item));
  }
  
  if (data !== null && typeof data === 'object') {
    return Object.keys(data).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = data[key];
      return acc;
    }, {});
  }
  
  return data;
};

/**
 * Debounce fonksiyonu
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Deep clone
 * @param {*} obj 
 * @returns {*}
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (Array.isArray(obj)) return obj.map(item => deepClone(item));
  
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = deepClone(obj[key]);
    return acc;
  }, {});
};

/**
 * Objeleri karşılaştır (shallow)
 * @param {Object} obj1 
 * @param {Object} obj2 
 * @returns {boolean}
 */
export const shallowEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every(key => obj1[key] === obj2[key]);
};

/**
 * Array'den unique değerler al
 * @param {Array} arr 
 * @param {string} key - optional, for array of objects
 * @returns {Array}
 */
export const uniqueBy = (arr, key = null) => {
  if (!Array.isArray(arr)) return [];
  
  if (key) {
    const seen = new Set();
    return arr.filter(item => {
      const val = item[key];
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
  }
  
  return [...new Set(arr)];
};

/**
 * Sayıyı para formatında göster
 * @param {number} amount 
 * @param {string} currency 
 * @returns {string}
 */
export const formatCurrency = (amount, currency = '€') => {
  if (!amount && amount !== 0) return '-';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${currency}${num.toLocaleString('tr-TR')}`;
};

/**
 * Truncate text
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Capitalize first letter
 * @param {string} str 
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Excel'den tarih parse et
 * Excel number date'leri handle eder
 * @param {*} value 
 * @returns {string} YYYY-MM-DD format
 */
export const parseExcelDate = (value) => {
  if (!value) return '';
  
  // Excel number date (days since 1900-01-01)
  if (typeof value === 'number') {
    const excelDate = new Date((value - 25569) * 86400 * 1000);
    if (!isNaN(excelDate.getTime())) {
      return excelDate.toISOString().split('T')[0];
    }
    return '';
  }
  
  const str = String(value);
  
  // DD.MM.YYYY format
  if (str.includes('.')) {
    const [day, month, year] = str.split('.');
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  // Already YYYY-MM-DD
  if (str.includes('-')) return str;
  
  return '';
};

/**
 * Local storage wrapper with error handling
 */
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  }
};

/**
 * Session storage wrapper
 */
export const sessionStore = {
  get: (key, defaultValue = null) => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from sessionStorage:`, error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing ${key} to sessionStorage:`, error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from sessionStorage:`, error);
      return false;
    }
  }
};

/**
 * Calculate days until a future date (alias for getDaysLeft)
 * @param {string} dateStr - Date string
 * @returns {number} Days until the date
 */
export const calculateDaysUntil = (dateStr) => getDaysLeft(dateStr);

/**
 * Get status color based on status string
 * @param {string} status - Status string
 * @param {string} type - Type of entity (visa, tour, hotel)
 * @returns {string} Color hex code
 */
export const getStatusColor = (status, type = 'visa') => {
  const colors = {
    // Visa statuses
    'Beklemede': '#F59E0B',
    'Randevu Alındı': '#3B82F6',
    'Onaylandı': '#10B981',
    'Reddedildi': '#EF4444',
    'İptal': '#6B7280',
    // Tour statuses
    'Planlama': '#8B5CF6',
    'Açık': '#3B82F6',
    'Devam Ediyor': '#F59E0B',
    'Tamamlandı': '#10B981',
    // Hotel statuses
    'Bekliyor': '#F59E0B',
    'Onay Bekliyor': '#F59E0B',
    // Default
    'default': '#6B7280'
  };
  return colors[status] || colors.default;
};

/**
 * Get status text/label
 * @param {string} status - Status string
 * @returns {string} Human readable status text
 */
export const getStatusText = (status) => {
  const texts = {
    'Beklemede': 'Beklemede',
    'Randevu Alındı': 'Randevu Alındı',
    'Onaylandı': 'Onaylandı',
    'Reddedildi': 'Reddedildi',
    'İptal': 'İptal Edildi',
    'Planlama': 'Planlama Aşamasında',
    'Açık': 'Kayıtlar Açık',
    'Devam Ediyor': 'Devam Ediyor',
    'Tamamlandı': 'Tamamlandı',
    'Bekliyor': 'Onay Bekliyor'
  };
  return texts[status] || status;
};

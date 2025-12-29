import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dhfxuinnpqmmulyatpgx.supabase.co'
const supabaseKey = 'sb_publishable_9WFLPj-HSV9HjjihZx8-Lw_WII8aaEM'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tarih alanlarını tespit et
const isDateField = (key) => {
  const dateKeywords = ['date', 'start', 'end', 'expiry', '_at', 'birth', 'appointment', 'check_in', 'check_out', 'created', 'updated'];
  return dateKeywords.some(k => key.toLowerCase().includes(k));
};

// Boş değerleri null'a çevir
const cleanValue = (val, key) => {
  // Boş string, undefined veya "undefined" string ise null yap
  if (val === '' || val === undefined || val === 'undefined' || val === 'null') {
    return null;
  }
  
  // Tarih alanları için özel kontrol
  if (key && isDateField(key)) {
    if (!val || val === '' || val === 'Invalid Date') {
      return null;
    }
  }
  
  return val;
};

export const toCamelCase = (obj) => {
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (obj === null || typeof obj !== 'object') return obj;
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = toCamelCase(obj[key]);
    return acc;
  }, {});
};

export const toSnakeCase = (obj) => {
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (obj === null || typeof obj !== 'object') return obj;
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    let value = obj[key];
    
    // Boş değerleri temizle
    value = cleanValue(value, snakeKey);
    
    // Nested object ise recursive çağır (ama null veya array değilse)
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      value = toSnakeCase(value);
    }
    
    acc[snakeKey] = value;
    return acc;
  }, {});
};

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dhfxuinnpqmmulyatpgx.supabase.co'
const supabaseKey = 'sb_publishable_9WFLPj-HSV9HjjihZx8-Lw_WII8aaEM'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Boş değerleri null'a çevir
const cleanValue = (val, key) => {
  // Boş string veya undefined ise null yap
  if (val === '' || val === undefined) return null;
  
  // Tarih alanları için kontrol
  if (key && (key.includes('date') || key.includes('start') || key.includes('end') || 
      key.includes('expiry') || key.includes('_at') || key.includes('birth') ||
      key.includes('appointment') || key.includes('visa_start') || key.includes('visa_end'))) {
    if (val === '' || val === null || val === undefined) return null;
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
    
    // Nested object ise recursive çağır
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      value = toSnakeCase(value);
    }
    
    acc[snakeKey] = value;
    return acc;
  }, {});
};

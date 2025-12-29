import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dhfxuinnpqmmulyatpgx.supabase.co'
const supabaseKey = 'sb_publishable_9WFLPj-HSV9HjjihZx8-Lw_WII8aaEM'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Boş stringleri null'a çevir (tarih alanları için)
const emptyToNull = (val) => {
  if (val === '' || val === undefined) return null;
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
    // Tarih alanları için boş stringleri null yap
    if (snakeKey.includes('date') || snakeKey.includes('start') || snakeKey.includes('end') || snakeKey.includes('expiry') || snakeKey.includes('_at')) {
      value = emptyToNull(value);
    }
    acc[snakeKey] = toSnakeCase(value);
    return acc;
  }, {});
};

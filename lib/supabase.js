import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dhfxuinnpqmmulyatpgx.supabase.co'
const supabaseKey = 'sb_publishable_9WFLPj-HSV9HjjihZx8-Lw_WII8aaEM'

export const supabase = createClient(supabaseUrl, supabaseKey)

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
    acc[snakeKey] = toSnakeCase(obj[key]);
    return acc;
  }, {});
};

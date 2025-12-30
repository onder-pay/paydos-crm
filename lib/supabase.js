import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dhfxuinnpqmmulyatpgx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZnh1aW5ucHFtbXVseWF0cGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MTczNzQsImV4cCI6MjA4MjM5MzM3NH0.krwrD8jgYnx7WzLvPlEF-cPveeECRdCg63qaVCr1PNI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const dateFields = ['birth_date', 'passport_start', 'passport_expiry', 'schengen_visa_start', 'schengen_visa_end', 'usa_visa_start', 'usa_visa_end', 'application_date', 'appointment_date', 'visa_start_date', 'visa_end_date', 'start_date', 'end_date', 'check_in', 'check_out', 'created_at', 'updated_at'];

export const toSnakeCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      let value = obj[key];
      if (dateFields.includes(snakeKey) && (value === '' || value === undefined)) value = null;
      if (Array.isArray(value)) {
        if (snakeKey === 'tags') value = value.join(',');
        else if (snakeKey === 'activities') value = JSON.stringify(value);
      }
      result[snakeKey] = value;
    }
  }
  return result;
};

export const toCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  const result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      let value = obj[key];
      if (dateFields.includes(key) && value === null) value = '';
      result[camelKey] = value;
    }
  }
  return result;
};

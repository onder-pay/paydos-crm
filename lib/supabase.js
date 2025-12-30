import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dhfxuinnpqmmulyatpgx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZnh1aW5ucHFtbXVseWF0cGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MTczNzQsImV4cCI6MjA4MjM5MzM3NH0.krwrD8jgYnx7WzLvPlEF-cPveeECRdCg63qaVCr1PNI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const toCamelCase = (data) => {
  if (Array.isArray(data)) return data.map(item => toCamelCase(item));
  if (data !== null && typeof data === 'object') {
    const newObj = {};
    Object.keys(data).forEach(key => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      newObj[camelKey] = toCamelCase(data[key]);
    });
    return newObj;
  }
  return data;
};

export const toSnakeCase = (data) => {
  if (Array.isArray(data)) return data.map(item => toSnakeCase(item));
  if (data !== null && typeof data === 'object') {
    const newObj = {};
    Object.keys(data).forEach(key => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      newObj[snakeKey] = toSnakeCase(data[key]);
    });
    return newObj;
  }
  return data;
};

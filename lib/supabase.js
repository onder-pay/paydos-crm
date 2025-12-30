import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qkpvlqwzljbpfpnrdqra.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcHZscXd6bGpicGZwbnJkcXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMDUwNDUsImV4cCI6MjA4MjY4MTA0NX0.HClKY_HwQKlfMWSKQt808YyEJUDwjH8chfAWkFc5RYg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Snake_case to camelCase converter
export const toCamelCase = (data) => {
  if (Array.isArray(data)) {
    return data.map(item => toCamelCase(item));
  }
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

// CamelCase to snake_case converter
export const toSnakeCase = (data) => {
  if (Array.isArray(data)) {
    return data.map(item => toSnakeCase(item));
  }
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
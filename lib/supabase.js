import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dhfxuinnpqmmulyatpgx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZnh1aW5ucHFtbXVseWF0cGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MDc2NjgsImV4cCI6MjA1MDk4MzY2OH0.xsRxSov5k4uhLemZvXpXbU4h-_jihXnirOBsLzS3E0c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =============================================
// OTP AUTH FONKSİYONLARI
// =============================================

// E-posta ile OTP kodu gönder
export const sendOTP = async (email) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false, // Sadece mevcut kullanıcılar için
      }
    });
    
    if (error) {
      // Kullanıcı yoksa farklı mesaj
      if (error.message.includes('User not found') || error.message.includes('Signups not allowed')) {
        return { success: false, error: 'Bu e-posta adresi sistemde kayıtlı değil.' };
      }
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// OTP kodunu doğrula
export const verifyOTP = async (email, token) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      type: 'email'
    });
    
    if (error) {
      if (error.message.includes('Token has expired')) {
        return { success: false, error: 'Kodun süresi dolmuş. Yeni kod isteyin.' };
      }
      if (error.message.includes('Invalid') || error.message.includes('invalid')) {
        return { success: false, error: 'Geçersiz kod. Lütfen kontrol edin.' };
      }
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// Çıkış yap
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// Mevcut oturumu kontrol et
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { success: true, session };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// =============================================
// VERİ DÖNÜŞÜM FONKSİYONLARI
// =============================================

// Tarih alanları listesi - boş string yerine null gönderilecek
const dateFields = [
  'birth_date', 'passport_start', 'passport_expiry', 
  'schengen_visa_start', 'schengen_visa_end', 
  'usa_visa_start', 'usa_visa_end',
  'application_date', 'appointment_date', 
  'visa_start_date', 'visa_end_date',
  'start_date', 'end_date',
  'check_in', 'check_out',
  'created_at', 'updated_at'
];

// camelCase to snake_case
export const toSnakeCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      let value = obj[key];
      
      // Boş tarih stringlerini null yap
      if (dateFields.includes(snakeKey) && (value === '' || value === undefined)) {
        value = null;
      }
      
      // Array'leri JSON string'e çevir (tags, activities gibi)
      if (Array.isArray(value)) {
        // tags için virgülle ayır, activities için JSON
        if (snakeKey === 'tags') {
          value = value.join(',');
        } else if (snakeKey === 'activities') {
          value = JSON.stringify(value);
        }
      }
      
      result[snakeKey] = value;
    }
  }
  return result;
};

// snake_case to camelCase
export const toCamelCase = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  
  const result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      let value = obj[key];
      
      // null tarihleri boş string yap (form için)
      if (dateFields.includes(key) && value === null) {
        value = '';
      }
      
      result[camelKey] = value;
    }
  }
  return result;
};

// ============================================
// PAYDOS CRM - SUPABASE SERVICE
// Tüm database işlemleri tek yerde
// ============================================

import { createClient } from '@supabase/supabase-js';
import { toCamelCase, toSnakeCase } from '../utils/helpers';

// Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing! Check .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// ============================================
// GENERIC CRUD OPERATIONS
// ============================================

/**
 * Generic fetch all records from a table
 * @param {string} table 
 * @param {Object} options - orderBy, ascending, filters
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const fetchAll = async (table, options = {}) => {
  try {
    let query = supabase.from(table).select('*');
    
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? false });
    }
    
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { data: toCamelCase(data || []), error: null };
  } catch (error) {
    console.error(`Error fetching from ${table}:`, error);
    return { data: [], error };
  }
};

/**
 * Generic fetch single record by ID
 * @param {string} table 
 * @param {string|number} id 
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const fetchById = async (table, id) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return { data: toCamelCase(data), error: null };
  } catch (error) {
    console.error(`Error fetching ${id} from ${table}:`, error);
    return { data: null, error };
  }
};

/**
 * Generic insert record
 * @param {string} table 
 * @param {Object} record 
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const insertRecord = async (table, record) => {
  try {
    const snakeData = toSnakeCase(record);
    delete snakeData.id; // ID auto-generated
    
    const { data, error } = await supabase
      .from(table)
      .insert([snakeData])
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: toCamelCase(data), error: null };
  } catch (error) {
    console.error(`Error inserting into ${table}:`, error);
    return { data: null, error };
  }
};

/**
 * Generic update record
 * @param {string} table 
 * @param {string|number} id 
 * @param {Object} updates 
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const updateRecord = async (table, id, updates) => {
  try {
    const snakeData = toSnakeCase({
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    const { data, error } = await supabase
      .from(table)
      .update(snakeData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: toCamelCase(data), error: null };
  } catch (error) {
    console.error(`Error updating ${id} in ${table}:`, error);
    return { data: null, error };
  }
};

/**
 * Generic delete record
 * @param {string} table 
 * @param {string|number} id 
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const deleteRecord = async (table, id) => {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting ${id} from ${table}:`, error);
    return { success: false, error };
  }
};

/**
 * Generic bulk delete records
 * @param {string} table 
 * @param {Array} ids 
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export const bulkDelete = async (table, ids) => {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .in('id', ids);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error bulk deleting from ${table}:`, error);
    return { success: false, error };
  }
};

// ============================================
// CUSTOMER OPERATIONS
// ============================================

export const customerService = {
  fetchAll: () => fetchAll('customers', { orderBy: 'created_at', ascending: false }),
  
  fetchById: (id) => fetchById('customers', id),
  
  create: async (customer) => {
    const result = await insertRecord('customers', {
      ...customer,
      tags: customer.tags || [],
      activities: customer.activities || []
    });
    return result;
  },
  
  update: async (customer) => {
    const result = await updateRecord('customers', customer.id, customer);
    return result;
  },
  
  delete: (id) => deleteRecord('customers', id),
  
  bulkDelete: (ids) => bulkDelete('customers', ids),
  
  search: async (term) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,tc_kimlik.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      return { data: toCamelCase(data || []), error: null };
    } catch (error) {
      console.error('Error searching customers:', error);
      return { data: [], error };
    }
  }
};

// ============================================
// VISA OPERATIONS
// ============================================

export const visaService = {
  fetchAll: () => fetchAll('visa_applications', { orderBy: 'created_at', ascending: false }),
  
  fetchById: (id) => fetchById('visa_applications', id),
  
  create: (visa) => insertRecord('visa_applications', visa),
  
  update: async (visa) => {
    const result = await updateRecord('visa_applications', visa.id, visa);
    return result;
  },
  
  delete: (id) => deleteRecord('visa_applications', id),
  
  fetchByCustomer: async (customerId) => {
    try {
      const { data, error } = await supabase
        .from('visa_applications')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { data: toCamelCase(data || []), error: null };
    } catch (error) {
      console.error('Error fetching customer visas:', error);
      return { data: [], error };
    }
  },
  
  fetchUpcomingAppointments: async (daysAhead = 10) => {
    try {
      const today = new Date();
      const future = new Date();
      future.setDate(future.getDate() + daysAhead);
      
      const { data, error } = await supabase
        .from('visa_applications')
        .select('*')
        .gte('appointment_date', today.toISOString().split('T')[0])
        .lte('appointment_date', future.toISOString().split('T')[0])
        .is('visa_result', null)
        .order('appointment_date', { ascending: true });
      
      if (error) throw error;
      
      return { data: toCamelCase(data || []), error: null };
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      return { data: [], error };
    }
  }
};

// ============================================
// TOUR OPERATIONS
// ============================================

export const tourService = {
  fetchAll: () => fetchAll('tours', { orderBy: 'created_at', ascending: false }),
  
  fetchById: (id) => fetchById('tours', id),
  
  create: (tour) => insertRecord('tours', tour),
  
  update: async (tour) => {
    const result = await updateRecord('tours', tour.id, tour);
    return result;
  },
  
  delete: (id) => deleteRecord('tours', id),
  
  fetchActive: async () => {
    try {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .in('status', ['Planlama', 'Açık', 'Devam Ediyor'])
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      
      return { data: toCamelCase(data || []), error: null };
    } catch (error) {
      console.error('Error fetching active tours:', error);
      return { data: [], error };
    }
  }
};

// ============================================
// HOTEL OPERATIONS
// ============================================

export const hotelService = {
  fetchAll: () => fetchAll('hotel_reservations', { orderBy: 'created_at', ascending: false }),
  
  fetchById: (id) => fetchById('hotel_reservations', id),
  
  create: (reservation) => insertRecord('hotel_reservations', reservation),
  
  update: async (reservation) => {
    const result = await updateRecord('hotel_reservations', reservation.id, reservation);
    return result;
  },
  
  delete: (id) => deleteRecord('hotel_reservations', id),
  
  fetchPending: async () => {
    try {
      const { data, error } = await supabase
        .from('hotel_reservations')
        .select('*')
        .eq('status', 'Beklemede')
        .order('check_in', { ascending: true });
      
      if (error) throw error;
      
      return { data: toCamelCase(data || []), error: null };
    } catch (error) {
      console.error('Error fetching pending reservations:', error);
      return { data: [], error };
    }
  }
};

// ============================================
// USER OPERATIONS
// ============================================

export const userService = {
  fetchAll: () => fetchAll('users'),
  
  fetchById: (id) => fetchById('users', id),
  
  create: (user) => insertRecord('users', user),
  
  update: async (user) => {
    const result = await updateRecord('users', user.id, user);
    return result;
  },
  
  delete: (id) => deleteRecord('users', id),
  
  findByEmail: async (email) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      
      return { data: data ? toCamelCase(data) : null, error: null };
    } catch (error) {
      console.error('Error finding user by email:', error);
      return { data: null, error };
    }
  }
};

// ============================================
// SETTINGS OPERATIONS
// ============================================

export const settingsService = {
  fetchAll: async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*');
      
      if (error) throw error;
      
      // Convert to key-value object
      const settings = {};
      (data || []).forEach(s => {
        settings[s.key] = s.value;
      });
      
      return { data: settings, error: null };
    } catch (error) {
      console.error('Error fetching settings:', error);
      return { data: {}, error };
    }
  },
  
  get: async (key) => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return { data: data?.value || null, error: null };
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return { data: null, error };
    }
  },
  
  set: async (key, value) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          key, 
          value, 
          updated_at: new Date().toISOString() 
        }, { 
          onConflict: 'key' 
        });
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error(`Error saving setting ${key}:`, error);
      return { success: false, error };
    }
  },
  
  delete: async (key) => {
    try {
      const { error } = await supabase
        .from('settings')
        .delete()
        .eq('key', key);
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error(`Error deleting setting ${key}:`, error);
      return { success: false, error };
    }
  }
};

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Load all initial data at once
 * @returns {Promise<Object>}
 */
export const loadAllData = async () => {
  try {
    const [
      usersRes,
      customersRes,
      visaRes,
      toursRes,
      hotelsRes,
      settingsRes
    ] = await Promise.all([
      userService.fetchAll(),
      customerService.fetchAll(),
      visaService.fetchAll(),
      tourService.fetchAll(),
      hotelService.fetchAll(),
      settingsService.fetchAll()
    ]);
    
    return {
      users: usersRes.data || [],
      customers: (customersRes.data || []).map(c => ({
        ...c,
        tags: Array.isArray(c.tags) ? c.tags : [],
        activities: Array.isArray(c.activities) ? c.activities : []
      })),
      visaApplications: visaRes.data || [],
      tours: toursRes.data || [],
      hotelReservations: hotelsRes.data || [],
      settings: settingsRes.data || {},
      error: null
    };
  } catch (error) {
    console.error('Error loading all data:', error);
    return {
      users: [],
      customers: [],
      visaApplications: [],
      tours: [],
      hotelReservations: [],
      settings: {},
      error
    };
  }
};

// ============================================
// REAL-TIME SUBSCRIPTIONS (Optional)
// ============================================

/**
 * Subscribe to table changes
 * @param {string} table 
 * @param {Function} callback 
 * @returns {Function} unsubscribe function
 */
export const subscribeToTable = (table, callback) => {
  const subscription = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(subscription);
  };
};

export default {
  supabase,
  customerService,
  visaService,
  tourService,
  hotelService,
  userService,
  settingsService,
  loadAllData,
  subscribeToTable
};

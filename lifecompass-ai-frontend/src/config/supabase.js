/**
 * Supabase Configuration for LifeCompass AI Frontend
 * Centralized configuration for Supabase client
 */

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://jcpljuhvgmzpgyywbquv.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseKey) {
  console.warn('⚠️ REACT_APP_SUPABASE_ANON_KEY not found in environment variables')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Export configuration for debugging
export const supabaseConfig = {
  url: supabaseUrl,
  hasKey: !!supabaseKey,
  keyLength: supabaseKey?.length || 0
}

// Helper function to check connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    if (error) throw error
    return { success: true, message: 'Supabase connection successful' }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

export default supabase

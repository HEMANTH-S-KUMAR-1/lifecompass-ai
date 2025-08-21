/**
 * Example usage of Supabase in LifeCompass AI
 * This file demonstrates how to use the Supabase client
 */

import { supabase, testSupabaseConnection } from '../config/supabase.js'

// Example: Authentication functions
export const authService = {
  // Sign up new user
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

// Example: Database operations
export const dbService = {
  // Get user profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Get job listings
  async getJobListings(filters = {}) {
    try {
      let query = supabase.from('job_listings').select('*')
      
      // Apply filters if provided
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }
      if (filters.jobType) {
        query = query.eq('job_type', filters.jobType)
      }
      if (filters.remote) {
        query = query.eq('remote_friendly', filters.remote)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

// Example: Real-time subscriptions
export const subscriptionService = {
  // Subscribe to job listings changes
  subscribeToJobListings(callback) {
    const subscription = supabase
      .channel('job_listings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_listings'
        },
        callback
      )
      .subscribe()
    
    return subscription
  },

  // Unsubscribe from changes
  unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  }
}

// Test connection on module load (development only)
if (process.env.NODE_ENV === 'development') {
  testSupabaseConnection().then(result => {
    if (result.success) {
      console.log('✅ Supabase connection test:', result.message)
    } else {
      console.warn('⚠️ Supabase connection test failed:', result.message)
    }
  })
}

export default { authService, dbService, subscriptionService }

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Provide fallback values for development/build time
const defaultUrl = 'https://placeholder.supabase.co'
const defaultKey = 'placeholder-key'

// Check if we're in a real deployment environment
const isRealSupabase = supabaseUrl && 
                      supabaseAnonKey && 
                      supabaseUrl !== defaultUrl && 
                      supabaseAnonKey !== defaultKey &&
                      !supabaseUrl.includes('placeholder')

if (!isRealSupabase && import.meta.env.MODE === 'production') {
  console.error('Missing or invalid Supabase configuration in production')
}

// Log the configuration for debugging (without exposing sensitive data)
console.log('Supabase configuration:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  isRealSupabase,
  urlDomain: supabaseUrl && isRealSupabase ? new URL(supabaseUrl).hostname : 'placeholder',
  mode: import.meta.env.MODE
})

export const supabase = createClient(
  supabaseUrl || defaultUrl, 
  supabaseAnonKey || defaultKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Export a function to check if Supabase is properly configured
export const isSupabaseConfigured = () => isRealSupabase

// Database types
export interface Profile {
  id: string
  email: string
  full_name: string | null
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
}
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Provide fallback values for development/build time
const defaultUrl = 'https://placeholder.supabase.co'
const defaultKey = 'placeholder-key'

if (!supabaseUrl && import.meta.env.MODE === 'production') {
  console.error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey && import.meta.env.MODE === 'production') {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

// Log the configuration for debugging (without exposing sensitive data)
console.log('Supabase configuration:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlDomain: supabaseUrl ? new URL(supabaseUrl).hostname : 'none',
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
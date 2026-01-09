import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please add them to .env.local')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

export { supabase }

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          name: string
          provider: string
          category: string
          icon: string
          start_date: string
          billing_cycle: string
          amount: number
          currency: string
          notes: string | null
          active_status: boolean
          auto_renew: boolean
          usage_count: number
          last_used: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          provider: string
          category: string
          icon?: string
          start_date: string
          billing_cycle: string
          amount: number
          currency: string
          notes?: string | null
          active_status?: boolean
          auto_renew?: boolean
          usage_count?: number
          last_used?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          provider?: string
          category?: string
          icon?: string
          start_date?: string
          billing_cycle?: string
          amount?: number
          currency?: string
          notes?: string | null
          active_status?: boolean
          auto_renew?: boolean
          usage_count?: number
          last_used?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
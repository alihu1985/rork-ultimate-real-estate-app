export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          phone: string | null
          name: string | null
          user_type: 'guest' | 'user'
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email?: string | null
          phone?: string | null
          name?: string | null
          user_type?: 'guest' | 'user'
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          phone?: string | null
          name?: string | null
          user_type?: 'guest' | 'user'
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          currency: 'USD' | 'IQD'
          type: 'apartment' | 'house' | 'villa' | 'land' | 'commercial'
          status: 'for-sale' | 'for-rent'
          latitude: number
          longitude: number
          address: string
          city: string
          neighborhood: string
          bedrooms: number
          bathrooms: number
          area: number
          parking: boolean
          elevator: boolean
          furnished: boolean
          security: boolean
          garden: boolean
          pool: boolean
          gym: boolean
          images: string[]
          owner_name: string
          owner_phone: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          currency?: 'USD' | 'IQD'
          type: 'apartment' | 'house' | 'villa' | 'land' | 'commercial'
          status: 'for-sale' | 'for-rent'
          latitude: number
          longitude: number
          address: string
          city: string
          neighborhood: string
          bedrooms: number
          bathrooms: number
          area: number
          parking?: boolean
          elevator?: boolean
          furnished?: boolean
          security?: boolean
          garden?: boolean
          pool?: boolean
          gym?: boolean
          images: string[]
          owner_name: string
          owner_phone: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          currency?: 'USD' | 'IQD'
          type?: 'apartment' | 'house' | 'villa' | 'land' | 'commercial'
          status?: 'for-sale' | 'for-rent'
          latitude?: number
          longitude?: number
          address?: string
          city?: string
          neighborhood?: string
          bedrooms?: number
          bathrooms?: number
          area?: number
          parking?: boolean
          elevator?: boolean
          furnished?: boolean
          security?: boolean
          garden?: boolean
          pool?: boolean
          gym?: boolean
          images?: string[]
          owner_name?: string
          owner_phone?: string
          created_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          tier: 'free' | 'premium' | 'pro'
          start_date: string
          end_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier: 'free' | 'premium' | 'pro'
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier?: 'free' | 'premium' | 'pro'
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_usage: {
        Row: {
          id: string
          user_id: string
          properties_added: number
          ai_searches_used: number
          phone_views_used: number
          period_start: string
          period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          properties_added?: number
          ai_searches_used?: number
          phone_views_used?: number
          period_start?: string
          period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          properties_added?: number
          ai_searches_used?: number
          phone_views_used?: number
          period_start?: string
          period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

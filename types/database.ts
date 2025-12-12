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

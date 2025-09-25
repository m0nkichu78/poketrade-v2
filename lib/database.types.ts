export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      cards: {
        Row: {
          id: string
          name: string
          set_name: string
          pack: string
          rarity: string | null
          card_number: string
          image_url: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          set_name: string
          pack: string
          rarity?: string | null
          card_number: string
          image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          set_name?: string
          pack?: string
          rarity?: string | null
          card_number?: string
          image_url?: string
          created_at?: string
        }
      }
      trade_listings: {
        Row: {
          id: number
          user_id: string
          card_id: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          card_id: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          card_id?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          in_game_name: string
          in_game_id: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          in_game_name: string
          in_game_id: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          in_game_name?: string
          in_game_id?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      wishlists: {
        Row: {
          id: number
          user_id: string
          card_id: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          card_id: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          card_id?: string
          created_at?: string
        }
      }
    }
  }
}

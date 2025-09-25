import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"
import { storageService } from "./storage-service"

// Créer un client Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type User = Database["public"]["Tables"]["users"]["Row"]
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"]

export const userService = {
  // Récupérer le profil d'un utilisateur
  async getUserProfile(userId: string): Promise<{ data: User | null; error: any }> {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      return { data, error }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return { data: null, error }
    }
  },

  // Mettre à jour le profil d'un utilisateur
  async updateUserProfile(
    userId: string,
    updates: UserUpdate,
    avatarFile?: File,
  ): Promise<{ data: User | null; error: any }> {
    try {
      // Si un fichier avatar est fourni, téléchargez-le d'abord
      if (avatarFile) {
        const avatarUrl = await storageService.uploadProfileImage(avatarFile, userId)

        if (avatarUrl) {
          updates.avatar_url = avatarUrl
        }
      }

      const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

      return { data, error }
    } catch (error) {
      console.error("Error updating user profile:", error)
      return { data: null, error }
    }
  },

  // Récupérer tous les utilisateurs
  async getAllUsers(): Promise<{ data: User[] | null; error: any }> {
    try {
      const { data, error } = await supabase.from("users").select("*").order("in_game_name")

      return { data, error }
    } catch (error) {
      console.error("Error fetching users:", error)
      return { data: null, error }
    }
  },

  // Rechercher des utilisateurs
  async searchUsers(query: string): Promise<{ data: User[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .or(`in_game_name.ilike.%${query}%,in_game_id.ilike.%${query}%`)
        .order("in_game_name")

      return { data, error }
    } catch (error) {
      console.error("Error searching users:", error)
      return { data: null, error }
    }
  },
}

import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"
import Papa from "papaparse"

// Créer un client Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export interface PokemonAvatar {
  name: string
  image_url: string
}

export const avatarService = {
  // Récupérer la liste des avatars disponibles
  async getAvatars(): Promise<PokemonAvatar[]> {
    try {
      // URL du fichier CSV
      const csvUrl =
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Feuille%20de%20calcul%20sans%20titre%20-%20Feuille%201-AuswUK3qdIQrCjeteolnfYIkb1IJUB.csv"

      // Récupérer le contenu du fichier CSV
      const response = await fetch(csvUrl)
      const csvData = await response.text()

      // Parser le CSV
      const result = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
      })

      // Convertir les données en tableau d'avatars
      const avatars = result.data as PokemonAvatar[]

      return avatars
    } catch (error) {
      console.error("Error fetching avatars:", error)
      return []
    }
  },

  // Mettre à jour l'avatar d'un utilisateur
  async updateUserAvatar(userId: string, avatarUrl: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase.from("users").update({ avatar_url: avatarUrl }).eq("id", userId)

      return { success: !error, error }
    } catch (error) {
      console.error("Error updating user avatar:", error)
      return { success: false, error }
    }
  },
}

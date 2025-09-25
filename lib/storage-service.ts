import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Créer un client Supabase pour le stockage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export const storageService = {
  // Télécharger une image
  async uploadCardImage(file: File, userId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `card-images/${fileName}`

      const { error: uploadError } = await supabase.storage.from("cards").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        throw uploadError
      }

      // Obtenir l'URL publique
      const { data } = supabase.storage.from("cards").getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      return null
    }
  },

  // Supprimer une image
  async deleteCardImage(url: string): Promise<boolean> {
    try {
      // Extraire le chemin du fichier de l'URL
      const urlObj = new URL(url)
      const pathSegments = urlObj.pathname.split("/")
      const bucketName = pathSegments[1]
      const filePath = pathSegments.slice(2).join("/")

      const { error } = await supabase.storage.from(bucketName).remove([filePath])

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error("Error deleting image:", error)
      return false
    }
  },

  // Télécharger une image de profil
  async uploadProfileImage(file: File, userId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage.from("profiles").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) {
        throw uploadError
      }

      // Obtenir l'URL publique
      const { data } = supabase.storage.from("profiles").getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Error uploading profile image:", error)
      return null
    }
  },
}

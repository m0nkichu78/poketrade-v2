import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"
import { storageService } from "./storage-service"

// Créer un client Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type Card = Database["public"]["Tables"]["cards"]["Row"]
export type CardInsert = Database["public"]["Tables"]["cards"]["Insert"]
export type CardUpdate = Database["public"]["Tables"]["cards"]["Update"]

export const cardService = {
  // Récupérer toutes les cartes
  async getAllCards(options?: {
    search?: string
    set?: string[]
    rarity?: string[]
    limit?: number
    offset?: number
  }): Promise<{ data: Card[] | null; count: number | null; error: any }> {
    try {
      let query = supabase.from("cards").select("*", { count: "exact" })

      // Appliquer les filtres
      if (options?.search) {
        query = query.ilike("name", `%${options.search}%`)
      }

      if (options?.set && options.set.length > 0) {
        query = query.in("set_name", options.set)
      }

      if (options?.rarity && options.rarity.length > 0) {
        query = query.in("rarity", options.rarity)
      }

      // Pagination
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
      }

      // Exécuter la requête
      const { data, error, count } = await query.order("name")

      return { data, count, error }
    } catch (error) {
      console.error("Error fetching cards:", error)
      return { data: null, count: null, error }
    }
  },

  // Récupérer une carte par ID
  async getCardById(id: string): Promise<{ data: Card | null; error: any }> {
    try {
      const { data, error } = await supabase.from("cards").select("*").eq("id", id).single()

      return { data, error }
    } catch (error) {
      console.error("Error fetching card:", error)
      return { data: null, error }
    }
  },

  // Créer une nouvelle carte
  async createCard(card: CardInsert, imageFile?: File): Promise<{ data: Card | null; error: any }> {
    try {
      // Si un fichier image est fourni, téléchargez-le d'abord
      if (imageFile) {
        const userId = "admin" // Utilisez l'ID de l'utilisateur réel si disponible
        const imageUrl = await storageService.uploadCardImage(imageFile, userId)

        if (imageUrl) {
          card.image_url = imageUrl
        }
      }

      const { data, error } = await supabase.from("cards").insert(card).select().single()

      return { data, error }
    } catch (error) {
      console.error("Error creating card:", error)
      return { data: null, error }
    }
  },

  // Mettre à jour une carte
  async updateCard(id: string, updates: CardUpdate, imageFile?: File): Promise<{ data: Card | null; error: any }> {
    try {
      // Si un fichier image est fourni, téléchargez-le d'abord
      if (imageFile) {
        const userId = "admin" // Utilisez l'ID de l'utilisateur réel si disponible
        const imageUrl = await storageService.uploadCardImage(imageFile, userId)

        if (imageUrl) {
          // Si la carte a déjà une image, supprimez-la
          const { data: existingCard } = await this.getCardById(id)
          if (existingCard?.image_url) {
            await storageService.deleteCardImage(existingCard.image_url)
          }

          updates.image_url = imageUrl
        }
      }

      const { data, error } = await supabase.from("cards").update(updates).eq("id", id).select().single()

      return { data, error }
    } catch (error) {
      console.error("Error updating card:", error)
      return { data: null, error }
    }
  },

  // Supprimer une carte
  async deleteCard(id: string): Promise<{ success: boolean; error: any }> {
    try {
      // Récupérer d'abord la carte pour obtenir l'URL de l'image
      const { data: card } = await this.getCardById(id)

      // Supprimer l'image si elle existe
      if (card?.image_url) {
        await storageService.deleteCardImage(card.image_url)
      }

      const { error } = await supabase.from("cards").delete().eq("id", id)

      return { success: !error, error }
    } catch (error) {
      console.error("Error deleting card:", error)
      return { success: false, error }
    }
  },

  // Obtenir les ensembles uniques
  async getUniqueSets(): Promise<{ data: string[] | null; error: any }> {
    try {
      const { data, error } = await supabase.from("cards").select("set_name").order("set_name")

      if (data) {
        const uniqueSets = [...new Set(data.map((card) => card.set_name))]
        return { data: uniqueSets, error }
      }

      return { data: null, error }
    } catch (error) {
      console.error("Error fetching sets:", error)
      return { data: null, error }
    }
  },

  // Obtenir les raretés uniques
  async getUniqueRarities(): Promise<{ data: string[] | null; error: any }> {
    try {
      const { data, error } = await supabase.from("cards").select("rarity").order("rarity")

      if (data) {
        const uniqueRarities = [...new Set(data.map((card) => card.rarity).filter(Boolean))]
        return { data: uniqueRarities, error }
      }

      return { data: null, error }
    } catch (error) {
      console.error("Error fetching rarities:", error)
      return { data: null, error }
    }
  },
}

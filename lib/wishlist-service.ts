import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"
import { activityService } from "./activity-service"

// Créer un client Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type Wishlist = Database["public"]["Tables"]["wishlists"]["Row"]
export type WishlistInsert = Database["public"]["Tables"]["wishlists"]["Insert"]

export const wishlistService = {
  // Récupérer la liste de souhaits d'un utilisateur
  async getUserWishlist(userId: string): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("wishlists")
        .select(`
          id,
          card:cards(*)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      return { data, error }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
      return { data: null, error }
    }
  },

  // Ajouter une carte à la liste de souhaits
  async addCardToWishlist(userId: string, cardId: string): Promise<{ data: Wishlist | null; error: any }> {
    try {
      // Vérifier si la carte est déjà dans la liste de souhaits
      const { data: existingWishlist } = await supabase
        .from("wishlists")
        .select()
        .eq("user_id", userId)
        .eq("card_id", cardId)
        .maybeSingle()

      if (existingWishlist) {
        return { data: existingWishlist, error: null }
      }

      // Ajouter la carte à la liste de souhaits
      const { data, error } = await supabase
        .from("wishlists")
        .insert({
          user_id: userId,
          card_id: cardId,
        })
        .select()
        .single()

      if (!error) {
        // Récupérer les informations de la carte pour l'activité
        const { data: cardData } = await supabase.from("cards").select("name").eq("id", cardId).single()

        // Récupérer les informations de l'utilisateur
        const { data: userData } = await supabase.from("users").select("in_game_name").eq("id", userId).single()

        const userName = userData?.in_game_name || "Dresseur"
        const cardName = cardData?.name || "une carte"

        // Créer une activité
        await activityService.createActivity({
          user_id: userId,
          type: "wishlist_add",
          content: `${userName} a ajouté ${cardName} à sa liste de souhaits`,
          metadata: { card_id: cardId },
        })
      }

      return { data, error }
    } catch (error) {
      console.error("Error adding card to wishlist:", error)
      return { data: null, error }
    }
  },

  // Supprimer une carte de la liste de souhaits
  async removeCardFromWishlist(userId: string, cardId: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase.from("wishlists").delete().eq("user_id", userId).eq("card_id", cardId)

      return { success: !error, error }
    } catch (error) {
      console.error("Error removing card from wishlist:", error)
      return { success: false, error }
    }
  },

  // Supprimer un élément de la liste de souhaits par ID
  async deleteWishlistItemById(id: number): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase.from("wishlists").delete().eq("id", id)

      return { success: !error, error }
    } catch (error) {
      console.error("Error deleting wishlist item:", error)
      return { success: false, error }
    }
  },

  // Vérifier si une carte est dans la liste de souhaits
  async isCardInWishlist(userId: string, cardId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", userId)
        .eq("card_id", cardId)
        .single()

      return !!data
    } catch (error) {
      console.error("Error checking wishlist:", error)
      return false
    }
  },
}

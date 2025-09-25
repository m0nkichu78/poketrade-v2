import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"
import { activityService } from "./activity-service"

// Créer un client Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type TradeListing = Database["public"]["Tables"]["trade_listings"]["Row"]
export type TradeListingInsert = Database["public"]["Tables"]["trade_listings"]["Insert"]

export const tradeService = {
  // Récupérer les listes d'échange d'un utilisateur
  async getUserTradeListings(userId: string): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("trade_listings")
        .select(`
          id,
          card:cards(*)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      return { data, error }
    } catch (error) {
      console.error("Error fetching trade listings:", error)
      return { data: null, error }
    }
  },

  // Ajouter une carte à la liste d'échange
  async addCardToTrade(userId: string, cardId: string): Promise<{ data: TradeListing | null; error: any }> {
    try {
      // Vérifier si la carte est déjà dans la liste d'échange
      const { data: existingListing } = await supabase
        .from("trade_listings")
        .select()
        .eq("user_id", userId)
        .eq("card_id", cardId)
        .maybeSingle()

      if (existingListing) {
        return { data: existingListing, error: null }
      }

      // Ajouter la carte à la liste d'échange
      const { data, error } = await supabase
        .from("trade_listings")
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
          type: "tradelist_add",
          content: `${userName} a ajouté ${cardName} à sa liste d'échange`,
          metadata: { card_id: cardId },
        })
      }

      return { data, error }
    } catch (error) {
      console.error("Error adding card to trade:", error)
      return { data: null, error }
    }
  },

  // Supprimer une carte de la liste d'échange
  async removeCardFromTrade(userId: string, cardId: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase.from("trade_listings").delete().eq("user_id", userId).eq("card_id", cardId)

      return { success: !error, error }
    } catch (error) {
      console.error("Error removing card from trade:", error)
      return { success: false, error }
    }
  },

  // Supprimer une liste d'échange par ID
  async deleteTradeListingById(id: number): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase.from("trade_listings").delete().eq("id", id)

      return { success: !error, error }
    } catch (error) {
      console.error("Error deleting trade listing:", error)
      return { success: false, error }
    }
  },

  // Version simplifiée pour trouver des correspondances d'échange
  async findTradeMatches(userId: string): Promise<{
    perfectMatches: any[]
    theyHaveWhatIWant: any[]
    theyWantWhatIHave: any[]
    error: any
  }> {
    try {
      // Récupérer la liste de souhaits de l'utilisateur
      const { data: myWishlist, error: wishlistError } = await supabase
        .from("wishlists")
        .select("card_id")
        .eq("user_id", userId)

      if (wishlistError) {
        console.error("Error fetching wishlist:", wishlistError)
        return { perfectMatches: [], theyHaveWhatIWant: [], theyWantWhatIHave: [], error: wishlistError }
      }

      // Récupérer les listes d'échange de l'utilisateur
      const { data: myTradeListings, error: tradeError } = await supabase
        .from("trade_listings")
        .select("card_id")
        .eq("user_id", userId)

      if (tradeError) {
        console.error("Error fetching trade listings:", tradeError)
        return { perfectMatches: [], theyHaveWhatIWant: [], theyWantWhatIHave: [], error: tradeError }
      }

      const myWishlistCardIds = myWishlist?.map((item) => item.card_id) || []
      const myTradeCardIds = myTradeListings?.map((item) => item.card_id) || []

      // Si l'utilisateur n'a ni wishlist ni trade listings
      if (myWishlistCardIds.length === 0 && myTradeCardIds.length === 0) {
        return {
          perfectMatches: [],
          theyHaveWhatIWant: [],
          theyWantWhatIHave: [],
          error: null,
        }
      }

      // Récupérer tous les autres utilisateurs avec leurs données
      const { data: otherUsersData, error: usersError } = await supabase
        .from("users")
        .select(`
          id,
          in_game_name,
          in_game_id,
          trade_listings!inner (
            id,
            card_id,
            cards (
              id,
              name,
              set_name,
              rarity,
              image_url
            )
          ),
          wishlists!inner (
            id,
            card_id,
            cards (
              id,
              name,
              set_name,
              rarity,
              image_url
            )
          )
        `)
        .neq("id", userId)

      if (usersError) {
        console.error("Error fetching other users:", usersError)
        return { perfectMatches: [], theyHaveWhatIWant: [], theyWantWhatIHave: [], error: usersError }
      }

      const perfectMatches: any[] = []
      const theyHaveWhatIWant: any[] = []
      const theyWantWhatIHave: any[] = []

      // Traiter chaque utilisateur
      otherUsersData?.forEach((user) => {
        const userInfo = {
          id: user.id,
          in_game_name: user.in_game_name || "",
          in_game_id: user.in_game_id || "",
        }

        // Cartes qu'ils ont et que je veux
        const cardsTheyHaveThatIWant =
          user.trade_listings
            ?.filter((listing) => myWishlistCardIds.includes(listing.card_id))
            .map((listing) => ({
              id: listing.id,
              card: listing.cards,
            })) || []

        // Cartes qu'ils veulent et que j'ai
        const cardsTheyWantThatIHave =
          user.wishlists
            ?.filter((wishlist) => myTradeCardIds.includes(wishlist.card_id))
            .map((wishlist) => ({
              id: wishlist.id,
              card: wishlist.cards,
            })) || []

        // Ajouter aux listes appropriées
        if (cardsTheyHaveThatIWant.length > 0) {
          theyHaveWhatIWant.push({
            user: userInfo,
            cards: cardsTheyHaveThatIWant,
          })
        }

        if (cardsTheyWantThatIHave.length > 0) {
          theyWantWhatIHave.push({
            user: userInfo,
            cards: cardsTheyWantThatIHave,
          })
        }

        // Si c'est une correspondance parfaite
        if (cardsTheyHaveThatIWant.length > 0 && cardsTheyWantThatIHave.length > 0) {
          perfectMatches.push({
            user: userInfo,
            theyHave: cardsTheyHaveThatIWant,
            theyWant: cardsTheyWantThatIHave,
          })
        }
      })

      return {
        perfectMatches,
        theyHaveWhatIWant,
        theyWantWhatIHave,
        error: null,
      }
    } catch (error) {
      console.error("Error finding trade matches:", error)
      return {
        perfectMatches: [],
        theyHaveWhatIWant: [],
        theyWantWhatIHave: [],
        error,
      }
    }
  },

  // Fonction utilitaire pour regrouper les cartes par utilisateur
  groupCardsByUser(cards: any[]): Record<string, any> {
    const groupedCards: Record<string, any> = {}

    cards.forEach((item) => {
      const userId = item.user_id
      if (!groupedCards[userId]) {
        groupedCards[userId] = {
          user: item.users,
          cards: [],
        }
      }
      groupedCards[userId].cards.push({
        id: item.id,
        card: item.cards,
      })
    })

    return groupedCards
  },
}

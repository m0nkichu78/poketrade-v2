"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, ListPlus, Info, Loader2, Check } from "lucide-react"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { Database } from "@/lib/database.types"

type CardType = Database["public"]["Tables"]["cards"]["Row"]

export function CardGrid({ cards }: { cards: CardType[] }) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({})
  const [addedToTrade, setAddedToTrade] = useState<Record<string, boolean>>({})
  const [addedToWishlist, setAddedToWishlist] = useState<Record<string, boolean>>({})
  const [user, setUser] = useState<any>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user || null)
      setIsCheckingAuth(false)
    }
    checkAuth()
  }, [supabase])

  const toggleCardSelection = (cardId: string) => {
    setSelectedCards((prev) => (prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]))
  }

  const selectAllCards = () => {
    if (selectedCards.length === cards.length) {
      setSelectedCards([])
    } else {
      setSelectedCards(cards.map((card) => card.id))
    }
  }

  const handleCardClick = (cardId: string) => {
    if (selectedCards.length > 0) {
      toggleCardSelection(cardId)
    } else {
      setActiveCardId(activeCardId === cardId ? null : cardId)
    }
  }

  const addToTrade = async (cardId: string) => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour ajouter des cartes à votre liste d'échange",
        variant: "destructive",
      })
      return
    }

    setIsProcessing((prev) => ({ ...prev, [cardId]: true }))

    try {
      // Check if already in trade list
      const { data: existingTrade } = await supabase
        .from("trade_listings")
        .select()
        .eq("user_id", user.id)
        .eq("card_id", cardId)
        .single()

      if (existingTrade) {
        // Remove from trade list
        const { error } = await supabase.from("trade_listings").delete().eq("user_id", user.id).eq("card_id", cardId)

        if (error) throw error

        setAddedToTrade((prev) => ({ ...prev, [cardId]: false }))
        toast({
          title: "Retiré des échanges",
          description: "Carte retirée de vos échanges",
        })
      } else {
        // Add to trade list
        const { error } = await supabase.from("trade_listings").insert({
          user_id: user.id,
          card_id: cardId,
        })

        if (error) throw error

        setAddedToTrade((prev) => ({ ...prev, [cardId]: true }))
        toast({
          title: "Ajouté aux échanges",
          description: "Carte ajoutée à vos échanges",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update trade list",
        variant: "destructive",
      })
    } finally {
      setIsProcessing((prev) => ({ ...prev, [cardId]: false }))
    }
  }

  const addToWishlist = async (cardId: string) => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour ajouter des cartes à votre liste de souhaits",
        variant: "destructive",
      })
      return
    }

    setIsProcessing((prev) => ({ ...prev, [cardId]: true }))

    try {
      // Check if already in wishlist
      const { data: existingWishlist } = await supabase
        .from("wishlists")
        .select()
        .eq("user_id", user.id)
        .eq("card_id", cardId)
        .single()

      if (existingWishlist) {
        // Remove from wishlist
        const { error } = await supabase.from("wishlists").delete().eq("user_id", user.id).eq("card_id", cardId)

        if (error) throw error

        setAddedToWishlist((prev) => ({ ...prev, [cardId]: false }))
        toast({
          title: "Retiré de la liste",
          description: "Carte retirée de votre liste de souhaits",
        })
      } else {
        // Add to wishlist
        const { error } = await supabase.from("wishlists").insert({
          user_id: user.id,
          card_id: cardId,
        })

        if (error) throw error

        setAddedToWishlist((prev) => ({ ...prev, [cardId]: true }))
        toast({
          title: "Ajouté à la liste",
          description: "Carte ajoutée à votre liste de souhaits",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist",
        variant: "destructive",
      })
    } finally {
      setIsProcessing((prev) => ({ ...prev, [cardId]: false }))
    }
  }

  const batchAddToTrade = async () => {
    if (!user || selectedCards.length === 0) return

    setIsProcessing((prev) => {
      const newState = { ...prev }
      selectedCards.forEach((id) => {
        newState[id] = true
      })
      return newState
    })

    try {
      // Get existing trade listings for selected cards
      const { data: existingTrades } = await supabase
        .from("trade_listings")
        .select("card_id")
        .eq("user_id", user.id)
        .in("card_id", selectedCards)

      const existingCardIds = existingTrades?.map((t) => t.card_id) || []
      const cardsToAdd = selectedCards.filter((id) => !existingCardIds.includes(id))

      if (cardsToAdd.length > 0) {
        // Add new cards to trade listings
        const { error } = await supabase.from("trade_listings").insert(
          cardsToAdd.map((cardId) => ({
            user_id: user.id,
            card_id: cardId,
          })),
        )

        if (error) throw error
      }

      setAddedToTrade((prev) => {
        const newState = { ...prev }
        cardsToAdd.forEach((id) => {
          newState[id] = true
        })
        return newState
      })

      toast({
        title: "Ajouté aux échanges",
        description: `${cardsToAdd.length} cartes ajoutées à vos échanges`,
      })

      // Clear selection after successful operation
      setSelectedCards([])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update trade listings",
        variant: "destructive",
      })
    } finally {
      setIsProcessing((prev) => {
        const newState = { ...prev }
        selectedCards.forEach((id) => {
          newState[id] = false
        })
        return newState
      })
    }
  }

  const batchAddToWishlist = async () => {
    if (!user || selectedCards.length === 0) return

    setIsProcessing((prev) => {
      const newState = { ...prev }
      selectedCards.forEach((id) => {
        newState[id] = true
      })
      return newState
    })

    try {
      // Get existing wishlist items for selected cards
      const { data: existingWishlist } = await supabase
        .from("wishlists")
        .select("card_id")
        .eq("user_id", user.id)
        .in("card_id", selectedCards)

      const existingCardIds = existingWishlist?.map((w) => w.card_id) || []
      const cardsToAdd = selectedCards.filter((id) => !existingCardIds.includes(id))

      if (cardsToAdd.length > 0) {
        // Add new cards to wishlist
        const { error } = await supabase.from("wishlists").insert(
          cardsToAdd.map((cardId) => ({
            user_id: user.id,
            card_id: cardId,
          })),
        )

        if (error) throw error
      }

      setAddedToWishlist((prev) => {
        const newState = { ...prev }
        cardsToAdd.forEach((id) => {
          newState[id] = true
        })
        return newState
      })

      toast({
        title: "Ajouté à la liste",
        description: `${cardsToAdd.length} cartes ajoutées à votre liste de souhaits`,
      })

      // Clear selection after successful operation
      setSelectedCards([])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist",
        variant: "destructive",
      })
    } finally {
      setIsProcessing((prev) => {
        const newState = { ...prev }
        selectedCards.forEach((id) => {
          newState[id] = false
        })
        return newState
      })
    }
  }

  // Load trade and wishlist status for cards when user is logged in
  useEffect(() => {
    if (!user) return

    const loadCardStatuses = async () => {
      // Get trade listings
      const { data: tradeListings } = await supabase
        .from("trade_listings")
        .select("card_id")
        .eq("user_id", user.id)
        .in(
          "card_id",
          cards.map((card) => card.id),
        )

      // Get wishlist items
      const { data: wishlistItems } = await supabase
        .from("wishlists")
        .select("card_id")
        .eq("user_id", user.id)
        .in(
          "card_id",
          cards.map((card) => card.id),
        )

      const tradeMap: Record<string, boolean> = {}
      const wishlistMap: Record<string, boolean> = {}

      tradeListings?.forEach((item) => {
        tradeMap[item.card_id] = true
      })
      wishlistItems?.forEach((item) => {
        wishlistMap[item.card_id] = true
      })

      setAddedToTrade(tradeMap)
      setAddedToWishlist(wishlistMap)
    }

    loadCardStatuses()
  }, [user, supabase, cards])

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium">Aucune carte trouvée</h3>
        <p className="text-muted-foreground mt-2">Essayez d'ajuster votre recherche ou vos filtres</p>
      </div>
    )
  }

  return (
    <>
      {/* Batch selection controls */}
      {user && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedCards.length > 0 && selectedCards.length === cards.length}
              onCheckedChange={selectAllCards}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {selectedCards.length === 0
                ? "Tout Sélectionner"
                : selectedCards.length === cards.length
                  ? "Tout Désélectionner"
                  : `${selectedCards.length} cartes sélectionnées`}
            </label>
          </div>
        </div>
      )}

      {/* Batch action bar */}
      {selectedCards.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-background border rounded-lg shadow-lg p-4 flex gap-4">
          <Button onClick={batchAddToTrade} disabled={Object.values(isProcessing).some(Boolean)}>
            <ListPlus className="mr-2 h-4 w-4" />
            Ajouter {selectedCards.length} aux Échanges
          </Button>
          <Button onClick={batchAddToWishlist} disabled={Object.values(isProcessing).some(Boolean)}>
            <Heart className="mr-2 h-4 w-4" />
            Ajouter {selectedCards.length} à la Liste
          </Button>
          <Button variant="outline" onClick={() => setSelectedCards([])}>
            Annuler
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <Card
            key={card.id}
            className={`overflow-hidden transition-all hover:shadow-md relative card-hover-effect ${selectedCards.includes(card.id) ? "ring-2 ring-primary" : ""}`}
          >
            <CardContent className="p-2 relative">
              {user && (
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedCards.includes(card.id)}
                    onCheckedChange={() => toggleCardSelection(card.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-background/80"
                  />
                </div>
              )}

              <div
                className="relative cursor-pointer"
                onClick={() => handleCardClick(card.id)}
                style={{
                  // Standard Pokémon card ratio is approximately 2.5:3.5 (or 5:7)
                  paddingBottom: "140%", // This creates a 5:7 aspect ratio container
                }}
              >
                <Image
                  src={card.image_url || "/placeholder.svg?height=350&width=250"}
                  alt={card.name}
                  fill
                  className="object-contain rounded"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />

                {/* Action buttons overlay */}
                {activeCardId === card.id && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 p-2 rounded">
                    {user && (
                      <>
                        <Button
                          size="sm"
                          className="w-full text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            addToTrade(card.id)
                          }}
                          disabled={isProcessing[card.id]}
                          variant={addedToTrade[card.id] ? "outline" : "default"}
                        >
                          {isProcessing[card.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : addedToTrade[card.id] ? (
                            <>
                              <Check className="mr-1 h-4 w-4" />
                              Retirer
                            </>
                          ) : (
                            <>
                              <ListPlus className="mr-1 h-4 w-4" />
                              Ajouter
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          className="w-full text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            addToWishlist(card.id)
                          }}
                          disabled={isProcessing[card.id]}
                          variant={addedToWishlist[card.id] ? "default" : "outline"}
                        >
                          {isProcessing[card.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Heart
                                className="mr-1 h-4 w-4"
                                fill={addedToWishlist[card.id] ? "currentColor" : "none"}
                              />
                              {addedToWishlist[card.id] ? "Retirer" : "Souhaiter"}
                            </>
                          )}
                        </Button>
                      </>
                    )}

                    <Button
                      size="sm"
                      className="w-full text-xs"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/cards/${card.id}`)
                      }}
                    >
                      <Info className="mr-1 h-4 w-4" />
                      Détails
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-2 text-sm font-medium truncate">{card.name}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge variant="outline" className="text-xs">
                  {card.set_name}
                </Badge>
                {card.rarity && (
                  <Badge variant="secondary" className="text-xs">
                    {card.rarity}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}

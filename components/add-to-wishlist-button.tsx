"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { Heart, Loader2 } from "lucide-react"

export function AddToWishlistButton({ cardId, userId }: { cardId: string; userId: string }) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [isAdded, setIsAdded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    const checkIfAdded = async () => {
      const { data } = await supabase.from("wishlists").select().eq("user_id", userId).eq("card_id", cardId).single()

      setIsAdded(!!data)
      setIsLoading(false)
    }

    checkIfAdded()
  }, [supabase, userId, cardId])

  const handleAddToWishlist = async () => {
    if (isAdded) {
      setIsAdding(true)
      try {
        const { error } = await supabase.from("wishlists").delete().eq("user_id", userId).eq("card_id", cardId)

        if (error) throw error

        setIsAdded(false)
        toast({
          title: "Retiré de la liste",
          description: "Carte retirée de votre liste de souhaits",
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to remove card",
          variant: "destructive",
        })
      } finally {
        setIsAdding(false)
      }
    } else {
      setIsAdding(true)
      try {
        const { error } = await supabase.from("wishlists").insert({
          user_id: userId,
          card_id: cardId,
        })

        if (error) throw error

        setIsAdded(true)
        toast({
          title: "Ajouté à la liste",
          description: "Carte ajoutée à votre liste de souhaits",
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to add card",
          variant: "destructive",
        })
      } finally {
        setIsAdding(false)
      }
    }
  }

  if (isLoading) {
    return (
      <Button disabled variant="outline">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Chargement...
      </Button>
    )
  }

  return (
    <Button onClick={handleAddToWishlist} disabled={isAdding} variant={isAdded ? "default" : "outline"}>
      {isAdding ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Heart className="mr-2 h-4 w-4" fill={isAdded ? "currentColor" : "none"} />
      )}
      {isAdded ? "Retirer de la Liste" : "Ajouter à la Liste"}
    </Button>
  )
}

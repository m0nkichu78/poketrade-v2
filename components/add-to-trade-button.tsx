"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { ListPlus, Check, Loader2 } from "lucide-react"

export function AddToTradeButton({ cardId, userId }: { cardId: string; userId: string }) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [isAdded, setIsAdded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    const checkIfAdded = async () => {
      const { data } = await supabase
        .from("trade_listings")
        .select()
        .eq("user_id", userId)
        .eq("card_id", cardId)
        .single()

      setIsAdded(!!data)
      setIsLoading(false)
    }

    checkIfAdded()
  }, [supabase, userId, cardId])

  const handleAddToTrade = async () => {
    if (isAdded) {
      setIsAdding(true)
      try {
        const { error } = await supabase.from("trade_listings").delete().eq("user_id", userId).eq("card_id", cardId)

        if (error) throw error

        setIsAdded(false)
        toast({
          title: "Retiré des échanges",
          description: "Carte retirée de vos échanges",
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
        const { error } = await supabase.from("trade_listings").insert({
          user_id: userId,
          card_id: cardId,
        })

        if (error) throw error

        setIsAdded(true)
        toast({
          title: "Ajouté aux échanges",
          description: "Carte ajoutée à vos échanges",
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
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Chargement...
      </Button>
    )
  }

  return (
    <Button onClick={handleAddToTrade} disabled={isAdding} variant={isAdded ? "outline" : "default"}>
      {isAdding ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isAdded ? (
        <Check className="mr-2 h-4 w-4" />
      ) : (
        <ListPlus className="mr-2 h-4 w-4" />
      )}
      {isAdded ? "Retirer des Échanges" : "Ajouter aux Échanges"}
    </Button>
  )
}

"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type CardWithId = {
  id: number
  card: {
    id: string
    name: string
    set_name: string
    pack: string
    rarity: string | null
    card_number: string
    image_url: string
  }
}

export function WishlistCardList({
  cards,
  emptyMessage,
  emptyAction,
}: {
  cards: CardWithId[]
  emptyMessage: string
  emptyAction: React.ReactNode
}) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [cardList, setCardList] = useState(cards)

  const handleRemove = async (id: number) => {
    setDeletingId(id)
    try {
      const { error } = await supabase.from("wishlists").delete().eq("id", id)

      if (error) throw error

      setCardList(cardList.filter((item) => item.id !== id))
      toast({
        title: "Carte retirée",
        description: "Carte retirée de votre liste de souhaits",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Échec de la suppression de la carte",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (cardList.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">{emptyMessage}</p>
        {emptyAction}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {cardList.map(({ id, card }) => (
        <Card key={id} className="overflow-hidden group relative card-hover-effect">
          <Link href={`/cards/${card.id}`}>
            <CardContent className="p-2">
              <div
                className="relative"
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
          </Link>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleRemove(id)}
            disabled={deletingId === id}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </Card>
      ))}
    </div>
  )
}

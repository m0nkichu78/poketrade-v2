import { createServerSupabaseClient } from "@/lib/supabase-server"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { AddToTradeButton } from "@/components/add-to-trade-button"
import { AddToWishlistButton } from "@/components/add-to-wishlist-button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

export default async function CardPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()

  const { data: card } = await supabase.from("cards").select("*").eq("id", params.id).single()

  if (!card) {
    notFound()
  }

  // Get session to check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <a href="/cards" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour aux cartes
          </a>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="relative" style={{ paddingBottom: "140%" }}>
          <Image
            src={card.image_url || "/placeholder.svg?height=600&width=400"}
            alt={card.name}
            fill
            className="object-contain rounded-lg"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{card.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">{card.set_name}</Badge>
              <Badge variant="outline">{card.pack}</Badge>
              {card.rarity && <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{card.rarity}</Badge>}
              <Badge variant="secondary">{card.card_number}</Badge>
            </div>
          </div>

          {session ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <AddToTradeButton cardId={card.id} userId={session.user.id} />
              <AddToWishlistButton cardId={card.id} userId={session.user.id} />
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm mb-2">
                Connectez-vous pour ajouter cette carte à votre liste d'échange ou liste de souhaits
              </p>
              <Button asChild size="sm">
                <a href="/login">Se Connecter</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

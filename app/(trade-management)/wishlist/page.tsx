import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { WishlistCardList } from "@/components/wishlist-card-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function WishlistPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: wishlistItems } = await supabase
    .from("wishlists")
    .select("id, card:cards(*)")
    .eq("user_id", session.user.id)
    .order("card_id", { ascending: true })

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Ma Liste de Souhaits</h1>
          <p className="text-muted-foreground">Cartes que vous cherchez à ajouter à votre collection</p>
        </div>
        <Button asChild>
          <Link href="/cards">Ajouter Plus de Cartes</Link>
        </Button>
      </div>

      <WishlistCardList
        cards={
          wishlistItems?.map((item) => ({
            id: item.id,
            card: item.card,
          })) || []
        }
        emptyMessage="Vous n'avez pas encore de cartes dans votre liste de souhaits."
        emptyAction={
          <Button asChild>
            <Link href="/cards">Parcourir les Cartes</Link>
          </Button>
        }
      />
    </>
  )
}

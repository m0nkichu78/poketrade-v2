import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, ListPlus, Heart } from "lucide-react"

export default async function StatsPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Dans une application réelle, vous voudriez vérifier si l'utilisateur est un administrateur

  // Récupérer les statistiques
  const { count: usersCount } = await supabase.from("users").select("*", { count: "exact", head: true })

  const { count: cardsCount } = await supabase.from("cards").select("*", { count: "exact", head: true })

  const { count: tradeListingsCount } = await supabase
    .from("trade_listings")
    .select("*", { count: "exact", head: true })

  const { count: wishlistsCount } = await supabase.from("wishlists").select("*", { count: "exact", head: true })

  // Remove notification-related statistics

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Statistiques</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount || 0}</div>
            <p className="text-xs text-muted-foreground">Utilisateurs inscrits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cardsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Cartes dans la base de données</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listes d'échange</CardTitle>
            <ListPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tradeListingsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Cartes disponibles pour l'échange</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listes de souhaits</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wishlistsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Cartes souhaitées</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

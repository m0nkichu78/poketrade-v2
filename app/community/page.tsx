import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, ListPlus, Heart, ArrowRightLeft } from "lucide-react"
import { ActivityFeed } from "@/components/activity-feed"
import { CommunityStats } from "@/components/community-stats"

export const revalidate = 0

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { userId?: string; tab?: string }
}) {
  const supabase = createServerSupabaseClient()

  // Récupérer les informations de l'utilisateur filtré si spécifié
  let filteredUser = null
  if (searchParams.userId) {
    const { data: user } = await supabase
      .from("users")
      .select("id, in_game_name, in_game_id")
      .eq("id", searchParams.userId)
      .single()

    filteredUser = user
  }

  // Récupérer les statistiques globales
  const { count: usersCount } = await supabase.from("users").select("*", { count: "exact", head: true })
  const { count: wishlistCount } = await supabase.from("wishlists").select("*", { count: "exact", head: true })
  const { count: tradeListingsCount } = await supabase
    .from("trade_listings")
    .select("*", { count: "exact", head: true })

  // Calculer le début du mois actuel
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Récupérer le nombre de correspondances ce mois-ci
  const { count: matchesThisMonth } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("type", "trade_match")
    .gte("created_at", startOfMonth)

  // Remove notification-related statistics

  // Déterminer l'onglet actif
  const activeTab = searchParams.tab || "stats"

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {filteredUser ? `Activités de ${filteredUser.in_game_name || "Dresseur"}` : "Communauté"}
          </h1>
          <p className="text-muted-foreground">
            {filteredUser
              ? `Découvrez l'activité récente de ${filteredUser.in_game_name || "ce dresseur"}`
              : "Découvrez les statistiques et l'activité de la communauté PokéTrade"}
          </p>
        </div>
      </div>

      <Tabs defaultValue={activeTab} className="space-y-8">
        <TabsList>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            <span>Statistiques</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Activité récente</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usersCount || 0}</div>
                <p className="text-xs text-muted-foreground">Dresseurs inscrits</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cartes souhaitées</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{wishlistCount || 0}</div>
                <p className="text-xs text-muted-foreground">Cartes dans les listes de souhaits</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cartes à échanger</CardTitle>
                <ListPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tradeListingsCount || 0}</div>
                <p className="text-xs text-muted-foreground">Cartes disponibles pour l'échange</p>
              </CardContent>
            </Card>
          </div>

          <CommunityStats />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityFeed userId={searchParams.userId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

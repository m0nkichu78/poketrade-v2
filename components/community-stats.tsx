"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function CommunityStats() {
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [monthlyStats, setMonthlyStats] = useState<any[]>([])
  const [topCards, setTopCards] = useState<any[]>([])
  const [topUsers, setTopUsers] = useState<any[]>([])

  useEffect(() => {
    // Simplifier également la fonction useEffect pour ne récupérer que les données nécessaires
    // Remplacer la fonction fetchStats dans useEffect par cette version simplifiée

    const fetchStats = async () => {
      setIsLoading(true)

      try {
        // Récupérer les cartes les plus demandées
        const { data: wishlistItems } = await supabase
          .from("wishlists")
          .select("card_id, cards(id, name, set_name, rarity)")

        if (wishlistItems) {
          // Compter manuellement les occurrences
          const cardCounts: Record<string, { count: number; card: any }> = {}
          wishlistItems.forEach((item) => {
            if (!item.card_id) return
            if (!cardCounts[item.card_id]) {
              cardCounts[item.card_id] = { count: 0, card: item.cards }
            }
            cardCounts[item.card_id].count++
          })

          // Convertir en tableau et trier
          const sortedCards = Object.entries(cardCounts)
            .map(([_, data]) => ({
              ...data.card,
              count: data.count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

          setTopCards(sortedCards)
        }

        // Récupérer les utilisateurs les plus actifs
        const { data: activities } = await supabase
          .from("activities")
          .select("user_id, users(id, in_game_name)")
          .order("created_at", { ascending: false })

        if (activities) {
          // Compter les activités par utilisateur
          const userCounts: Record<string, { count: number; user: any }> = {}
          activities.forEach((activity) => {
            if (!activity.user_id) return
            if (!userCounts[activity.user_id]) {
              userCounts[activity.user_id] = { count: 0, user: activity.users }
            }
            userCounts[activity.user_id].count++
          })

          // Convertir en tableau et trier
          const sortedUsers = Object.entries(userCounts)
            .map(([_, data]) => ({
              ...data.user,
              count: data.count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

          setTopUsers(sortedUsers)
        }
      } catch (error) {
        console.error("Error fetching community stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cartes les plus demandées</CardTitle>
            <CardDescription>Top 5 des cartes dans les listes de souhaits</CardDescription>
          </CardHeader>
          <CardContent>
            {topCards.length > 0 ? (
              <div className="space-y-4">
                {topCards.map((card, index) => (
                  <div key={card.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{card.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {card.set_name} • {card.rarity || "Standard"}
                        </p>
                      </div>
                    </div>
                    <div className="font-bold">{card.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dresseurs les plus actifs</CardTitle>
            <CardDescription>Top 5 des utilisateurs avec le plus d'activités</CardDescription>
          </CardHeader>
          <CardContent>
            {topUsers.length > 0 ? (
              <div className="space-y-4">
                {topUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{user.in_game_name || "Dresseur anonyme"}</p>
                      </div>
                    </div>
                    <div className="font-bold">{user.count} activités</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

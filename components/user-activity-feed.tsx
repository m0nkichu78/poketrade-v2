"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ListPlus, Heart, Users, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { activityService, type ActivityType } from "@/lib/activity-service"

interface UserActivityFeedProps {
  userId: string
}

export function UserActivityFeed({ userId }: UserActivityFeedProps) {
  const { supabase } = useSupabase()
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true)

      const { data, error } = await activityService.getUserActivities(userId, { limit: 10 })

      if (error) {
        console.error("Error fetching user activities:", error)
      } else {
        setActivities(data || [])
      }

      setIsLoading(false)
    }

    fetchActivities()
  }, [userId])

  // Fonction pour obtenir l'icône en fonction du type d'activité
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "wishlist_add":
        return <Heart className="h-4 w-4 text-red-500" />
      case "tradelist_add":
        return <ListPlus className="h-4 w-4 text-blue-500" />
      case "trade_match":
        return <Sparkles className="h-4 w-4 text-yellow-500" />
      case "user_signup":
        return <Users className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  // Fonction pour obtenir le texte du badge en fonction du type d'activité
  const getActivityBadge = (type: ActivityType) => {
    switch (type) {
      case "wishlist_add":
        return "Liste de souhaits"
      case "tradelist_add":
        return "Liste d'échange"
      case "trade_match":
        return "Match d'échange"
      case "user_signup":
        return "Nouveau membre"
      default:
        return ""
    }
  }

  // Fonction pour obtenir la couleur du badge en fonction du type d'activité
  const getBadgeVariant = (type: ActivityType): "default" | "secondary" | "outline" | "destructive" => {
    switch (type) {
      case "wishlist_add":
        return "destructive"
      case "tradelist_add":
        return "default"
      case "trade_match":
        return "secondary"
      case "user_signup":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Activités récentes</h3>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            Aucune activité récente à afficher
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Badge variant={getBadgeVariant(activity.type)} className="flex items-center gap-1">
                    {getActivityIcon(activity.type)}
                    <span>{getActivityBadge(activity.type)}</span>
                  </Badge>
                  <p className="text-sm">{activity.content}</p>
                  {activity.related_user && (
                    <Link href={`/profile/${activity.related_user_id}`} className="text-sm font-medium hover:underline">
                      avec {activity.related_user.in_game_name || "Dresseur"}
                    </Link>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: fr })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activities.length > 0 && (
        <div className="flex justify-center">
          <Button asChild variant="outline" size="sm">
            <Link href={`/community?userId=${userId}`}>Voir toutes les activités</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

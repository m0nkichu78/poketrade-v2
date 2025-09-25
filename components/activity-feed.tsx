"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ListPlus, Heart, Users, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { activityService, type ActivityType } from "@/lib/activity-service"

interface ActivityFeedProps {
  userId?: string
}

export function ActivityFeed({ userId }: ActivityFeedProps) {
  const { supabase } = useSupabase()
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true)

      const options: any = {
        limit: 50,
      }

      // Filtrer par utilisateur si spécifié
      if (userId) {
        options.userId = userId
      }

      const { data, error } = await activityService.getActivities(options)

      if (error) {
        console.error("Error fetching activities:", error)
      } else {
        setActivities(data || [])
      }

      setIsLoading(false)
    }

    fetchActivities()

    // Mettre en place une souscription en temps réel pour les nouvelles activités
    const channel = supabase
      .channel("activities_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activities",
        },
        (payload) => {
          // Vérifier si l'activité correspond aux filtres actuels
          if (userId && payload.new.user_id !== userId) {
            return
          }

          // Récupérer les détails complets de la nouvelle activité
          const fetchNewActivity = async () => {
            const { data, error } = await supabase
              .from("activities")
              .select(`
                *,
                user:user_id(*),
                related_user:related_user_id(*)
              `)
              .eq("id", payload.new.id)
              .single()

            if (!error && data) {
              setActivities((prev) => [data, ...prev])
            }
          }

          fetchNewActivity()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

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

  // Fonction pour obtenir les initiales d'un utilisateur
  const getInitials = (name: string, email: string) => {
    if (name && name.length > 0) {
      return name.substring(0, 2).toUpperCase()
    }
    return email ? email.substring(0, 2).toUpperCase() : "XX"
  }

  // Fonction pour formater la date
  const formatDate = (date: string) => {
    const dateObj = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Si c'est aujourd'hui, afficher l'heure
    if (dateObj.toDateString() === today.toDateString()) {
      return `Aujourd'hui à ${format(dateObj, "HH:mm")}`
    }

    // Si c'est hier, afficher "Hier"
    if (dateObj.toDateString() === yesterday.toDateString()) {
      return `Hier à ${format(dateObj, "HH:mm")}`
    }

    // Sinon afficher la date complète
    return format(dateObj, "dd/MM/yyyy à HH:mm", { locale: fr })
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Aucune activité à afficher pour le moment</p>
            <Button asChild>
              <Link href="/cards">Parcourir les cartes</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <Card key={activity.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.user?.avatar_url || ""} alt={activity.user?.in_game_name || ""} />
                    <AvatarFallback>
                      {getInitials(activity.user?.in_game_name || "", activity.user?.email || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/profile/${activity.user_id}`} className="font-medium hover:underline">
                        {activity.user?.in_game_name || "Dresseur"}
                      </Link>
                      <Badge variant={getBadgeVariant(activity.type)} className="flex items-center gap-1">
                        {getActivityIcon(activity.type)}
                        <span>{getActivityBadge(activity.type)}</span>
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{formatDate(activity.created_at)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.content}</p>
                    {activity.related_user && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-muted-foreground">avec</span>
                        <Link href={`/profile/${activity.related_user_id}`} className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={activity.related_user.avatar_url || ""}
                              alt={activity.related_user.in_game_name || ""}
                            />
                            <AvatarFallback>
                              {getInitials(activity.related_user.in_game_name || "", activity.related_user.email || "")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {activity.related_user.in_game_name || "Dresseur"}
                          </span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Créer un client Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Types d'activités
export type ActivityType = "wishlist_add" | "tradelist_add" | "trade_match" | "user_signup"

export interface Activity {
  id?: number
  user_id: string
  type: ActivityType
  content: string
  related_user_id?: string | null
  created_at?: string
  metadata?: Record<string, any>
}

export const activityService = {
  // Créer une nouvelle activité
  async createActivity(activity: Activity): Promise<{ data: any; error: any }> {
    try {
      // Vérifier si une activité similaire existe déjà dans les 5 dernières minutes
      // pour éviter les doublons (par exemple, si l'utilisateur ajoute plusieurs fois la même carte)
      if (activity.type === "wishlist_add" || activity.type === "tradelist_add") {
        const fiveMinutesAgo = new Date()
        fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5)

        const { data: existingActivities } = await supabase
          .from("activities")
          .select("id")
          .eq("user_id", activity.user_id)
          .eq("type", activity.type)
          .eq("content", activity.content)
          .gte("created_at", fiveMinutesAgo.toISOString())
          .limit(1)

        if (existingActivities && existingActivities.length > 0) {
          return { data: existingActivities[0], error: null }
        }
      }

      const { data, error } = await supabase.from("activities").insert(activity).select().single()

      if (error) {
        console.error("Error creating activity:", error)
      }

      return { data, error }
    } catch (error) {
      console.error("Error creating activity:", error)
      return { data: null, error }
    }
  },

  // Récupérer toutes les activités avec pagination
  async getActivities(options?: {
    type?: ActivityType
    userId?: string
    limit?: number
    offset?: number
  }): Promise<{ data: any[]; count: number | null; error: any }> {
    try {
      let query = supabase
        .from("activities")
        .select(
          `
          *,
          user:user_id(*),
          related_user:related_user_id(*)
        `,
          { count: "exact" },
        )
        .order("created_at", { ascending: false })

      // Appliquer les filtres
      if (options?.type) {
        query = query.eq("type", options.type)
      }

      if (options?.userId) {
        query = query.eq("user_id", options.userId)
      }

      // Pagination
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
      }

      const { data, error, count } = await query

      if (error) {
        console.error("Error fetching activities:", error)
      }

      return { data: data || [], count, error }
    } catch (error) {
      console.error("Error fetching activities:", error)
      return { data: [], count: null, error }
    }
  },

  // Récupérer une activité par ID
  async getActivityById(id: number): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select(
          `
          *,
          user:user_id(*),
          related_user:related_user_id(*)
        `,
        )
        .eq("id", id)
        .single()

      return { data, error }
    } catch (error) {
      console.error("Error fetching activity:", error)
      return { data: null, error }
    }
  },

  // Mettre à jour une activité
  async updateActivity(id: number, updates: Partial<Activity>): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.from("activities").update(updates).eq("id", id).select().single()

      return { data, error }
    } catch (error) {
      console.error("Error updating activity:", error)
      return { data: null, error }
    }
  },

  // Supprimer une activité
  async deleteActivity(id: number): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase.from("activities").delete().eq("id", id)

      return { success: !error, error }
    } catch (error) {
      console.error("Error deleting activity:", error)
      return { success: false, error }
    }
  },

  // Récupérer les activités d'un utilisateur
  async getUserActivities(
    userId: string,
    options?: {
      limit?: number
      offset?: number
    },
  ): Promise<{ data: any[]; count: number | null; error: any }> {
    return this.getActivities({
      userId,
      limit: options?.limit,
      offset: options?.offset,
    })
  },

  // Récupérer les activités par type
  async getActivitiesByType(
    type: ActivityType,
    options?: {
      limit?: number
      offset?: number
    },
  ): Promise<{ data: any[]; count: number | null; error: any }> {
    return this.getActivities({
      type,
      limit: options?.limit,
      offset: options?.offset,
    })
  },
}

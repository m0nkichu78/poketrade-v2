"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSupabase } from "@/lib/supabase-provider"
import type { User } from "@supabase/supabase-js"

interface UserAvatarProps {
  user: User | null
  className?: string
}

export function UserAvatar({ user, className = "h-8 w-8" }: UserAvatarProps) {
  const { supabase } = useSupabase()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!user) {
        setAvatarUrl(null)
        setIsLoading(false)
        return
      }

      try {
        const { data } = await supabase.from("users").select("avatar_url").eq("id", user.id).single()

        setAvatarUrl(data?.avatar_url || null)
      } catch (error) {
        console.error("Error fetching avatar:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvatar()
  }, [user, supabase])

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  if (isLoading) {
    return (
      <Avatar className={className}>
        <AvatarFallback>...</AvatarFallback>
      </Avatar>
    )
  }

  return (
    <Avatar className={className}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={user?.email || ""} />}
      <AvatarFallback>{user?.email ? getInitials(user.email) : "U"}</AvatarFallback>
    </Avatar>
  )
}

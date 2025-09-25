"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AvatarSelector } from "@/components/avatar-selector"
import type { Database } from "@/lib/database.types"

type Profile = Database["public"]["Tables"]["users"]["Row"]

export function ProfileForm({ profile }: { profile: Profile }) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [inGameName, setInGameName] = useState(profile?.in_game_name || "")
  const [inGameId, setInGameId] = useState(profile?.in_game_id || "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("users")
        .update({
          in_game_name: inGameName,
          in_game_id: inGameId,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) {
        throw error
      }

      toast({
        title: "Profil mis à jour",
        description: "Votre profil a été mis à jour avec succès.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Échec de la mise à jour du profil",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarSelect = (url: string) => {
    setAvatarUrl(url)
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl || ""} alt={profile.in_game_name || profile.email} />
              <AvatarFallback>{getInitials(profile.email)}</AvatarFallback>
            </Avatar>
            <AvatarSelector currentAvatarUrl={avatarUrl} onSelect={handleAvatarSelect} />
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email} disabled className="bg-muted" />
              <p className="text-sm text-muted-foreground mt-1">Votre email ne peut pas être modifié</p>
            </div>
            <div>
              <Label htmlFor="in-game-name">Nom En Jeu</Label>
              <Input
                id="in-game-name"
                value={inGameName}
                onChange={(e) => setInGameName(e.target.value)}
                placeholder="Votre nom en jeu"
                disabled={isLoading}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">C'est le nom affiché dans Pokémon TCG Pocket</p>
            </div>
            <div>
              <Label htmlFor="in-game-id">ID En Jeu</Label>
              <Input
                id="in-game-id"
                value={inGameId}
                onChange={(e) => setInGameId(e.target.value)}
                placeholder="0000-0000-0000-0000"
                pattern="[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}"
                disabled={isLoading}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Votre ID unique dans Pokémon TCG Pocket (format: 0000-0000-0000-0000)
              </p>
            </div>
          </div>
        </div>
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Enregistrement..." : "Enregistrer les Modifications"}
      </Button>
    </form>
  )
}

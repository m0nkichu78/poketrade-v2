"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { userService } from "@/lib/user-service"

interface ProfileFormProps {
  profile: any
}

export function ProfileFormEnhanced({ profile }: ProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [inGameName, setInGameName] = useState(profile?.in_game_name || "")
  const [inGameId, setInGameId] = useState(profile?.in_game_id || "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Type de fichier non valide",
        description: "Veuillez sélectionner une image (JPG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Vérifier la taille du fichier (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale autorisée est de 2 Mo",
        variant: "destructive",
      })
      return
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await userService.updateUserProfile(
        profile.id,
        {
          in_game_name: inGameName,
          in_game_id: inGameId,
          updated_at: new Date().toISOString(),
        },
        avatarFile || undefined,
      )

      if (error) throw error

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

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarPreview || ""} alt={profile.in_game_name || profile.email} />
              <AvatarFallback className="text-lg">
                {profile.in_game_name ? getInitials(profile.in_game_name) : getInitials(profile.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar" className="cursor-pointer">
                <Button type="button" variant="outline" size="sm">
                  Changer l'avatar
                </Button>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isLoading}
                />
              </Label>
            </div>
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
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          "Enregistrer les Modifications"
        )}
      </Button>
    </form>
  )
}

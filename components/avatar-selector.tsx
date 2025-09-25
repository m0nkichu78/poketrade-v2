"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { avatarService, type PokemonAvatar } from "@/lib/avatar-service"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

interface AvatarSelectorProps {
  currentAvatarUrl?: string
  onSelect: (avatarUrl: string) => void
}

export function AvatarSelector({ currentAvatarUrl, onSelect }: AvatarSelectorProps) {
  const [avatars, setAvatars] = useState<PokemonAvatar[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>(currentAvatarUrl)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const loadAvatars = async () => {
      setIsLoading(true)
      const avatarList = await avatarService.getAvatars()
      setAvatars(avatarList)
      setIsLoading(false)
    }

    if (isOpen) {
      loadAvatars()
    }
  }, [isOpen])

  const handleSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl)
  }

  const handleConfirm = () => {
    if (selectedAvatar) {
      onSelect(selectedAvatar)
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          Choisir un avatar Pokémon
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Choisir un avatar</DialogTitle>
          <DialogDescription>Sélectionnez un Pokémon comme avatar pour votre profil</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] p-4 rounded-md border">
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {Array.from({ length: 15 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <Skeleton className="h-4 w-20 mt-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {avatars.map((avatar) => (
                <div
                  key={avatar.name}
                  className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-all
                    ${selectedAvatar === avatar.image_url ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-muted"}`}
                  onClick={() => handleSelect(avatar.image_url)}
                >
                  <div className="relative h-16 w-16 rounded-full overflow-hidden">
                    <Image
                      src={avatar.image_url || "/placeholder.svg"}
                      alt={avatar.name}
                      fill
                      className="object-cover"
                    />
                    {selectedAvatar === avatar.image_url && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Check className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </div>
                  <span className="mt-2 text-xs text-center font-medium">{avatar.name}</span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!selectedAvatar}>
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

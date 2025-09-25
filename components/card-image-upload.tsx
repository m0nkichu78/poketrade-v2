"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, Loader2, X } from "lucide-react"
import Image from "next/image"

interface CardImageUploadProps {
  initialImageUrl?: string
  onImageUpload: (file: File) => void
  onImageRemove?: () => void
}

export function CardImageUpload({ initialImageUrl, onImageUpload, onImageRemove }: CardImageUploadProps) {
  const { toast } = useToast()
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale autorisée est de 5 Mo",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Créer une URL d'objet pour l'aperçu
      const objectUrl = URL.createObjectURL(file)
      setImageUrl(objectUrl)

      // Appeler la fonction de rappel
      onImageUpload(file)
    } catch (error) {
      console.error("Error handling image:", error)
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du traitement de l'image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setImageUrl(null)
    if (onImageRemove) {
      onImageRemove()
    }
  }

  return (
    <div className="space-y-4">
      <Label htmlFor="card-image">Image de la carte</Label>

      {imageUrl ? (
        <div className="relative w-full max-w-[200px] aspect-[2/3]">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt="Aperçu de l'image"
            fill
            className="object-contain rounded-md border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center border border-dashed rounded-md p-6 w-full max-w-[200px] aspect-[2/3]">
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Cliquez pour télécharger</p>
          </div>
          <Input
            id="card-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
      )}

      <Label htmlFor="card-image" className="cursor-pointer block">
        <Button type="button" variant="outline" className="w-full max-w-[200px]" disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Téléchargement...
            </>
          ) : imageUrl ? (
            "Changer l'image"
          ) : (
            "Télécharger une image"
          )}
        </Button>
      </Label>
    </div>
  )
}

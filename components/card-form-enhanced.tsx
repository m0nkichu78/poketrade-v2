"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { CardImageUpload } from "./card-image-upload"
import { cardService } from "@/lib/card-service"

interface CardFormProps {
  card?: any
  isEditing?: boolean
}

export function CardFormEnhanced({ card, isEditing = false }: CardFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [sets, setSets] = useState<string[]>([])
  const [rarities, setRarities] = useState<string[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    id: card?.id || "",
    name: card?.name || "",
    set_name: card?.set_name || "",
    pack: card?.pack || "",
    rarity: card?.rarity || "",
    card_number: card?.card_number || "",
    image_url: card?.image_url || "",
  })

  useEffect(() => {
    // Charger les ensembles et raretés uniques
    const loadSetsAndRarities = async () => {
      const { data: setsData } = await cardService.getUniqueSets()
      const { data: raritiesData } = await cardService.getUniqueRarities()

      if (setsData) setSets(setsData)
      if (raritiesData) setRarities(raritiesData)
    }

    loadSetsAndRarities()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (file: File) => {
    setImageFile(file)
  }

  const handleImageRemove = () => {
    setImageFile(null)
    setFormData((prev) => ({ ...prev, image_url: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Valider les données du formulaire
      if (!formData.id || !formData.name || !formData.set_name || !formData.pack || !formData.card_number) {
        throw new Error("Veuillez remplir tous les champs obligatoires")
      }

      if (isEditing) {
        // Mettre à jour la carte existante
        const { data, error } = await cardService.updateCard(
          card.id,
          {
            name: formData.name,
            set_name: formData.set_name,
            pack: formData.pack,
            rarity: formData.rarity || null,
            card_number: formData.card_number,
            image_url: formData.image_url,
          },
          imageFile || undefined,
        )

        if (error) throw error

        toast({
          title: "Carte mise à jour",
          description: "La carte a été mise à jour avec succès",
        })
      } else {
        // Créer une nouvelle carte
        const { data, error } = await cardService.createCard(
          {
            id: formData.id,
            name: formData.name,
            set_name: formData.set_name,
            pack: formData.pack,
            rarity: formData.rarity || null,
            card_number: formData.card_number,
            image_url: formData.image_url,
          },
          imageFile || undefined,
        )

        if (error) throw error

        toast({
          title: "Carte créée",
          description: "La carte a été créée avec succès",
        })
      }

      // Rediriger vers la page des cartes
      router.push("/admin/cards")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Échec de l'enregistrement de la carte",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="id">ID de la carte (obligatoire)</Label>
          <Input
            id="id"
            name="id"
            value={formData.id}
            onChange={handleChange}
            disabled={isEditing || isLoading}
            required
          />
          <p className="text-sm text-muted-foreground">Un identifiant unique pour la carte (ex: "sv1-001")</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nom de la carte (obligatoire)</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} disabled={isLoading} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="set_name">Nom de l'ensemble (obligatoire)</Label>
          <Select
            value={formData.set_name}
            onValueChange={(value) => handleSelectChange("set_name", value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un ensemble" />
            </SelectTrigger>
            <SelectContent>
              {sets.map((set) => (
                <SelectItem key={set} value={set}>
                  {set}
                </SelectItem>
              ))}
              <SelectItem value="new">Nouvel ensemble...</SelectItem>
            </SelectContent>
          </Select>
          {formData.set_name === "new" && (
            <Input
              className="mt-2"
              placeholder="Nom du nouvel ensemble"
              value=""
              onChange={(e) => handleSelectChange("set_name", e.target.value)}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pack">Pack (obligatoire)</Label>
          <Input id="pack" name="pack" value={formData.pack} onChange={handleChange} disabled={isLoading} required />
          <p className="text-sm text-muted-foreground">Le pack auquel appartient la carte (ex: "Base Set")</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rarity">Rareté</Label>
          <Select
            value={formData.rarity}
            onValueChange={(value) => handleSelectChange("rarity", value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une rareté" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Aucune</SelectItem>
              {rarities.map((rarity) => (
                <SelectItem key={rarity} value={rarity}>
                  {rarity}
                </SelectItem>
              ))}
              <SelectItem value="new">Nouvelle rareté...</SelectItem>
            </SelectContent>
          </Select>
          {formData.rarity === "new" && (
            <Input
              className="mt-2"
              placeholder="Nom de la nouvelle rareté"
              value=""
              onChange={(e) => handleSelectChange("rarity", e.target.value)}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="card_number">Numéro de carte (obligatoire)</Label>
          <Input
            id="card_number"
            name="card_number"
            value={formData.card_number}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          <p className="text-sm text-muted-foreground">Le numéro de la carte dans l'ensemble (ex: "001/150")</p>
        </div>

        <div className="md:col-span-2">
          <CardImageUpload
            initialImageUrl={formData.image_url}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Mise à jour..." : "Création..."}
            </>
          ) : isEditing ? (
            "Mettre à jour la carte"
          ) : (
            "Créer la carte"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/cards")} disabled={isLoading}>
          Annuler
        </Button>
      </div>
    </form>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Database } from "@/lib/database.types"
import { Loader2 } from "lucide-react"

type Card = Database["public"]["Tables"]["cards"]["Row"]

interface CardFormProps {
  card?: Card
  isEditing?: boolean
}

export function CardForm({ card, isEditing = false }: CardFormProps) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    id: card?.id || "",
    name: card?.name || "",
    set_name: card?.set_name || "",
    pack: card?.pack || "",
    rarity: card?.rarity || "",
    card_number: card?.card_number || "",
    image_url: card?.image_url || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate form data
      if (!formData.id || !formData.name || !formData.set_name || !formData.pack || !formData.card_number) {
        throw new Error("Please fill in all required fields")
      }

      if (isEditing) {
        // Update existing card
        const { error } = await supabase
          .from("cards")
          .update({
            name: formData.name,
            set_name: formData.set_name,
            pack: formData.pack,
            rarity: formData.rarity || null,
            card_number: formData.card_number,
            image_url: formData.image_url,
          })
          .eq("id", card!.id)

        if (error) throw error

        toast({
          title: "Card updated",
          description: "The card has been updated successfully",
        })
      } else {
        // Create new card
        const { error } = await supabase.from("cards").insert({
          id: formData.id,
          name: formData.name,
          set_name: formData.set_name,
          pack: formData.pack,
          rarity: formData.rarity || null,
          card_number: formData.card_number,
          image_url: formData.image_url,
        })

        if (error) throw error

        toast({
          title: "Card created",
          description: "The card has been created successfully",
        })
      }

      // Redirect back to admin cards page
      router.push("/admin/cards")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save card",
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
          <Label htmlFor="id">Card ID (required)</Label>
          <Input
            id="id"
            name="id"
            value={formData.id}
            onChange={handleChange}
            disabled={isEditing || isLoading}
            required
          />
          <p className="text-sm text-muted-foreground">A unique identifier for the card (e.g., "sv1-001")</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Card Name (required)</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} disabled={isLoading} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="set_name">Set Name (required)</Label>
          <Input
            id="set_name"
            name="set_name"
            value={formData.set_name}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          <p className="text-sm text-muted-foreground">The name of the card set (e.g., "Scarlet & Violet")</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pack">Pack (required)</Label>
          <Input id="pack" name="pack" value={formData.pack} onChange={handleChange} disabled={isLoading} required />
          <p className="text-sm text-muted-foreground">The pack the card belongs to (e.g., "Base Set")</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rarity">Rarity</Label>
          <Input id="rarity" name="rarity" value={formData.rarity} onChange={handleChange} disabled={isLoading} />
          <p className="text-sm text-muted-foreground">The rarity of the card (e.g., "Common", "Rare", "Ultra Rare")</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="card_number">Card Number (required)</Label>
          <Input
            id="card_number"
            name="card_number"
            value={formData.card_number}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          <p className="text-sm text-muted-foreground">The number of the card in the set (e.g., "001/150")</p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="image_url">Image URL (required)</Label>
          <Input
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          <p className="text-sm text-muted-foreground">URL to the card image</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : isEditing ? (
            "Update Card"
          ) : (
            "Create Card"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/cards")} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

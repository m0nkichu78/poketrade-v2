"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useSupabase } from "@/lib/supabase-provider"
import { redirect } from "next/navigation"

export default function SeedPage() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(true) // You should implement proper admin check

  // Check if user is admin
  const checkAdmin = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      redirect("/login")
    }

    // In a real app, you would check if the user has admin privileges
    // For now, we'll just check if they're logged in
    setIsAdmin(!!session)
  }

  const seedSampleCards = async () => {
    setIsLoading(true)
    try {
      // Call the API route to seed cards
      const response = await fetch("/api/seed-cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SEED_SECRET_TOKEN}`,
        },
        body: JSON.stringify({ token: process.env.NEXT_PUBLIC_SEED_SECRET_TOKEN }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to seed cards")
      }

      toast({
        title: "Success!",
        description: "Sample cards have been added to the database.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to seed cards",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Alternative method using direct Supabase client
  const seedCardsDirectly = async () => {
    setIsLoading(true)
    try {
      // Sample card data
      const sampleCards = [
        {
          card_id: "pocket-1",
          name: "Pikachu",
          set_name: "Scarlet & Violet",
          rarity: "Rare",
          image_url: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV1/SV1_EN_47.png",
        },
        {
          card_id: "pocket-2",
          name: "Charizard",
          set_name: "Scarlet & Violet",
          rarity: "Ultra Rare",
          image_url: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV1/SV1_EN_20.png",
        },
        {
          card_id: "pocket-3",
          name: "Mewtwo",
          set_name: "Scarlet & Violet",
          rarity: "Ultra Rare",
          image_url: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV1/SV1_EN_72.png",
        },
        {
          card_id: "pocket-4",
          name: "Snorlax",
          set_name: "Scarlet & Violet",
          rarity: "Rare",
          image_url: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV1/SV1_EN_143.png",
        },
        {
          card_id: "pocket-5",
          name: "Gengar",
          set_name: "Scarlet & Violet",
          rarity: "Rare Holo",
          image_url: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV1/SV1_EN_66.png",
        },
        // Add more cards as needed
      ]

      const { error } = await supabase.from("cards").upsert(sampleCards, { onConflict: "card_id" })

      if (error) {
        throw error
      }

      toast({
        title: "Success!",
        description: "Sample cards have been added to the database directly.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to seed cards",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Seed Database</CardTitle>
          <CardDescription>Add sample Pokémon TCG Pocket cards to the database for testing purposes.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This will add 20 sample Pokémon cards to your database. This is useful for testing the application before
            importing the full card database.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={seedCardsDirectly} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding...
              </>
            ) : (
              "Seed Sample Cards"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

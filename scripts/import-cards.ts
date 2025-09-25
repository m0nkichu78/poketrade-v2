import { createClient } from "@supabase/supabase-js"
import type { Database } from "../lib/database.types"
import fetch from "node-fetch"
import * as cheerio from "cheerio"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

interface PokemonCard {
  cardId: string
  name: string
  setName: string
  rarity: string | null
  imageUrl: string
}

async function scrapeCards(): Promise<PokemonCard[]> {
  console.log("Fetching cards from pocket.pokemongohub.net...")

  // This is a simplified example - in a real implementation, you would need to
  // handle pagination and navigate through multiple pages
  const response = await fetch("https://pocket.pokemongohub.net/fr")
  const html = await response.text()
  const $ = cheerio.load(html)

  const cards: PokemonCard[] = []

  // This selector would need to be adjusted based on the actual website structure
  $(".card-item").each((i, element) => {
    const cardId = $(element).attr("data-id") || `card-${i}`
    const name = $(element).find(".card-name").text().trim()
    const setName = $(element).find(".card-set").text().trim()
    const rarity = $(element).find(".card-rarity").text().trim() || null
    const imageUrl = $(element).find("img").attr("src") || ""

    cards.push({
      cardId,
      name,
      setName,
      rarity,
      imageUrl,
    })
  })

  return cards
}

// Alternative approach using a mock API or JSON file
async function fetchCardsFromApi(): Promise<PokemonCard[]> {
  console.log("Fetching cards from API...")

  // In a real implementation, you would fetch from an actual API
  // This is just a placeholder for demonstration
  const mockCards: PokemonCard[] = [
    {
      cardId: "base-1",
      name: "Bulbasaur",
      setName: "Base Set",
      rarity: "Common",
      imageUrl: "https://example.com/bulbasaur.jpg",
    },
    {
      cardId: "base-2",
      name: "Ivysaur",
      setName: "Base Set",
      rarity: "Uncommon",
      imageUrl: "https://example.com/ivysaur.jpg",
    },
    {
      cardId: "base-3",
      name: "Venusaur",
      setName: "Base Set",
      rarity: "Rare",
      imageUrl: "https://example.com/venusaur.jpg",
    },
    {
      cardId: "base-4",
      name: "Charmander",
      setName: "Base Set",
      rarity: "Common",
      imageUrl: "https://example.com/charmander.jpg",
    },
    {
      cardId: "base-5",
      name: "Charmeleon",
      setName: "Base Set",
      rarity: "Uncommon",
      imageUrl: "https://example.com/charmeleon.jpg",
    },
    {
      cardId: "base-6",
      name: "Charizard",
      setName: "Base Set",
      rarity: "Rare",
      imageUrl: "https://example.com/charizard.jpg",
    },
    // Add more mock cards as needed
  ]

  return mockCards
}

async function importCards() {
  try {
    // Choose one of these methods based on your preference
    // const cards = await scrapeCards()
    const cards = await fetchCardsFromApi()

    console.log(`Found ${cards.length} cards to import`)

    // Import cards in batches to avoid hitting rate limits
    const batchSize = 50
    for (let i = 0; i < cards.length; i += batchSize) {
      const batch = cards.slice(i, i + batchSize)

      const { data, error } = await supabase.from("cards").upsert(
        batch.map((card) => ({
          card_id: card.cardId,
          name: card.name,
          set_name: card.setName,
          rarity: card.rarity,
          image_url: card.imageUrl,
        })),
        { onConflict: "card_id" },
      )

      if (error) {
        console.error("Error importing batch:", error)
      } else {
        console.log(`Imported batch ${i / batchSize + 1}/${Math.ceil(cards.length / batchSize)}`)
      }

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    console.log("Import completed successfully!")
  } catch (error) {
    console.error("Error importing cards:", error)
  }
}

// Run the import
importCards()

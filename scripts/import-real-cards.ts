import { createClient } from "@supabase/supabase-js"
import type { Database } from "../lib/database.types"
import fetch from "node-fetch"
import * as cheerio from "cheerio"
import * as fs from "fs"
import * as path from "path"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

interface PokemonCard {
  id: string
  name: string
  set_name: string
  pack: string
  rarity: string | null
  card_number: string
  image_url: string
}

async function scrapeCards(url: string): Promise<PokemonCard[]> {
  console.log(`Fetching cards from ${url}...`)

  try {
    const response = await fetch(url)
    const html = await response.text()
    const $ = cheerio.load(html)

    const cards: PokemonCard[] = []

    // This selector would need to be adjusted based on the actual website structure
    // The following is a placeholder and would need to be updated based on the actual HTML structure
    $(".card-container").each((i, element) => {
      const id = $(element).attr("data-id") || `card-${i}`
      const name = $(element).find(".card-name").text().trim()
      const set_name = $(element).find(".card-set").text().trim()
      const pack = $(element).find(".card-pack").text().trim() || "Unknown"
      const rarity = $(element).find(".card-rarity").text().trim() || null
      const card_number = $(element).find(".card-number").text().trim() || `${i}`
      const image_url = $(element).find("img").attr("src") || ""

      cards.push({
        id,
        name,
        set_name,
        pack,
        rarity,
        card_number,
        image_url,
      })
    })

    return cards
  } catch (error) {
    console.error("Error scraping cards:", error)
    return []
  }
}

// Function to save scraped data to a JSON file for backup
function saveToJsonFile(cards: PokemonCard[], filename: string) {
  const filePath = path.join(__dirname, filename)
  fs.writeFileSync(filePath, JSON.stringify(cards, null, 2))
  console.log(`Saved ${cards.length} cards to ${filePath}`)
}

// Function to load cards from a JSON file
function loadFromJsonFile(filename: string): PokemonCard[] {
  try {
    const filePath = path.join(__dirname, filename)
    const data = fs.readFileSync(filePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Error loading cards from file:", error)
    return []
  }
}

async function importCards(cards: PokemonCard[]) {
  console.log(`Importing ${cards.length} cards to Supabase...`)

  // Import cards in batches to avoid hitting rate limits
  const batchSize = 50
  for (let i = 0; i < cards.length; i += batchSize) {
    const batch = cards.slice(i, i + batchSize)

    const { data, error } = await supabase.from("cards").upsert(batch, { onConflict: "id" })

    if (error) {
      console.error("Error importing batch:", error)
    } else {
      console.log(`Imported batch ${i / batchSize + 1}/${Math.ceil(cards.length / batchSize)}`)
    }

    // Add a small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log("Import completed successfully!")
}

// Main function to orchestrate the import process
async function main() {
  const sourceUrl = process.argv[2] || "https://pocket.pokemongohub.net/fr"
  const useJsonFile = process.argv.includes("--use-json")
  const jsonFilename = "pokemon_cards.json"

  let cards: PokemonCard[] = []

  if (useJsonFile) {
    console.log("Loading cards from JSON file...")
    cards = loadFromJsonFile(jsonFilename)
  } else {
    console.log("Scraping cards from website...")
    cards = await scrapeCards(sourceUrl)

    // Save to JSON file for backup
    if (cards.length > 0) {
      saveToJsonFile(cards, jsonFilename)
    }
  }

  if (cards.length === 0) {
    console.error("No cards found to import!")
    process.exit(1)
  }

  await importCards(cards)
}

// Run the main function
main().catch(console.error)

import { createClient } from "@supabase/supabase-js"
import type { Database } from "../lib/database.types"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Sample card data for Pokémon TCG Pocket
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
  {
    card_id: "pocket-6",
    name: "Blastoise",
    set_name: "Scarlet & Violet",
    rarity: "Ultra Rare",
    image_url: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV1/SV1_EN_25.png",
  },
  {
    card_id: "pocket-7",
    name: "Venusaur",
    set_name: "Scarlet & Violet",
    rarity: "Ultra Rare",
    image_url: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV1/SV1_EN_1.png",
  },
  {
    card_id: "pocket-8",
    name: "Eevee",
    set_name: "Scarlet & Violet",
    rarity: "Common",
    image_url: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV1/SV1_EN_123.png",
  },
  {
    card_id: "pocket-9",
    name: "Jigglypuff",
    set_name: "Scarlet & Violet",
    rarity: "Common",
    image_url: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV1/SV1_EN_130.png",
  },
  {
    card_id: "pocket-10",
    name: "Mew",
    set_name: "Scarlet & Violet",
    rarity: "Ultra Rare",
    image_url: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV1/SV1_EN_71.png",
  },
  // Paldea set
  {
    card_id: "pocket-11",
    name: "Koraidon",
    set_name: "Paldea Evolved",
    rarity: "Ultra Rare",
    image_url: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV2/SV2_EN_125.png",
  },
  {
    card_id: "pocket-12",
    name: "Miraidon",
    set_name: "Paldea Evolved",
    rarity: "Ultra Rare",
    image_url: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV2/SV2_EN_81.png",
  },
  {
    card_id: "pocket-13",
    name: "Sprigatito",
    set_name: "Paldea Evolved",
    rarity: "Common",
    image_url: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV2/SV2_EN_12.png",
  },
  {
    card_id: "pocket-14",
    name: "Fuecoco",
    set_name: "Paldea Evolved",
    rarity: "Common",
    image_url: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV2/SV2_EN_37.png",
  },
  {
    card_id: "pocket-15",
    name: "Quaxly",
    set_name: "Paldea Evolved",
    rarity: "Common",
    image_url: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV2/SV2_EN_51.png",
  },
  // Obsidian Flames set
  {
    card_id: "pocket-16",
    name: "Charizard ex",
    set_name: "Obsidian Flames",
    rarity: "Ultra Rare",
    image_url: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV3/SV3_EN_27.png",
  },
  {
    card_id: "pocket-17",
    name: "Tyranitar",
    set_name: "Obsidian Flames",
    rarity: "Rare",
    image_url: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV3/SV3_EN_126.png",
  },
  {
    card_id: "pocket-18",
    name: "Arcanine",
    set_name: "Obsidian Flames",
    rarity: "Rare",
    image_url: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV3/SV3_EN_29.png",
  },
  {
    card_id: "pocket-19",
    name: "Gyarados",
    set_name: "Obsidian Flames",
    rarity: "Rare Holo",
    image_url: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV3/SV3_EN_41.png",
  },
  {
    card_id: "pocket-20",
    name: "Dragonite",
    set_name: "Obsidian Flames",
    rarity: "Ultra Rare",
    image_url: "https://assets.pokemon.com/assets/cms2/img/cards/web/SV3/SV3_EN_58.png",
  },
]

async function seedSampleCards() {
  try {
    console.log("Seeding sample cards...")

    const { data, error } = await supabase.from("cards").upsert(sampleCards, { onConflict: "card_id" })

    if (error) {
      console.error("Error seeding sample cards:", error)
    } else {
      console.log("Successfully seeded sample cards!")
    }
  } catch (error) {
    console.error("Error in seed function:", error)
  }
}

// Run the seed function
seedSampleCards()

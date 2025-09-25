import { createServerSupabaseClient } from "@/lib/supabase-server"
import { CardGrid } from "@/components/card-grid"
import { CardSearch } from "@/components/card-search"

// Custom sorting function for set names
function customSetSort(sets: string[]): string[] {
  return [...sets].sort((a, b) => {
    // Extract the base part (like "A1", "A2", "A4a") and any suffix (like "a", "b")
    const baseA = a.match(/([A-Z]+\d+[a-z]*)/i)?.[0] || a
    const baseB = b.match(/([A-Z]+\d+[a-z]*)/i)?.[0] || b

    // Extract the numeric part from the base
    const numA = Number.parseInt(baseA.replace(/[^0-9]/g, "") || "0", 10)
    const numB = Number.parseInt(baseB.replace(/[^0-9]/g, "") || "0", 10)

    // If numeric parts are different, sort by them in descending order
    if (numA !== numB) {
      return numB - numA
    }

    // If numeric parts are the same, check for suffixes
    const suffixA = a.replace(baseA, "").trim()
    const suffixB = b.replace(baseB, "").trim()

    // Sort by suffix in descending order (b comes before a)
    return suffixB.localeCompare(suffixA)
  })
}

// Function to get all data from Supabase without pagination limits
async function getAllSets(supabase: any) {
  let allData: any[] = []
  let from = 0
  const batchSize = 1000

  while (true) {
    const { data, error } = await supabase
      .from("cards")
      .select("set_name")
      .not("set_name", "is", null)
      .range(from, from + batchSize - 1)

    if (error) {
      console.error("Error fetching batch:", error)
      break
    }

    if (!data || data.length === 0) {
      break
    }

    allData = [...allData, ...data]

    if (data.length < batchSize) {
      // Last batch
      break
    }

    from += batchSize
  }

  return allData
}

export default async function CardsPage({
  searchParams,
}: {
  searchParams: { query?: string; set?: string[] | string; rarity?: string[] | string }
}) {
  const supabase = createServerSupabaseClient()

  let query = supabase.from("cards").select("*")

  if (searchParams.query) {
    query = query.ilike("name", `%${searchParams.query}%`)
  }

  // Handle multiple sets
  if (searchParams.set) {
    const sets = Array.isArray(searchParams.set) ? searchParams.set : [searchParams.set]
    if (sets.length > 0 && sets[0] !== "_all") {
      query = query.in("set_name", sets)
    }
  }

  // Handle multiple rarities
  if (searchParams.rarity) {
    const rarities = Array.isArray(searchParams.rarity) ? searchParams.rarity : [searchParams.rarity]
    if (rarities.length > 0 && rarities[0] !== "_all") {
      query = query.in("rarity", rarities)
    }
  }

  const { data: cards } = await query.order("id")

  // Get all unique set names
  const setsData = await getAllSets(supabase)

  // Get unique rarity values for filter
  const { data: raritiesData } = await supabase.from("cards").select("rarity").not("rarity", "is", null).range(0, 2000)

  // Extract unique sets
  const allSetNames = setsData.map((item) => item.set_name)
  const filteredSetNames = allSetNames.filter((name) => name && name.trim() !== "")
  const uniqueSetNames = [...new Set(filteredSetNames)]

  // Use custom sorting function for sets
  const sortedSets = customSetSort(uniqueSetNames)

  // Get unique rarities
  const uniqueRarities = raritiesData
    ? [...new Set(raritiesData.map((card) => card.rarity).filter((rarity) => rarity && rarity.trim() !== ""))]
    : []

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Cartes Pokémon TCG Pocket</h1>
      <CardSearch sets={sortedSets} rarities={uniqueRarities} />
      <CardGrid cards={cards || []} />
    </div>
  )
}

// Force dynamic rendering to avoid caching issues
export const dynamic = "force-dynamic"
export const revalidate = 0

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

  // Get unique set names for filter - Force fresh data with explicit query
  const { data: setsData, error: setsError } = await supabase
    .from("cards")
    .select("set_name")
    .not("set_name", "is", null)
    .order("set_name")

  // Get unique rarity values for filter
  const { data: raritiesData, error: raritiesError } = await supabase
    .from("cards")
    .select("rarity")
    .not("rarity", "is", null)
    .order("rarity")

  // Debug logging
  console.log("Sets query error:", setsError)
  console.log("Raw sets data (first 20):", setsData?.slice(0, 20))
  console.log("Total sets found:", setsData?.length)

  // Remove duplicates and filter out null/empty values
  const uniqueSets = [
    ...new Set(setsData?.map((card) => card.set_name).filter((name) => name && name.trim() !== "") || []),
  ]

  console.log("Unique sets before sorting:", uniqueSets)

  // Check specifically for A4a or Source
  const targetSets = uniqueSets.filter(
    (set) =>
      set.toLowerCase().includes("a4a") ||
      set.toLowerCase().includes("source") ||
      set.toLowerCase().includes("secrète"),
  )
  console.log("Target sets found:", targetSets)

  // Use custom sorting function for sets
  const sortedSets = customSetSort(uniqueSets)

  console.log("Final sorted sets:", sortedSets)

  // Just get the unique rarities without ordering them
  const uniqueRarities = [
    ...new Set(raritiesData?.map((card) => card.rarity).filter((rarity) => rarity && rarity.trim() !== "") || []),
  ]

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Cartes Pokémon TCG Pocket</h1>

      {/* Debug info visible on page */}
      <div className="mb-4 p-4 bg-gray-100 rounded text-sm">
        <p>
          <strong>Debug Info:</strong>
        </p>
        <p>Total unique sets: {uniqueSets.length}</p>
        <p>Sets containing "A4a", "Source" or "Secrète": {targetSets.join(", ") || "None found"}</p>
        <p>All sets: {sortedSets.slice(0, 10).join(", ")}...</p>
        {setsError && <p className="text-red-600">Error: {setsError.message}</p>}
      </div>

      <CardSearch sets={sortedSets} rarities={uniqueRarities} />
      <CardGrid cards={cards || []} />
    </div>
  )
}

// Force dynamic rendering to avoid caching issues
export const dynamic = "force-dynamic"
export const revalidate = 0

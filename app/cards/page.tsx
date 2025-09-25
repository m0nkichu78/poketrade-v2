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

  // Try multiple approaches to get all sets
  console.log("=== DEBUGGING SETS RETRIEVAL ===")

  // Approach 1: Get all distinct set_name values
  const { data: setsData1, error: setsError1 } = await supabase
    .from("cards")
    .select("set_name")
    .not("set_name", "is", null)

  console.log("Approach 1 - All set_name values:")
  console.log("Error:", setsError1)
  console.log("Count:", setsData1?.length)
  console.log("Sample data:", setsData1?.slice(0, 10))

  // Approach 2: Get all cards and extract set names
  const { data: allCards, error: allCardsError } = await supabase
    .from("cards")
    .select("id, set_name")
    .not("set_name", "is", null)

  console.log("Approach 2 - All cards with set_name:")
  console.log("Error:", allCardsError)
  console.log("Count:", allCards?.length)

  // Check for specific sets
  const a4Sets = allCards?.filter(
    (card) => card.set_name?.includes("A4") || card.set_name?.includes("Source") || card.set_name?.includes("Sagesse"),
  )
  console.log("Cards with A4, Source, or Sagesse:", a4Sets)

  // Approach 3: Raw SQL query to get distinct set names
  const { data: distinctSets, error: distinctError } = await supabase.rpc("get_distinct_sets").catch(async () => {
    // Fallback if RPC doesn't exist
    return await supabase.from("cards").select("set_name").not("set_name", "is", null)
  })

  console.log("Approach 3 - Distinct sets:")
  console.log("Error:", distinctError)
  console.log("Data:", distinctSets)

  // Get unique rarity values for filter
  const { data: raritiesData, error: raritiesError } = await supabase
    .from("cards")
    .select("rarity")
    .not("rarity", "is", null)

  // Use the most comprehensive data source
  const rawSets = allCards || setsData1 || []

  // Remove duplicates and filter out null/empty values
  const uniqueSets = [
    ...new Set(
      rawSets
        .map((item) => {
          const setName = "set_name" in item ? item.set_name : item
          return setName
        })
        .filter((name) => name && name.trim() !== ""),
    ),
  ]

  console.log("Final unique sets:", uniqueSets)

  // Check specifically for missing sets
  const targetSets = uniqueSets.filter(
    (set) =>
      set.toLowerCase().includes("a4") || set.toLowerCase().includes("source") || set.toLowerCase().includes("sagesse"),
  )
  console.log("Target sets found:", targetSets)

  // Use custom sorting function for sets
  const sortedSets = customSetSort(uniqueSets)

  console.log("Final sorted sets:", sortedSets)

  // Just get the unique rarities
  const uniqueRarities = [
    ...new Set(raritiesData?.map((card) => card.rarity).filter((rarity) => rarity && rarity.trim() !== "") || []),
  ]

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Cartes Pokémon TCG Pocket</h1>

      {/* Enhanced debug info */}
      <div className="mb-4 p-4 bg-gray-100 rounded text-sm space-y-2">
        <p>
          <strong>Debug Info:</strong>
        </p>
        <p>Total cards in database: {allCards?.length || 0}</p>
        <p>Total unique sets: {uniqueSets.length}</p>
        <p>Sets containing "A4", "Source" or "Sagesse": {targetSets.join(", ") || "None found"}</p>
        <p>All sets: {sortedSets.join(", ")}</p>
        {(setsError1 || allCardsError || raritiesError) && (
          <p className="text-red-600">
            Errors:{" "}
            {[setsError1, allCardsError, raritiesError]
              .filter(Boolean)
              .map((e) => e?.message)
              .join(", ")}
          </p>
        )}
        <details className="mt-2">
          <summary className="cursor-pointer font-medium">Raw data (click to expand)</summary>
          <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(
              {
                uniqueSets,
                sampleCards: allCards?.slice(0, 5),
                a4Cards: a4Sets,
              },
              null,
              2,
            )}
          </pre>
        </details>
      </div>

      <CardSearch sets={sortedSets} rarities={uniqueRarities} />
      <CardGrid cards={cards || []} />
    </div>
  )
}

// Force dynamic rendering to avoid caching issues
export const dynamic = "force-dynamic"
export const revalidate = 0

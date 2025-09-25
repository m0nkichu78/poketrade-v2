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

  console.log("=== DEBUGGING SETS RETRIEVAL ===")

  // Get all cards with their set names
  const { data: allCards, error: allCardsError } = await supabase
    .from("cards")
    .select("id, set_name")
    .not("set_name", "is", null)

  console.log("All cards query:")
  console.log("Error:", allCardsError)
  console.log("Count:", allCards?.length)

  if (allCards && allCards.length > 0) {
    // Check for specific sets we're looking for
    const a4Sets = allCards.filter(
      (card) =>
        card.set_name?.includes("A4") ||
        card.set_name?.toLowerCase().includes("source") ||
        card.set_name?.toLowerCase().includes("sagesse") ||
        card.set_name?.toLowerCase().includes("secrète"),
    )
    console.log("Cards with A4, Source, Sagesse, or Secrète:", a4Sets)

    // Search for any set containing "a4a" specifically
    const a4aSets = allCards.filter(
      (card) =>
        card.set_name?.toLowerCase().includes("a4a") ||
        card.set_name?.toLowerCase().includes("source secrète") ||
        card.set_name?.toLowerCase().includes("source secrete"),
    )
    console.log("Cards specifically with A4a or Source Secrète:", a4aSets)

    // Show all unique set names
    const allSetNames = [...new Set(allCards.map((card) => card.set_name))].sort()
    console.log("All unique set names in database:", allSetNames)
  }

  // Also search for cards that might have the set we're looking for
  const { data: sourceCards, error: sourceError } = await supabase
    .from("cards")
    .select("id, set_name, name")
    .or("set_name.ilike.%source%,set_name.ilike.%secrète%,set_name.ilike.%a4a%")

  console.log("Cards with 'source', 'secrète', or 'a4a' in set_name:", sourceCards)

  // Get unique rarity values for filter
  const { data: raritiesData, error: raritiesError } = await supabase
    .from("cards")
    .select("rarity")
    .not("rarity", "is", null)

  // Extract unique sets from all cards
  const uniqueSets = allCards
    ? [...new Set(allCards.map((card) => card.set_name).filter((name) => name && name.trim() !== ""))]
    : []

  console.log("Final unique sets:", uniqueSets)

  // Check specifically for missing sets
  const targetSets = uniqueSets.filter(
    (set) =>
      set.toLowerCase().includes("a4") ||
      set.toLowerCase().includes("source") ||
      set.toLowerCase().includes("sagesse") ||
      set.toLowerCase().includes("secrète"),
  )
  console.log("Target sets found:", targetSets)

  // Use custom sorting function for sets
  const sortedSets = customSetSort(uniqueSets)

  console.log("Final sorted sets:", sortedSets)

  // Just get the unique rarities
  const uniqueRarities = raritiesData
    ? [...new Set(raritiesData.map((card) => card.rarity).filter((rarity) => rarity && rarity.trim() !== ""))]
    : []

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
        <p>Sets containing "A4", "Source", "Sagesse" or "Secrète": {targetSets.join(", ") || "None found"}</p>
        <p>Cards with 'source', 'secrète', or 'a4a': {sourceCards?.length || 0}</p>
        <p>All sets: {sortedSets.join(", ")}</p>

        {(allCardsError || raritiesError || sourceError) && (
          <p className="text-red-600">
            Errors:{" "}
            {[allCardsError, raritiesError, sourceError]
              .filter(Boolean)
              .map((e) => e?.message)
              .join(", ")}
          </p>
        )}

        <details className="mt-2">
          <summary className="cursor-pointer font-medium">All sets in database (click to expand)</summary>
          <div className="mt-2 text-xs bg-white p-2 rounded max-h-40 overflow-auto">
            {uniqueSets.map((set, index) => (
              <div key={index} className="py-1 border-b border-gray-200 last:border-b-0">
                {set}
              </div>
            ))}
          </div>
        </details>

        {sourceCards && sourceCards.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer font-medium">
              Cards with 'source', 'secrète', or 'a4a' (click to expand)
            </summary>
            <div className="mt-2 text-xs bg-white p-2 rounded max-h-40 overflow-auto">
              {sourceCards.map((card, index) => (
                <div key={index} className="py-1 border-b border-gray-200 last:border-b-0">
                  <strong>{card.set_name}</strong> - {card.name} (ID: {card.id})
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      <CardSearch sets={sortedSets} rarities={uniqueRarities} />
      <CardGrid cards={cards || []} />
    </div>
  )
}

// Force dynamic rendering to avoid caching issues
export const dynamic = "force-dynamic"
export const revalidate = 0

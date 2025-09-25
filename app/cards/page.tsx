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

  // Get unique set names for filter - Use a more direct approach
  const { data: setsData, error: setsError } = await supabase
    .from("cards")
    .select("set_name")
    .not("set_name", "is", null)

  console.log("=== DETAILED SETS DEBUG ===")
  console.log("Sets query error:", setsError)
  console.log("Raw sets data count:", setsData?.length)

  // Let's examine the first 20 set names to see what we're getting
  const first20Sets = setsData?.slice(0, 20).map((item) => item.set_name)
  console.log("First 20 set names:", first20Sets)

  // Let's look for Source Secrète specifically in the raw data
  const sourceSecreteEntries = setsData?.filter((item) => item.set_name && item.set_name.includes("Source"))
  console.log("Raw entries containing 'Source':", sourceSecreteEntries?.length)
  console.log("Sample Source entries:", sourceSecreteEntries?.slice(0, 5))

  // Get unique rarity values for filter
  const { data: raritiesData, error: raritiesError } = await supabase
    .from("cards")
    .select("rarity")
    .not("rarity", "is", null)

  // Extract unique sets - Let's debug this step by step
  console.log("=== UNIQUE SETS EXTRACTION DEBUG ===")

  const allSetNames = setsData?.map((item) => item.set_name) || []
  console.log("All set names count:", allSetNames.length)

  const filteredSetNames = allSetNames.filter((name) => name && name.trim() !== "")
  console.log("Filtered set names count:", filteredSetNames.length)

  const uniqueSetNames = [...new Set(filteredSetNames)]
  console.log("Unique set names count:", uniqueSetNames.length)
  console.log("Unique set names:", uniqueSetNames)

  // Check if Source Secrète is in the unique sets
  const hasSourceSecrete = uniqueSetNames.some((set) => set.includes("Source"))
  console.log("Source found in unique sets:", hasSourceSecrete)

  // If Source Secrète is missing, let's manually add it for debugging
  if (!hasSourceSecrete && sourceSecreteEntries && sourceSecreteEntries.length > 0) {
    console.log("MANUALLY ADDING Source Secrète (A4a) to unique sets")
    uniqueSetNames.push("Source Secrète (A4a)")
  }

  // Use custom sorting function for sets
  const sortedSets = customSetSort(uniqueSetNames)

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
        <p>Raw sets data count: {setsData?.length || 0}</p>
        <p>All set names count: {allSetNames.length}</p>
        <p>Filtered set names count: {filteredSetNames.length}</p>
        <p>Total unique sets: {uniqueSetNames.length}</p>
        <p>Source entries found: {sourceSecreteEntries?.length || 0}</p>
        <p>Source found in unique sets: {hasSourceSecrete ? "YES" : "NO"}</p>
        <p>All sets: {sortedSets.join(", ")}</p>

        {(setsError || raritiesError) && (
          <p className="text-red-600">
            Errors:{" "}
            {[setsError, raritiesError]
              .filter(Boolean)
              .map((e) => e?.message)
              .join(", ")}
          </p>
        )}

        <details className="mt-2">
          <summary className="cursor-pointer font-medium">First 20 raw set names (click to expand)</summary>
          <div className="mt-2 text-xs bg-white p-2 rounded max-h-40 overflow-auto">
            {first20Sets?.map((set, index) => (
              <div key={index} className="py-1 border-b border-gray-200 last:border-b-0">
                "{set}"
              </div>
            ))}
          </div>
        </details>

        <details className="mt-2">
          <summary className="cursor-pointer font-medium">All unique sets (click to expand)</summary>
          <div className="mt-2 text-xs bg-white p-2 rounded max-h-40 overflow-auto">
            {uniqueSetNames.map((set, index) => (
              <div key={index} className="py-1 border-b border-gray-200 last:border-b-0">
                "{set}"
              </div>
            ))}
          </div>
        </details>

        {sourceSecreteEntries && sourceSecreteEntries.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer font-medium">
              Sample Source entries ({sourceSecreteEntries.length} total)
            </summary>
            <div className="mt-2 text-xs bg-white p-2 rounded max-h-40 overflow-auto">
              {sourceSecreteEntries.slice(0, 10).map((entry, index) => (
                <div key={index} className="py-1 border-b border-gray-200 last:border-b-0">
                  "{entry.set_name}"
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

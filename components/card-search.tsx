"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, X, ChevronDown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

// Define the ordered list of rarities
const RARITY_ORDER = [
  "Common",
  "Uncommon",
  "Rare",
  "Double Rare",
  "Art Rare",
  "Full Art",
  "Rainbow",
  "Immersive",
  "Gold",
]

export function CardSearch({
  sets,
  rarities,
}: {
  sets: string[]
  rarities: string[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Form state
  const [query, setQuery] = useState(searchParams.get("query") || "")
  const [selectedSets, setSelectedSets] = useState<string[]>([])
  const [selectedRarities, setSelectedRarities] = useState<string[]>([])
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  // UI state
  const [setsOpen, setSetsOpen] = useState(false)
  const [raritiesOpen, setRaritiesOpen] = useState(false)

  // Sync with URL params
  useEffect(() => {
    setQuery(searchParams.get("query") || "")

    // Handle multiple sets from URL
    const setsParam = searchParams.getAll("set")
    if (setsParam.length > 0) {
      setSelectedSets(setsParam)
    } else {
      setSelectedSets([])
    }

    // Handle multiple rarities from URL
    const raritiesParam = searchParams.getAll("rarity")
    if (raritiesParam.length > 0) {
      setSelectedRarities(raritiesParam)
    } else {
      setSelectedRarities([])
    }
  }, [searchParams])

  // Debounce query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Auto-refresh on filter changes
  useEffect(() => {
    const params = new URLSearchParams()

    if (debouncedQuery) {
      params.set("query", debouncedQuery)
    }

    // Add multiple sets to URL params
    selectedSets.forEach((set) => {
      params.append("set", set)
    })

    // Add multiple rarities to URL params
    selectedRarities.forEach((rarity) => {
      params.append("rarity", rarity)
    })

    const url = `/cards${params.toString() ? `?${params.toString()}` : ""}`
    router.push(url)
  }, [debouncedQuery, selectedSets, selectedRarities, router])

  // Sort rarities in predefined order
  const sortedRarities = useMemo(() => {
    const availableRaritiesSet = new Set(rarities)
    const orderedRarities = RARITY_ORDER.filter((rarity) => availableRaritiesSet.has(rarity))
    const otherRarities = rarities.filter((rarity) => !RARITY_ORDER.includes(rarity))
    return [...orderedRarities, ...otherRarities]
  }, [rarities])

  // Toggle set selection
  const toggleSet = (set: string) => {
    setSelectedSets((prev) => (prev.includes(set) ? prev.filter((s) => s !== set) : [...prev, set]))
  }

  // Toggle rarity selection
  const toggleRarity = (rarity: string) => {
    setSelectedRarities((prev) => (prev.includes(rarity) ? prev.filter((r) => r !== rarity) : [...prev, rarity]))
  }

  // Remove a specific set
  const removeSet = (set: string) => {
    setSelectedSets((prev) => prev.filter((s) => s !== set))
  }

  // Remove a specific rarity
  const removeRarity = (rarity: string) => {
    setSelectedRarities((prev) => prev.filter((r) => r !== rarity))
  }

  // Form submission handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()
    if (query) params.set("query", query)

    selectedSets.forEach((set) => {
      params.append("set", set)
    })

    selectedRarities.forEach((rarity) => {
      params.append("rarity", rarity)
    })

    router.push(`/cards${params.toString() ? `?${params.toString()}` : ""}`)
  }

  // Reset filters
  const handleReset = () => {
    setQuery("")
    setSelectedSets([])
    setSelectedRarities([])
    router.push("/cards")
  }

  return (
    <div className="mb-8 space-y-4">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Input
            placeholder="Rechercher des cartes par nom..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            aria-label="Rechercher des cartes par nom"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <Popover open={setsOpen} onOpenChange={setSetsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full md:w-[200px] justify-between" aria-label="Filtrer par séries">
              Séries
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <ScrollArea className="h-[300px]">
              <div className="p-2">
                {sets.map((set) => (
                  <div key={set} className="flex items-start space-x-2 py-1">
                    <Checkbox
                      id={`set-${set}`}
                      checked={selectedSets.includes(set)}
                      onCheckedChange={() => toggleSet(set)}
                      className="mt-1"
                    />
                    <label htmlFor={`set-${set}`} className="text-sm flex-1 cursor-pointer">
                      {set}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        <Popover open={raritiesOpen} onOpenChange={setRaritiesOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full md:w-[200px] justify-between" aria-label="Filtrer par raretés">
              Raretés
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <ScrollArea className="h-[300px]">
              <div className="p-2">
                {sortedRarities.map((rarity) => (
                  <div key={rarity} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`rarity-${rarity}`}
                      checked={selectedRarities.includes(rarity)}
                      onCheckedChange={() => toggleRarity(rarity)}
                    />
                    <label htmlFor={`rarity-${rarity}`} className="text-sm flex-1 cursor-pointer">
                      {rarity}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        <Button type="submit" aria-label="Rechercher">
          Rechercher
        </Button>

        {(query || selectedSets.length > 0 || selectedRarities.length > 0) && (
          <Button type="button" variant="outline" onClick={handleReset} aria-label="Réinitialiser les filtres">
            <X className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        )}
      </form>

      {/* Selected filters display */}
      {(selectedSets.length > 0 || selectedRarities.length > 0) && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedSets.map((set) => (
            <Badge key={set} variant="secondary" className="px-2 py-1">
              {set}
              <button
                onClick={() => removeSet(set)}
                className="ml-1 hover:text-destructive"
                aria-label={`Supprimer le filtre ${set}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {selectedRarities.map((rarity) => (
            <Badge key={rarity} variant="secondary" className="px-2 py-1">
              {rarity}
              <button
                onClick={() => removeRarity(rarity)}
                className="ml-1 hover:text-destructive"
                aria-label={`Supprimer le filtre ${rarity}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

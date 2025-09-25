"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, X, RefreshCw } from "lucide-react"
import { cardService } from "@/lib/card-service"

interface CardSearchProps {
  onSearch: (filters: {
    search: string
    sets: string[]
    rarities: string[]
  }) => void
  isLoading?: boolean
}

export function CardSearch({ onSearch, isLoading = false }: CardSearchProps) {
  const [search, setSearch] = useState("")
  const [selectedSets, setSelectedSets] = useState<string[]>([])
  const [selectedRarities, setSelectedRarities] = useState<string[]>([])
  const [availableSets, setAvailableSets] = useState<string[]>([])
  const [availableRarities, setAvailableRarities] = useState<string[]>([])
  const [isLoadingFilters, setIsLoadingFilters] = useState(true)

  // Charger les sets et raretés disponibles
  const loadFilters = async () => {
    setIsLoadingFilters(true)
    try {
      const [setsResult, raritiesResult] = await Promise.all([
        cardService.getUniqueSets(),
        cardService.getUniqueRarities(),
      ])

      if (setsResult.data) {
        // Trier les sets par ordre alphabétique
        const sortedSets = setsResult.data.sort((a, b) => a.localeCompare(b))
        setAvailableSets(sortedSets)
      }

      if (raritiesResult.data) {
        // Trier les raretés par ordre alphabétique
        const sortedRarities = raritiesResult.data.sort((a, b) => a.localeCompare(b))
        setAvailableRarities(sortedRarities)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des filtres:", error)
    } finally {
      setIsLoadingFilters(false)
    }
  }

  useEffect(() => {
    loadFilters()
  }, [])

  // Fonction pour rafraîchir les filtres
  const refreshFilters = () => {
    loadFilters()
  }

  const handleSearch = () => {
    onSearch({
      search: search.trim(),
      sets: selectedSets,
      rarities: selectedRarities,
    })
  }

  const handleClear = () => {
    setSearch("")
    setSelectedSets([])
    setSelectedRarities([])
    onSearch({
      search: "",
      sets: [],
      rarities: [],
    })
  }

  const handleSetChange = (setName: string, checked: boolean) => {
    if (checked) {
      setSelectedSets((prev) => [...prev, setName])
    } else {
      setSelectedSets((prev) => prev.filter((s) => s !== setName))
    }
  }

  const handleRarityChange = (rarity: string, checked: boolean) => {
    if (checked) {
      setSelectedRarities((prev) => [...prev, rarity])
    } else {
      setSelectedRarities((prev) => prev.filter((r) => r !== rarity))
    }
  }

  // Déclencher la recherche automatiquement quand les filtres changent
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch()
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timeoutId)
  }, [search, selectedSets, selectedRarities])

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Rechercher des cartes
          </CardTitle>
          <Button variant="outline" size="sm" onClick={refreshFilters} disabled={isLoadingFilters}>
            <RefreshCw className={`h-4 w-4 ${isLoadingFilters ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Barre de recherche */}
        <div className="space-y-2">
          <Label htmlFor="search">Nom de la carte</Label>
          <div className="relative">
            <Input
              id="search"
              placeholder="Rechercher par nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
            {search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setSearch("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Filtres par set */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Sets ({availableSets.length})</Label>
              {isLoadingFilters && <div className="text-sm text-muted-foreground">Chargement...</div>}
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-3">
              {availableSets.length === 0 && !isLoadingFilters ? (
                <div className="text-sm text-muted-foreground">Aucun set disponible</div>
              ) : (
                availableSets.map((set) => (
                  <div key={set} className="flex items-center space-x-2">
                    <Checkbox
                      id={`set-${set}`}
                      checked={selectedSets.includes(set)}
                      onCheckedChange={(checked) => handleSetChange(set, checked as boolean)}
                    />
                    <Label htmlFor={`set-${set}`} className="text-sm font-normal cursor-pointer flex-1">
                      {set}
                    </Label>
                  </div>
                ))
              )}
            </div>
            {selectedSets.length > 0 && (
              <div className="text-sm text-muted-foreground">{selectedSets.length} set(s) sélectionné(s)</div>
            )}
          </div>

          {/* Filtres par rareté */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Raretés ({availableRarities.length})</Label>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-3">
              {availableRarities.length === 0 && !isLoadingFilters ? (
                <div className="text-sm text-muted-foreground">Aucune rareté disponible</div>
              ) : (
                availableRarities.map((rarity) => (
                  <div key={rarity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rarity-${rarity}`}
                      checked={selectedRarities.includes(rarity)}
                      onCheckedChange={(checked) => handleRarityChange(rarity, checked as boolean)}
                    />
                    <Label htmlFor={`rarity-${rarity}`} className="text-sm font-normal cursor-pointer flex-1">
                      {rarity}
                    </Label>
                  </div>
                ))
              )}
            </div>
            {selectedRarities.length > 0 && (
              <div className="text-sm text-muted-foreground">{selectedRarities.length} rareté(s) sélectionnée(s)</div>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSearch} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Recherche...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Rechercher
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleClear}>
            <X className="mr-2 h-4 w-4" />
            Effacer
          </Button>
        </div>

        {/* Résumé des filtres actifs */}
        {(search || selectedSets.length > 0 || selectedRarities.length > 0) && (
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground mb-2">Filtres actifs :</div>
            <div className="flex flex-wrap gap-2">
              {search && <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">Nom: "{search}"</div>}
              {selectedSets.map((set) => (
                <div key={set} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                  Set: {set}
                </div>
              ))}
              {selectedRarities.map((rarity) => (
                <div key={rarity} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm">
                  Rareté: {rarity}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

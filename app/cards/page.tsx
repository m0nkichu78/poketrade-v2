"use client"

import { useState, useEffect } from "react"
import { CardGrid } from "@/components/card-grid"
import { CardSearch } from "@/components/card-search"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, RefreshCw } from "lucide-react"
import { cardService, type Card as CardType } from "@/lib/card-service"

const CARDS_PER_PAGE = 20

export default function CardsPage() {
  const [cards, setCards] = useState<CardType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    search: "",
    sets: [] as string[],
    rarities: [] as string[],
  })

  // Fonction pour charger les cartes
  const loadCards = async (page = 0, newFilters = filters, append = false) => {
    try {
      if (!append) {
        setIsLoading(true)
        setError(null)
      } else {
        setIsLoadingMore(true)
      }

      const { data, count, error } = await cardService.getAllCards({
        search: newFilters.search || undefined,
        set: newFilters.sets.length > 0 ? newFilters.sets : undefined,
        rarity: newFilters.rarities.length > 0 ? newFilters.rarities : undefined,
        limit: CARDS_PER_PAGE,
        offset: page * CARDS_PER_PAGE,
      })

      if (error) {
        throw new Error(error.message || "Erreur lors du chargement des cartes")
      }

      if (data) {
        if (append) {
          setCards((prev) => [...prev, ...data])
        } else {
          setCards(data)
        }
        setTotalCount(count || 0)
        setHasMore(data.length === CARDS_PER_PAGE && (page + 1) * CARDS_PER_PAGE < (count || 0))
        setCurrentPage(page)
      }
    } catch (err) {
      console.error("Erreur lors du chargement des cartes:", err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
      if (!append) {
        setCards([])
        setTotalCount(0)
      }
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  // Charger les cartes au montage du composant
  useEffect(() => {
    loadCards(0, filters, false)
  }, [])

  // Fonction appelée par le composant de recherche
  const handleSearch = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setCurrentPage(0)
    loadCards(0, newFilters, false)
  }

  // Charger plus de cartes
  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = currentPage + 1
      loadCards(nextPage, filters, true)
    }
  }

  // Fonction pour rafraîchir toutes les données
  const refreshAll = async () => {
    await cardService.refreshCache()
    loadCards(0, filters, false)
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-destructive">Erreur</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => loadCards(0, filters, false)} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Cartes Pokémon</h1>
            <p className="text-muted-foreground">
              {totalCount > 0
                ? `${totalCount} carte${totalCount > 1 ? "s" : ""} disponible${totalCount > 1 ? "s" : ""}`
                : "Aucune carte trouvée"}
            </p>
          </div>
          <Button onClick={refreshAll} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser tout
          </Button>
        </div>
      </div>

      <CardSearch onSearch={handleSearch} isLoading={isLoading} />

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Chargement des cartes...</span>
            </div>
          </CardContent>
        </Card>
      ) : cards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">Aucune carte trouvée</h2>
              <p className="text-muted-foreground">
                {filters.search || filters.sets.length > 0 || filters.rarities.length > 0
                  ? "Essayez de modifier vos critères de recherche"
                  : "Aucune carte n'est disponible pour le moment"}
              </p>
              {(filters.search || filters.sets.length > 0 || filters.rarities.length > 0) && (
                <Button onClick={() => handleSearch({ search: "", sets: [], rarities: [] })} variant="outline">
                  Effacer les filtres
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <CardGrid cards={cards} />

          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button onClick={loadMore} disabled={isLoadingMore} variant="outline">
                {isLoadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  `Charger plus (${cards.length}/${totalCount})`
                )}
              </Button>
            </div>
          )}

          {!hasMore && cards.length > 0 && (
            <div className="text-center mt-8 text-muted-foreground">
              Toutes les cartes ont été chargées ({totalCount} au total)
            </div>
          )}
        </>
      )}
    </div>
  )
}

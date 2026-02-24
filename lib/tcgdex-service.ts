const TCGDEX_BASE_URL = "https://api.tcgdex.net/v2/fr"
const TCGP_SERIES_ID = "tcgp"

// Types basés sur les réponses de l'API TCGdex
export interface TcgdexSetSummary {
  id: string
  name: string
  cardCount: {
    official: number
    total: number
  }
  symbol?: string
}

export interface TcgdexSeries {
  id: string
  name: string
  sets: TcgdexSetSummary[]
}

export interface TcgdexCardSummary {
  id: string
  localId: string
  name: string
  image: string
}

export interface TcgdexSet {
  id: string
  name: string
  cardCount: {
    official: number
    total: number
  }
  cards: TcgdexCardSummary[]
}

export interface TcgdexBooster {
  id: string
  name: string
}

export interface TcgdexCardFull {
  id: string
  localId: string
  name: string
  image: string
  rarity?: string
  category?: string
  set: {
    id: string
    name: string
  }
  hp?: number
  types?: string[]
  stage?: string
  description?: string
  boosters?: TcgdexBooster[]
  updated?: string
}

// Carte formatée prête pour l'insertion en base de données
export interface FormattedCard {
  id: string
  name: string
  set_name: string
  set_id: string
  rarity: string | null
  card_number: string
  image_url: string
  boosters: string[] | null
  tcgdex_updated_at: string | null
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) {
    throw new Error(`TCGdex API error: ${res.status} ${res.statusText} for ${url}`)
  }
  return res.json()
}

export const tcgdexService = {
  /**
   * Récupère toutes les extensions TCG Pocket
   */
  async getSets(): Promise<TcgdexSetSummary[]> {
    const series = await fetchJson<TcgdexSeries>(
      `${TCGDEX_BASE_URL}/series/${TCGP_SERIES_ID}`
    )
    return series.sets
  },

  /**
   * Récupère la liste des cartes d'une extension (résumé seulement)
   */
  async getSetCards(setId: string): Promise<TcgdexSet> {
    return fetchJson<TcgdexSet>(`${TCGDEX_BASE_URL}/sets/${setId}`)
  },

  /**
   * Récupère les détails complets d'une carte
   */
  async getCardFull(cardId: string): Promise<TcgdexCardFull> {
    return fetchJson<TcgdexCardFull>(`${TCGDEX_BASE_URL}/cards/${cardId}`)
  },

  /**
   * Récupère et formate toutes les cartes d'une extension
   * Fait des requêtes par batch pour éviter de surcharger l'API
   */
  async fetchAndFormatSetCards(
    setId: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<FormattedCard[]> {
    // 1. Récupérer la liste des cartes de l'extension
    const set = await this.getSetCards(setId)
    const cardSummaries = set.cards
    const totalCards = cardSummaries.length
    const formattedCards: FormattedCard[] = []

    // 2. Récupérer les détails de chaque carte par batch de 10
    const BATCH_SIZE = 10
    for (let i = 0; i < totalCards; i += BATCH_SIZE) {
      const batch = cardSummaries.slice(i, i + BATCH_SIZE)

      const cardDetails = await Promise.all(
        batch.map((card) =>
          this.getCardFull(card.id).catch((err) => {
            console.error(`Error fetching card ${card.id}:`, err)
            return null
          })
        )
      )

      for (const card of cardDetails) {
        if (!card) continue

        formattedCards.push({
          id: card.id,
          name: card.name,
          set_name: card.set.name,
          set_id: card.set.id,
          rarity: card.rarity || null,
          card_number: card.localId,
          image_url: card.image ? `${card.image}/high.webp` : "",
          boosters: card.boosters?.map((b) => b.name) || null,
          tcgdex_updated_at: card.updated || null,
        })
      }

      onProgress?.(Math.min(i + BATCH_SIZE, totalCards), totalCards)

      // Petite pause entre les batches pour ne pas surcharger l'API
      if (i + BATCH_SIZE < totalCards) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }

    return formattedCards
  },
}

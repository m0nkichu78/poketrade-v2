import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface Card {
  id: string
  name: string
  set_name: string
  rarity: string | null
  image_url: string
}

interface CardItem {
  id: number
  card: Card
}

interface GroupedCardListProps {
  cardsByRarity: Record<string, CardItem[]>
  emptyMessage?: string
}

export function GroupedCardList({ cardsByRarity, emptyMessage = "Aucune carte trouvée" }: GroupedCardListProps) {
  const rarityEntries = Object.entries(cardsByRarity)

  if (rarityEntries.length === 0) {
    return <p className="text-center text-muted-foreground py-4">{emptyMessage}</p>
  }

  return (
    <>
      {rarityEntries.map(([rarity, cards]) => (
        <div key={`rarity-${rarity}`} className="mb-6">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <Badge variant="outline" className="mr-2">
              {rarity === "Unknown" ? "Sans rareté" : rarity}
            </Badge>
            <span>{cards.length} carte(s)</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cards.map(({ id, card }) => (
              <Link key={id} href={`/cards/${card.id}`} className="group">
                <div className="border rounded-lg overflow-hidden transition-all group-hover:shadow-md">
                  <div className="aspect-[2/3] relative">
                    <Image
                      src={card.image_url || "/placeholder.svg?height=300&width=200"}
                      alt={card.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <div className="text-sm font-medium truncate">{card.name}</div>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs truncate">
                        {card.set_name}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

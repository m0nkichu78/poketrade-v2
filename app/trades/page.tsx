import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"

// Interface pour les cartes
interface CardItem {
  id: number
  card: {
    id: string
    name: string
    set_name: string
    rarity: string | null
    image_url: string
  }
}

// Interface pour les utilisateurs
interface UserInfo {
  id: string
  in_game_name: string
  in_game_id: string
}

// Interface pour les correspondances
interface TradeMatch {
  user: UserInfo
  theyHave: CardItem[]
  theyWant: CardItem[]
  matchesByRarity: Record<string, { theyHave: CardItem[]; theyWant: CardItem[] }>
}

// Fonction pour regrouper les cartes par rareté
function groupCardsByRarity(cards: CardItem[]): Record<string, CardItem[]> {
  return cards.reduce(
    (groups, card) => {
      const rarity = card.card.rarity || "Unknown"
      if (!groups[rarity]) {
        groups[rarity] = []
      }
      groups[rarity].push(card)
      return groups
    },
    {} as Record<string, CardItem[]>,
  )
}

// Fonction pour trouver les correspondances de même rareté
function findSameRarityMatches(
  theyHave: CardItem[],
  theyWant: CardItem[],
): Record<string, { theyHave: CardItem[]; theyWant: CardItem[] }> {
  const theyHaveByRarity = groupCardsByRarity(theyHave)
  const theyWantByRarity = groupCardsByRarity(theyWant)

  const matchesByRarity: Record<string, { theyHave: CardItem[]; theyWant: CardItem[] }> = {}

  // Pour chaque rareté qu'ils ont
  Object.keys(theyHaveByRarity).forEach((rarity) => {
    // Si nous voulons aussi des cartes de cette rareté
    if (theyWantByRarity[rarity]) {
      matchesByRarity[rarity] = {
        theyHave: theyHaveByRarity[rarity],
        theyWant: theyWantByRarity[rarity],
      }
    }
  })

  return matchesByRarity
}

export default async function TradesPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Si non connecté, afficher une vue différente
  if (!session) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Espace d'Échanges</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Connectez-vous pour voir les échanges potentiels avec d'autres joueurs basés sur votre liste de souhaits et
          vos échanges.
        </p>
        <Button asChild size="lg">
          <Link href="/login">Se Connecter</Link>
        </Button>
      </div>
    )
  }

  // Récupérer ma liste de souhaits (cartes que je veux)
  const { data: myWishlist } = await supabase
    .from("wishlists")
    .select(`
      id,
      card_id,
      cards (
        id,
        name,
        set_name,
        rarity,
        image_url
      )
    `)
    .eq("user_id", session.user.id)

  // Récupérer mes listes d'échange (cartes que j'ai)
  const { data: myTradeListings } = await supabase
    .from("trade_listings")
    .select(`
      id,
      card_id,
      cards (
        id,
        name,
        set_name,
        rarity,
        image_url
      )
    `)
    .eq("user_id", session.user.id)

  const myWishlistCardIds = myWishlist?.map((item) => item.card_id) || []
  const myTradeCardIds = myTradeListings?.map((item) => item.card_id) || []

  // Si l'utilisateur n'a ni wishlist ni trade listings
  if (myWishlistCardIds.length === 0 && myTradeCardIds.length === 0) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Espace d'Échanges</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Pour voir les échanges potentiels, vous devez d'abord ajouter des cartes à votre liste de souhaits ou à vos
          échanges.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/cards">Parcourir les Cartes</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/my-trades">Mes Échanges</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/wishlist">Ma Liste de Souhaits</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Récupérer tous les autres utilisateurs avec leurs trade listings et wishlists
  const { data: otherUsersData } = await supabase
    .from("users")
    .select(`
      id,
      in_game_name,
      in_game_id,
      trade_listings (
        id,
        card_id,
        cards (
          id,
          name,
          set_name,
          rarity,
          image_url
        )
      ),
      wishlists (
        id,
        card_id,
        cards (
          id,
          name,
          set_name,
          rarity,
          image_url
        )
      )
    `)
    .neq("id", session.user.id)

  // Traiter les données pour créer les correspondances
  const allMatches: TradeMatch[] = []
  const usersWithCardsIWant: Record<string, TradeMatch> = {}
  const usersWhoWantMyCards: Record<string, TradeMatch> = {}

  otherUsersData?.forEach((user) => {
    const userInfo: UserInfo = {
      id: user.id,
      in_game_name: user.in_game_name || "",
      in_game_id: user.in_game_id || "",
    }

    // Cartes qu'ils ont et que je veux
    const cardsTheyHaveThatIWant: CardItem[] = []
    user.trade_listings?.forEach((listing) => {
      if (myWishlistCardIds.includes(listing.card_id) && listing.cards) {
        cardsTheyHaveThatIWant.push({
          id: listing.id,
          card: listing.cards,
        })
      }
    })

    // Cartes qu'ils veulent et que j'ai
    const cardsTheyWantThatIHave: CardItem[] = []
    user.wishlists?.forEach((wishlist) => {
      if (myTradeCardIds.includes(wishlist.card_id) && wishlist.cards) {
        cardsTheyWantThatIHave.push({
          id: wishlist.id,
          card: wishlist.cards,
        })
      }
    })

    // Si ils ont des cartes que je veux
    if (cardsTheyHaveThatIWant.length > 0) {
      usersWithCardsIWant[user.id] = {
        user: userInfo,
        theyHave: cardsTheyHaveThatIWant,
        theyWant: [],
        matchesByRarity: {},
      }
    }

    // Si ils veulent des cartes que j'ai
    if (cardsTheyWantThatIHave.length > 0) {
      usersWhoWantMyCards[user.id] = {
        user: userInfo,
        theyHave: [],
        theyWant: cardsTheyWantThatIHave,
        matchesByRarity: {},
      }
    }

    // Si c'est une correspondance parfaite (ils ont des cartes que je veux ET ils veulent des cartes que j'ai)
    if (cardsTheyHaveThatIWant.length > 0 && cardsTheyWantThatIHave.length > 0) {
      const matchesByRarity = findSameRarityMatches(cardsTheyHaveThatIWant, cardsTheyWantThatIHave)

      allMatches.push({
        user: userInfo,
        theyHave: cardsTheyHaveThatIWant,
        theyWant: cardsTheyWantThatIHave,
        matchesByRarity,
      })
    }
  })

  // Séparer les correspondances parfaites (avec au moins une correspondance de rareté) des autres
  const perfectMatches = allMatches.filter((match) => Object.keys(match.matchesByRarity).length > 0)
  const imperfectMatches = allMatches.filter((match) => Object.keys(match.matchesByRarity).length === 0)

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Espace d'Échanges</h1>
      <p className="text-muted-foreground mb-4">
        Découvrez les joueurs qui ont des cartes que vous voulez ou qui veulent des cartes que vous avez
      </p>

      <div className="bg-muted p-4 rounded-lg mb-8 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Comment fonctionnent les échanges :</p>
          <p className="text-sm text-muted-foreground">
            1. Ajoutez des cartes à vos{" "}
            <Link href="/my-trades" className="text-primary underline">
              échanges
            </Link>{" "}
            (cartes que vous avez)
            <br />
            2. Ajoutez des cartes à votre{" "}
            <Link href="/wishlist" className="text-primary underline">
              liste de souhaits
            </Link>{" "}
            (cartes que vous voulez)
            <br />
            3. Trouvez des partenaires d'échange potentiels ci-dessous qui correspondent à vos besoins
          </p>
        </div>
      </div>

      <Tabs defaultValue="perfect" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="perfect" className="flex items-center justify-center">
            <span className="hidden md:inline">Correspondances Parfaites</span>
            <span className="md:hidden">Parfaites</span>
            {perfectMatches.length > 0 && <Badge className="ml-2 bg-destructive">{perfectMatches.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="theyHave" className="flex items-center justify-center">
            <span className="hidden md:inline">Cartes Souhaitées</span>
            <span className="md:hidden">Souhaitées</span>
            {Object.keys(usersWithCardsIWant).length > 0 && (
              <Badge className="ml-2 bg-destructive">{Object.keys(usersWithCardsIWant).length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="theyWant" className="flex items-center justify-center">
            <span className="hidden md:inline">Cartes Demandées</span>
            <span className="md:hidden">Demandées</span>
            {Object.keys(usersWhoWantMyCards).length > 0 && (
              <Badge className="ml-2 bg-destructive">{Object.keys(usersWhoWantMyCards).length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Onglet des correspondances parfaites */}
        <TabsContent value="perfect">
          {perfectMatches.length > 0 ? (
            <div className="space-y-8">
              {perfectMatches.map((match) => (
                <Card key={match.user.id} className="overflow-hidden">
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <Link href={`/profile/${match.user.id}`} target="_blank" className="hover:underline">
                        {match.user.in_game_name || "Unnamed Trainer"}
                      </Link>
                      <Badge variant="outline" className="font-normal mt-1 sm:mt-0 self-start sm:self-auto">
                        ID: {match.user.in_game_id || "Not set"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      <span className="font-medium text-green-600">Correspondance Parfaite !</span> Ce dresseur a des
                      cartes que vous voulez et veut des cartes que vous avez de même rareté.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Afficher les correspondances par rareté */}
                    {Object.entries(match.matchesByRarity).map(([rarity, { theyHave, theyWant }]) => (
                      <div key={`match-${rarity}`} className="mb-8">
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                          <Badge className="mr-2">{rarity === "Unknown" ? "Sans rareté" : rarity}</Badge>
                          <span>Échanges possibles</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Ils ont ces cartes que vous voulez :</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {theyHave.map(({ id, card }) => (
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

                          <div>
                            <h4 className="text-sm font-medium mb-2">Ils veulent ces cartes que vous avez :</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {theyWant.map(({ id, card }) => (
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
                        </div>
                      </div>
                    ))}

                    {/* Afficher aussi les correspondances sans même rareté s'il y en a */}
                    {imperfectMatches.some((m) => m.user.id === match.user.id) && (
                      <div className="mb-8 border-t pt-6">
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                          <Badge variant="outline" className="mr-2">
                            Autres correspondances
                          </Badge>
                          <span>Échanges possibles (raretés différentes)</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Autres cartes qu'ils ont :</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {match.theyHave
                                .filter(
                                  (card) =>
                                    !Object.values(match.matchesByRarity).some((m) =>
                                      m.theyHave.some((c) => c.id === card.id),
                                    ),
                                )
                                .map(({ id, card }) => (
                                  <Link key={id} href={`/cards/${card.id}`} className="group">
                                    <div className="border rounded-lg overflow-hidden transition-all group-hover:shadow-md opacity-75">
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
                          <div>
                            <h4 className="text-sm font-medium mb-2">Autres cartes qu'ils veulent :</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {match.theyWant
                                .filter(
                                  (card) =>
                                    !Object.values(match.matchesByRarity).some((m) =>
                                      m.theyWant.some((c) => c.id === card.id),
                                    ),
                                )
                                .map(({ id, card }) => (
                                  <Link key={id} href={`/cards/${card.id}`} className="group">
                                    <div className="border rounded-lg overflow-hidden transition-all group-hover:shadow-md opacity-75">
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
                        </div>
                      </div>
                    )}

                    {/* Contact button */}
                    <div className="mt-6">
                      <Button asChild className="w-full">
                        <Link href={`/profile/${match.user.id}`} target="_blank">
                          Voir le profil du dresseur
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : allMatches.length > 0 ? (
            <div className="space-y-8">
              <div className="text-center py-6">
                <h3 className="text-lg font-medium mb-2">Aucune correspondance parfaite de rareté trouvée</h3>
                <p className="text-muted-foreground mb-4">
                  Mais vous avez des correspondances avec des raretés différentes !
                </p>
              </div>
              {imperfectMatches.map((match) => (
                <Card key={match.user.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <Link href={`/profile/${match.user.id}`} target="_blank" className="hover:underline">
                        {match.user.in_game_name || "Unnamed Trainer"}
                      </Link>
                      <Badge variant="outline" className="font-normal mt-1 sm:mt-0 self-start sm:self-auto">
                        ID: {match.user.in_game_id || "Not set"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Ce dresseur a {match.theyHave.length} carte(s) que vous voulez et veut {match.theyWant.length}{" "}
                      carte(s) que vous avez
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Ils ont ces cartes que vous voulez :</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {match.theyHave.map(({ id, card }) => (
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
                                    <Badge variant="secondary" className="text-xs">
                                      {card.rarity || "Unknown"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Ils veulent ces cartes que vous avez :</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {match.theyWant.map(({ id, card }) => (
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
                                    <Badge variant="secondary" className="text-xs">
                                      {card.rarity || "Unknown"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Button asChild className="w-full">
                        <Link href={`/profile/${match.user.id}`} target="_blank">
                          Voir le profil du dresseur
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Aucune correspondance trouvée</h3>
              <p className="text-muted-foreground mb-6">
                Aucun utilisateur n'a à la fois des cartes que vous voulez et ne veut des cartes que vous avez.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/cards">Parcourir les Cartes</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/my-trades">Mes Échanges</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/wishlist">Ma Liste de Souhaits</Link>
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Onglet "Cartes que vous voulez" */}
        <TabsContent value="theyHave">
          {Object.keys(usersWithCardsIWant).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(usersWithCardsIWant).map(([userId, match]) => {
                const cardsByRarity = groupCardsByRarity(match.theyHave)

                return (
                  <Card key={userId}>
                    <CardHeader>
                      <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <Link href={`/profile/${userId}`} target="_blank" className="hover:underline">
                          {match.user.in_game_name || "Unnamed Trainer"}
                        </Link>
                        <Badge variant="outline" className="font-normal mt-1 sm:mt-0 self-start sm:self-auto">
                          ID: {match.user.in_game_id || "Not set"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Ce dresseur a {match.theyHave.length} carte(s) de votre liste de souhaits
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {Object.entries(cardsByRarity).map(([rarity, cards]) => (
                        <div key={`rarity-${rarity}`} className="mb-6">
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <Badge variant="outline" className="mr-2">
                              {rarity === "Unknown" ? "Sans rareté" : rarity}
                            </Badge>
                            <span>{cards.length} carte(s)</span>
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Aucune carte trouvée de votre liste de souhaits</h3>
              <p className="text-muted-foreground mb-6">
                Ajoutez des cartes à votre liste de souhaits pour voir qui a des cartes que vous voulez.
              </p>
              <Button asChild>
                <Link href="/cards">Parcourir les Cartes</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Onglet "Cartes que d'autres veulent" */}
        <TabsContent value="theyWant">
          {Object.keys(usersWhoWantMyCards).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(usersWhoWantMyCards).map(([userId, match]) => {
                const cardsByRarity = groupCardsByRarity(match.theyWant)

                return (
                  <Card key={userId}>
                    <CardHeader>
                      <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <Link href={`/profile/${userId}`} target="_blank" className="hover:underline">
                          {match.user.in_game_name || "Unnamed Trainer"}
                        </Link>
                        <Badge variant="outline" className="font-normal mt-1 sm:mt-0 self-start sm:self-auto">
                          ID: {match.user.in_game_id || "Not set"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Ce dresseur veut {match.theyWant.length} carte(s) de vos échanges
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {Object.entries(cardsByRarity).map(([rarity, cards]) => (
                        <div key={`rarity-${rarity}`} className="mb-6">
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <Badge variant="outline" className="mr-2">
                              {rarity === "Unknown" ? "Sans rareté" : rarity}
                            </Badge>
                            <span>{cards.length} carte(s)</span>
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Aucun utilisateur ne veut de cartes de vos échanges</h3>
              <p className="text-muted-foreground mb-6">
                Ajoutez plus de cartes à vos échanges pour augmenter vos chances de trouver des échanges.
              </p>
              <Button asChild>
                <Link href="/my-trades">Mes Échanges</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

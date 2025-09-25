import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const userId = params.id

  // Récupérer le profil de l'utilisateur
  const { data: profile, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error || !profile) {
    notFound()
  }

  // Récupérer la session pour vérifier si c'est le profil de l'utilisateur connecté
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isOwnProfile = session?.user.id === userId

  // Récupérer les statistiques de l'utilisateur
  const { count: tradeListingsCount } = await supabase
    .from("trade_listings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  const { count: wishlistCount } = await supabase
    .from("wishlists")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  // Récupérer les cartes de la liste d'échange de l'utilisateur
  const { data: tradeListings } = await supabase
    .from("trade_listings")
    .select(`
      id,
      card:cards(*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  // Récupérer les cartes de la liste de souhaits de l'utilisateur
  const { data: wishlistItems } = await supabase
    .from("wishlists")
    .select(`
      id,
      card:cards(*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  // Fonction pour obtenir les initiales
  const getInitials = (name: string, email: string) => {
    if (name && name.length > 0) {
      return name.substring(0, 2).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Profil de {profile.in_game_name || "Dresseur"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url || ""} alt={profile.in_game_name || ""} />
                <AvatarFallback>{getInitials(profile.in_game_name || "", profile.email || "")}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{profile.in_game_name || "Dresseur"}</h2>
                <p className="text-sm text-muted-foreground">ID: {profile.in_game_id || "Non défini"}</p>
                <div className="flex gap-4 mt-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cartes à échanger</p>
                    <p className="font-medium">{tradeListingsCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Liste de souhaits</p>
                    <p className="font-medium">{wishlistCount || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {!isOwnProfile && (
              <div className="flex gap-2 mt-6">
                <Button asChild variant="outline">
                  <Link href={`/trades?userId=${userId}`}>Voir les échanges</Link>
                </Button>
              </div>
            )}

            {isOwnProfile && (
              <div className="mt-6">
                <Button asChild>
                  <Link href="/profile">Modifier mon profil</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="trades" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="trades">Cartes à échanger ({tradeListingsCount || 0})</TabsTrigger>
            <TabsTrigger value="wishlist">Liste de souhaits ({wishlistCount || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="trades">
            {tradeListings && tradeListings.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {tradeListings.map(({ id, card }) => (
                  <Card key={id} className="overflow-hidden group relative card-hover-effect">
                    <Link href={`/cards/${card.id}`}>
                      <CardContent className="p-2">
                        <div
                          className="relative"
                          style={{
                            paddingBottom: "140%",
                          }}
                        >
                          <Image
                            src={card.image_url || "/placeholder.svg?height=350&width=250"}
                            alt={card.name}
                            fill
                            className="object-contain rounded"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          />
                        </div>
                        <div className="mt-2 text-sm font-medium truncate">{card.name}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {card.set_name}
                          </Badge>
                          {card.rarity && (
                            <Badge variant="secondary" className="text-xs">
                              {card.rarity}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <p className="text-muted-foreground">
                  {isOwnProfile
                    ? "Vous n'avez pas encore ajouté de cartes à échanger."
                    : "Ce dresseur n'a pas encore ajouté de cartes à échanger."}
                </p>
                {isOwnProfile && (
                  <Button asChild>
                    <Link href="/cards">Parcourir les Cartes</Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="wishlist">
            {wishlistItems && wishlistItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {wishlistItems.map(({ id, card }) => (
                  <Card key={id} className="overflow-hidden group relative card-hover-effect">
                    <Link href={`/cards/${card.id}`}>
                      <CardContent className="p-2">
                        <div
                          className="relative"
                          style={{
                            paddingBottom: "140%",
                          }}
                        >
                          <Image
                            src={card.image_url || "/placeholder.svg?height=350&width=250"}
                            alt={card.name}
                            fill
                            className="object-contain rounded"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          />
                        </div>
                        <div className="mt-2 text-sm font-medium truncate">{card.name}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {card.set_name}
                          </Badge>
                          {card.rarity && (
                            <Badge variant="secondary" className="text-xs">
                              {card.rarity}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <p className="text-muted-foreground">
                  {isOwnProfile
                    ? "Vous n'avez pas encore ajouté de cartes à votre liste de souhaits."
                    : "Ce dresseur n'a pas encore ajouté de cartes à sa liste de souhaits."}
                </p>
                {isOwnProfile && (
                  <Button asChild>
                    <Link href="/cards">Parcourir les Cartes</Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

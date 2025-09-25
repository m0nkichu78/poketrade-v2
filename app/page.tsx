import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Search, Repeat, UserPlus } from "lucide-react"
import Image from "next/image"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export default async function Home() {
  // Check if user is logged in
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If logged in, redirect to trades page
  if (session) {
    redirect("/trades")
  }

  return (
    <div className="space-y-12 py-6">
      <section className="py-12 md:py-24 lg:py-32 space-y-8">
        <div className="container mx-auto flex flex-col items-center text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
            Trouvez des Échanges Pokémon TCG Pocket <span className="text-primary">Facilement</span>
          </h1>
          <p className="text-muted-foreground md:text-xl max-w-[700px]">
            Connectez-vous avec d'autres joueurs, listez vos cartes en double, et trouvez les cartes dont vous avez
            besoin pour compléter votre collection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button asChild size="lg">
              <Link href="/signup">
                Commencer <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/cards">
                Parcourir les Cartes <Search className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="mr-2 h-5 w-5 text-primary" />
                Créez Votre Profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              Inscrivez-vous et ajoutez votre nom et ID en jeu pour aider les autres joueurs à vous trouver pour des
              échanges.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-5 w-5 text-primary" />
                Ajoutez des Cartes
              </CardTitle>
            </CardHeader>
            <CardContent>
              Parcourez notre base de données et ajoutez des cartes à votre liste d'échange et liste de souhaits.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Repeat className="mr-2 h-5 w-5 text-primary" />
                Espace d'Échanges
              </CardTitle>
            </CardHeader>
            <CardContent>
              Soyez automatiquement mis en relation avec des joueurs qui ont ce que vous voulez et qui veulent ce que
              vous avez.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter">Complétez Votre Collection Plus Rapidement</h2>
            <p className="text-muted-foreground">
              PokéTrade facilite la recherche des cartes dont vous avez besoin en vous connectant avec des joueurs qui
              les possèdent et qui recherchent des cartes que vous avez à échanger.
            </p>
            <Button asChild>
              <Link href="/trades">Trouver des Échanges</Link>
            </Button>
          </div>
          <div className="relative h-[300px] rounded-lg overflow-hidden shadow-xl">
            <Image
              src="/placeholder.svg?height=600&width=800"
              alt="Collection de cartes Pokémon"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

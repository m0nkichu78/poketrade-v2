import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CreditCard, Users, Settings, Database, BarChart, HardDrive, Plus } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Dans une application réelle, vous voudriez vérifier si l'utilisateur est un administrateur

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord d'administration</h1>
          <p className="text-muted-foreground">Gérez votre application PokéTrade</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-primary" />
              Gestion des cartes
            </CardTitle>
            <CardDescription>Gérez les cartes Pokémon dans la base de données</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between">
            <Button asChild variant="outline">
              <Link href="/admin/cards">Voir les cartes</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/cards/new">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une carte
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              Gestion des utilisateurs
            </CardTitle>
            <CardDescription>Gérez les utilisateurs de l'application</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/users">Voir les utilisateurs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HardDrive className="mr-2 h-5 w-5 text-primary" />
              Stockage
            </CardTitle>
            <CardDescription>Gérez les fichiers stockés dans Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/storage">Gérer le stockage</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="mr-2 h-5 w-5 text-primary" />
              Statistiques
            </CardTitle>
            <CardDescription>Consultez les statistiques de l'application</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/stats">Voir les statistiques</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5 text-primary" />
              Base de données
            </CardTitle>
            <CardDescription>Initialisez la base de données avec des données de test</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/seed">Seed Database</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5 text-primary" />
              Paramètres
            </CardTitle>
            <CardDescription>Configurez les paramètres de l'application</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/settings">Paramètres</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

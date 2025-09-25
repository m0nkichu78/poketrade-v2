import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { ProfileForm } from "@/components/profile-form"
import { UserActivityFeed } from "@/components/user-activity-feed"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ProfilePage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", session.user.id).single()

  return (
    <div className="container max-w-2xl py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Votre Profil</h1>
          <p className="text-muted-foreground">
            Mettez à jour vos informations de profil pour aider les autres joueurs à vous trouver pour des échanges.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>

        <UserActivityFeed userId={session.user.id} />
      </div>
    </div>
  )
}

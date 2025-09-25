import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { StorageManager } from "@/components/storage-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function StorageAdminPage() {
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
      <h1 className="text-3xl font-bold mb-6">Gestion du stockage</h1>

      <Tabs defaultValue="cards">
        <TabsList className="mb-6">
          <TabsTrigger value="cards">
            <span className="hidden md:inline">Images de cartes</span>
            <span className="md:hidden">Cartes</span>
          </TabsTrigger>
          <TabsTrigger value="profiles">
            <span className="hidden md:inline">Images de profil</span>
            <span className="md:hidden">Profils</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cards">
          <StorageManager
            bucketName="cards"
            allowedFileTypes={["image/jpeg", "image/png", "image/webp"]}
            maxFileSize={5}
          />
        </TabsContent>

        <TabsContent value="profiles">
          <StorageManager
            bucketName="profiles"
            allowedFileTypes={["image/jpeg", "image/png", "image/webp"]}
            maxFileSize={2}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

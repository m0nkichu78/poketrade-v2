import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { CardAdminList } from "@/components/card-admin-list"

export default async function AdminCardsPage() {
  const supabase = createServerSupabaseClient()

  // Check if user is logged in and is an admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // In a real app, you would check if the user is an admin
  // For now, we'll just check if they're logged in

  // Get cards with pagination
  const { data: cards, error } = await supabase.from("cards").select("*").order("name").limit(50)

  if (error) {
    console.error("Error fetching cards:", error)
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Cards</h1>
          <p className="text-muted-foreground">Add, edit, or delete cards in the database</p>
        </div>
        <Button asChild>
          <Link href="/admin/cards/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Card
          </Link>
        </Button>
      </div>

      <CardAdminList cards={cards || []} />
    </div>
  )
}

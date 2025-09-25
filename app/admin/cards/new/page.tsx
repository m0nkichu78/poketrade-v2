import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { CardForm } from "@/components/card-form"

export default async function NewCardPage() {
  const supabase = createServerSupabaseClient()

  // Check if user is logged in and is an admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // In a real app, you would check if the user is an admin

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Card</h1>
        <p className="text-muted-foreground">Create a new card in the database</p>
      </div>

      <CardForm />
    </div>
  )
}

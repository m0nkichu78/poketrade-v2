import { redirect, notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { CardForm } from "@/components/card-form"

export default async function EditCardPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()

  // Check if user is logged in and is an admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // In a real app, you would check if the user is an admin

  // Get the card data
  const { data: card, error } = await supabase.from("cards").select("*").eq("id", params.id).single()

  if (error || !card) {
    notFound()
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Card</h1>
        <p className="text-muted-foreground">Update card information</p>
      </div>

      <CardForm card={card} isEditing />
    </div>
  )
}

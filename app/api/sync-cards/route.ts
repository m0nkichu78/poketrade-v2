import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { tcgdexService, type FormattedCard } from "@/lib/tcgdex-service"
import type { Database } from "@/lib/database.types"

// Utilise le service role pour l'insertion en masse
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(url, serviceKey)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { setId } = body

    if (!setId) {
      return NextResponse.json(
        { error: "setId is required" },
        { status: 400 }
      )
    }

    // Vérifier l'authentification - seuls les admins peuvent synchroniser
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const authClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: request.headers.get("Authorization") || "",
        },
      },
    })

    const {
      data: { user },
    } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Vérifier que l'utilisateur est admin via ADMIN_EMAILS
    // Si ADMIN_EMAILS n'est pas défini, tout utilisateur connecté peut syncer
    const adminEmails = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim()).filter(Boolean)
      : []

    if (adminEmails.length > 0 && !adminEmails.includes(user.email || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Récupérer les cartes depuis TCGdex
    const cards = await tcgdexService.fetchAndFormatSetCards(setId)

    if (cards.length === 0) {
      return NextResponse.json(
        { error: "No cards found for this set" },
        { status: 404 }
      )
    }

    // Insérer en base par batch de 50
    const adminSupabase = createAdminClient()
    const BATCH_SIZE = 50
    let successCount = 0
    const errors: string[] = []

    for (let i = 0; i < cards.length; i += BATCH_SIZE) {
      const batch = cards.slice(i, i + BATCH_SIZE)

      const { error } = await adminSupabase
        .from("cards")
        .upsert(
          batch.map((card: FormattedCard) => ({
            id: card.id,
            name: card.name,
            set_name: card.set_name,
            set_id: card.set_id,
            rarity: card.rarity,
            card_number: card.card_number,
            image_url: card.image_url,
            boosters: card.boosters,
            tcgdex_updated_at: card.tcgdex_updated_at,
          })),
          { onConflict: "id" }
        )

      if (error) {
        errors.push(`Batch ${i / BATCH_SIZE + 1}: ${error.message}`)
      } else {
        successCount += batch.length
      }
    }

    return NextResponse.json({
      success: true,
      total: cards.length,
      inserted: successCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error("Sync error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { tcgdexService, type FormattedCard } from "@/lib/tcgdex-service"
import type { Database } from "@/lib/database.types"

// Limite le timeout Vercel à 60s (max sur Hobby)
export const maxDuration = 60

// Utilise le service role pour l'insertion en masse
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(url, serviceKey)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { setId, offset = 0, limit = 20 } = body

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

    // 1. Récupérer la liste des cartes du set (léger, pas de timeout)
    const set = await tcgdexService.getSetCards(setId)
    const allCardSummaries = set.cards
    const total = allCardSummaries.length
    const totalExpected = set.cardCount?.total ?? 0

    // Si l'API ne retourne aucune carte mais qu'il devrait y en avoir,
    // c'est que TCGdex n'a pas encore indexé cette extension
    if (total === 0 && totalExpected > 0) {
      return NextResponse.json(
        { error: `Les cartes de l'extension "${set.name}" ne sont pas encore disponibles sur TCGdex (${totalExpected} attendues).` },
        { status: 404 }
      )
    }

    // 2. Extraire seulement la tranche demandée (pagination)
    const slice = allCardSummaries.slice(offset, offset + limit)

    if (slice.length === 0) {
      return NextResponse.json({ success: true, total, inserted: 0, done: true })
    }

    // 3. Récupérer les détails complets de la tranche par batches de 10
    const FETCH_BATCH = 10
    const formattedCards: FormattedCard[] = []

    for (let i = 0; i < slice.length; i += FETCH_BATCH) {
      const batch = slice.slice(i, i + FETCH_BATCH)
      const cardDetails = await Promise.all(
        batch.map((card) =>
          tcgdexService.getCardFull(card.id).catch((err) => {
            console.error(`Error fetching card ${card.id}:`, err)
            return null
          })
        )
      )

      for (const card of cardDetails) {
        if (!card) continue
        formattedCards.push({
          id: card.id,
          name: card.name,
          set_name: card.set.name,
          set_id: card.set.id,
          rarity: card.rarity || null,
          card_number: card.localId,
          image_url: card.image ? `${card.image}/high.webp` : "",
          boosters: card.boosters?.map((b) => b.name) || null,
          tcgdex_updated_at: card.updated || null,
        })
      }

      if (i + FETCH_BATCH < slice.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    // 4. Insérer la tranche en base
    const adminSupabase = createAdminClient()
    const errors: string[] = []

    if (formattedCards.length > 0) {
      const { error } = await adminSupabase
        .from("cards")
        .upsert(
          formattedCards.map((card: FormattedCard) => ({
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
        errors.push(error.message)
      }
    }

    const nextOffset = offset + limit
    const done = nextOffset >= total

    return NextResponse.json({
      success: true,
      total,
      inserted: formattedCards.length,
      nextOffset: done ? null : nextOffset,
      done,
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

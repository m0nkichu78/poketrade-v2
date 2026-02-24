"use client"

import { useState, useEffect, useCallback } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, Database } from "lucide-react"

interface TcgdexSetSummary {
  id: string
  name: string
  cardCount: {
    official: number
    total: number
  }
  symbol?: string
}

interface SyncStatus {
  setId: string
  status: "idle" | "syncing" | "success" | "error"
  message?: string
  inserted?: number
  total?: number
  progress?: number // 0-100
}

export default function SyncPage() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [sets, setSets] = useState<TcgdexSetSummary[]>([])
  const [loadingSets, setLoadingSets] = useState(true)
  const [syncStatuses, setSyncStatuses] = useState<Record<string, SyncStatus>>({})
  const [dbCardCounts, setDbCardCounts] = useState<Record<string, number>>({})
  const [syncAllRunning, setSyncAllRunning] = useState(false)

  // Charger les extensions TCG Pocket depuis l'API TCGdex
  const loadSets = useCallback(async () => {
    setLoadingSets(true)
    try {
      const res = await fetch("https://api.tcgdex.net/v2/fr/series/tcgp")
      if (!res.ok) throw new Error("Erreur lors du chargement des extensions")
      const data = await res.json()
      setSets(data.sets || [])
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les extensions",
        variant: "destructive",
      })
    } finally {
      setLoadingSets(false)
    }
  }, [toast])

  // Charger le nombre de cartes en base par set
  const loadDbCounts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("cards")
        .select("set_id")

      if (error) throw error

      const counts: Record<string, number> = {}
      for (const row of data || []) {
        const setId = row.set_id
        if (setId) {
          counts[setId] = (counts[setId] || 0) + 1
        }
      }
      setDbCardCounts(counts)
    } catch (error) {
      console.error("Error loading DB counts:", error)
    }
  }, [supabase])

  useEffect(() => {
    loadSets()
    loadDbCounts()
  }, [loadSets, loadDbCounts])

  // Taille de chaque tranche de cartes envoyée à l'API (20 = ~10s max par requête)
  const SYNC_PAGE_SIZE = 20

  const syncSet = async (setId: string) => {
    setSyncStatuses((prev) => ({
      ...prev,
      [setId]: { setId, status: "syncing", progress: 0 },
    }))

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("Non authentifie")
      }

      let offset = 0
      let totalInserted = 0
      let total = 0

      // Boucle paginée : on appelle l'API par tranches jusqu'à ce que done = true
      while (true) {
        const res = await fetch("/api/sync-cards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ setId, offset, limit: SYNC_PAGE_SIZE }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Erreur lors de la synchronisation")
        }

        total = data.total
        totalInserted += data.inserted
        offset = data.nextOffset ?? total

        const progress = total > 0 ? Math.round((offset / total) * 100) : 100

        setSyncStatuses((prev) => ({
          ...prev,
          [setId]: {
            setId,
            status: "syncing",
            progress,
            message: `${offset} / ${total} cartes...`,
            inserted: totalInserted,
            total,
          },
        }))

        if (data.done) break
      }

      setSyncStatuses((prev) => ({
        ...prev,
        [setId]: {
          setId,
          status: "success",
          progress: 100,
          message: `${totalInserted} / ${total} cartes synchronisees`,
          inserted: totalInserted,
          total,
        },
      }))

      await loadDbCounts()

      toast({
        title: "Synchronisation reussie",
        description: `${totalInserted} cartes synchronisees pour cette extension`,
      })
    } catch (error: any) {
      setSyncStatuses((prev) => ({
        ...prev,
        [setId]: {
          setId,
          status: "error",
          message: error.message,
        },
      }))

      toast({
        title: "Erreur de synchronisation",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const syncAll = async () => {
    setSyncAllRunning(true)
    for (const set of sets) {
      await syncSet(set.id)
    }
    setSyncAllRunning(false)
    toast({
      title: "Synchronisation globale terminee",
      description: `Toutes les extensions ont ete traitees`,
    })
  }

  const getStatusIcon = (status?: SyncStatus) => {
    if (!status || status.status === "idle") return null
    if (status.status === "syncing")
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    if (status.status === "success")
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    if (status.status === "error")
      return <AlertCircle className="h-4 w-4 text-destructive" />
    return null
  }

  const totalCardsInDb = Object.values(dbCardCounts).reduce((a, b) => a + b, 0)
  const totalCardsAvailable = sets.reduce((a, s) => a + s.cardCount.total, 0)

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-sans">Synchronisation TCGdex</h1>
          <p className="text-muted-foreground mt-1">
            Synchronisez les cartes depuis l'API TCGdex pour TCG Pocket
          </p>
        </div>
        <Button
          onClick={syncAll}
          disabled={syncAllRunning || loadingSets}
          size="lg"
        >
          {syncAllRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Synchronisation en cours...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Tout synchroniser
            </>
          )}
        </Button>
      </div>

      {/* Barre de progression globale */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Cartes en base de donnees</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {totalCardsInDb} / {totalCardsAvailable}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${totalCardsAvailable > 0 ? (totalCardsInDb / totalCardsAvailable) * 100 : 0}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des extensions */}
      {loadingSets ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4">
          {sets.map((set) => {
            const status = syncStatuses[set.id]
            const dbCount = dbCardCounts[set.id] || 0
            const isSynced = dbCount >= set.cardCount.total
            const isSyncing = status?.status === "syncing"

            return (
              <Card key={set.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {set.symbol && (
                        <img
                          src={set.symbol}
                          alt={`Symbole ${set.name}`}
                          className="h-8 w-8 object-contain"
                          crossOrigin="anonymous"
                        />
                      )}
                      <div>
                        <CardTitle className="text-lg font-sans">
                          {set.name}
                        </CardTitle>
                        <CardDescription>
                          {set.id} - {set.cardCount.total} cartes (dont{" "}
                          {set.cardCount.official} officielles)
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status)}
                      <Badge variant={isSynced ? "default" : "secondary"}>
                        {dbCount} / {set.cardCount.total}
                      </Badge>
                      <Button
                        onClick={() => syncSet(set.id)}
                        disabled={isSyncing || syncAllRunning}
                        variant={isSynced ? "outline" : "default"}
                        size="sm"
                      >
                        {isSyncing ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Sync...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-3 w-3" />
                            {isSynced ? "Re-sync" : "Synchroniser"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {(status?.message || status?.status === "syncing") && (
                  <CardContent className="pt-0 space-y-2">
                    {status.status === "syncing" && typeof status.progress === "number" && (
                      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${status.progress}%` }}
                        />
                      </div>
                    )}
                    {status?.message && (
                      <p
                        className={`text-sm ${
                          status.status === "error"
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {status.message}
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

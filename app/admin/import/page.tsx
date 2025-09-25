"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Upload, FileText } from "lucide-react"
import type { Database } from "@/lib/database.types"

type CardType = Database["public"]["Tables"]["cards"]["Insert"]

export default function ImportPage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [jsonData, setJsonData] = useState("")
  const [csvData, setCsvData] = useState("")
  const [fileContent, setFileContent] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setFileContent(content)

      // Determine if it's JSON or CSV based on file extension
      if (file.name.endsWith(".json")) {
        setJsonData(content)
        setCsvData("")
      } else if (file.name.endsWith(".csv")) {
        setCsvData(content)
        setJsonData("")
      }
    }
    reader.readAsText(file)
  }

  const parseJsonData = (): CardType[] => {
    try {
      const parsed = JSON.parse(jsonData)

      // Handle array of cards
      if (Array.isArray(parsed)) {
        return parsed.map((card) => ({
          id: card.id,
          name: card.name,
          set_name: card.set_name,
          pack: card.pack,
          rarity: card.rarity,
          card_number: card.card_number,
          image_url: card.image_url,
        }))
      }

      // Handle single card object
      return [
        {
          id: parsed.id,
          name: parsed.name,
          set_name: parsed.set_name,
          pack: parsed.pack,
          rarity: parsed.rarity,
          card_number: parsed.card_number,
          image_url: parsed.image_url,
        },
      ]
    } catch (error) {
      throw new Error("Invalid JSON format")
    }
  }

  const parseCsvData = (): CardType[] => {
    try {
      const lines = csvData.trim().split("\n")
      const headers = lines[0].split(",").map((h) => h.trim())

      // Validate required headers
      const requiredHeaders = ["id", "name", "set_name", "pack", "card_number", "image_url"]
      for (const header of requiredHeaders) {
        if (!headers.includes(header)) {
          throw new Error(`CSV is missing required header: ${header}`)
        }
      }

      const cards: CardType[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim())

        if (values.length !== headers.length) {
          console.warn(`Skipping line ${i + 1}: incorrect number of values`)
          continue
        }

        const card: any = {}

        headers.forEach((header, index) => {
          card[header] = values[index]
        })

        cards.push({
          id: card.id,
          name: card.name,
          set_name: card.set_name,
          pack: card.pack,
          rarity: card.rarity || null,
          card_number: card.card_number,
          image_url: card.image_url,
        })
      }

      return cards
    } catch (error: any) {
      throw new Error(`Error parsing CSV: ${error.message}`)
    }
  }

  const handleImport = async () => {
    setIsLoading(true)
    try {
      let cards: CardType[] = []

      // Parse data based on active tab
      if (jsonData) {
        cards = parseJsonData()
      } else if (csvData) {
        cards = parseCsvData()
      } else {
        throw new Error("No data to import")
      }

      if (cards.length === 0) {
        throw new Error("No valid cards found to import")
      }

      // Import cards in batches to avoid hitting rate limits
      const batchSize = 50
      let successCount = 0

      for (let i = 0; i < cards.length; i += batchSize) {
        const batch = cards.slice(i, i + batchSize)

        const { error, count } = await supabase.from("cards").upsert(batch, { onConflict: "id" }).select("count")

        if (error) throw error

        successCount += batch.length

        // Show progress toast for large imports
        if (cards.length > batchSize) {
          toast({
            title: "Import progress",
            description: `Imported ${successCount} of ${cards.length} cards`,
          })
        }

        // Add a small delay to avoid rate limiting
        if (i + batchSize < cards.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      toast({
        title: "Import successful",
        description: `Successfully imported ${successCount} cards`,
      })

      // Redirect to admin cards page
      router.push("/admin/cards")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import cards",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Import Cards</h1>
        <p className="text-muted-foreground">Bulk import cards from JSON or CSV</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Cards</CardTitle>
          <CardDescription>Upload a file or paste data to import multiple cards at once</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="file-upload" className="block mb-2">
              Upload File
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="file-upload"
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="hidden"
              />
              <Button
                onClick={() => document.getElementById("file-upload")?.click()}
                variant="outline"
                disabled={isLoading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
              {fileContent && <p className="text-sm text-muted-foreground">File loaded successfully</p>}
            </div>
          </div>

          <Tabs defaultValue="json">
            <TabsList className="mb-4">
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="csv">CSV</TabsTrigger>
            </TabsList>
            <TabsContent value="json">
              <div className="space-y-2">
                <Label htmlFor="json-data">JSON Data</Label>
                <Textarea
                  id="json-data"
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  placeholder='[{"id": "sv1-001", "name": "Pikachu", "set_name": "Scarlet & Violet", "pack": "Base Set", "rarity": "Rare", "card_number": "001/150", "image_url": "https://example.com/pikachu.jpg"}]'
                  className="min-h-[200px] font-mono text-sm"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Paste JSON array of card objects with id, name, set_name, pack, rarity, card_number, and image_url
                  fields
                </p>
              </div>
            </TabsContent>
            <TabsContent value="csv">
              <div className="space-y-2">
                <Label htmlFor="csv-data">CSV Data</Label>
                <Textarea
                  id="csv-data"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="id,name,set_name,pack,rarity,card_number,image_url
sv1-001,Pikachu,Scarlet & Violet,Base Set,Rare,001/150,https://example.com/pikachu.jpg"
                  className="min-h-[200px] font-mono text-sm"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Paste CSV data with headers: id, name, set_name, pack, rarity, card_number, image_url
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button onClick={handleImport} disabled={isLoading || (!jsonData && !csvData)}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Import Cards
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// Hidden Input component for file upload
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} />
}

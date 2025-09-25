"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Eye } from "lucide-react"
import type { Database } from "@/lib/database.types"

type CardType = Database["public"]["Tables"]["cards"]["Row"]

export function CardAdminList({ cards }: { cards: CardType[] }) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      // First check if the card is referenced in trade_listings or wishlists
      const { data: tradeListings } = await supabase.from("trade_listings").select("id").eq("card_id", id).limit(1)

      const { data: wishlistItems } = await supabase.from("wishlists").select("id").eq("card_id", id).limit(1)

      if ((tradeListings && tradeListings.length > 0) || (wishlistItems && wishlistItems.length > 0)) {
        toast({
          title: "Cannot delete card",
          description: "This card is referenced in trade listings or wishlists. Remove those references first.",
          variant: "destructive",
        })
        return
      }

      // If no references, proceed with deletion
      const { error } = await supabase.from("cards").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Card deleted",
        description: "The card has been deleted successfully",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete card",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeletingId(null)
    }
  }

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No cards found in the database.</p>
          <Button asChild>
            <Link href="/admin/cards/new">Add Your First Card</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Set</TableHead>
            <TableHead>Pack</TableHead>
            <TableHead>Rarity</TableHead>
            <TableHead>Card #</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card) => (
            <TableRow key={card.id}>
              <TableCell>
                <div className="relative h-10 w-8 overflow-hidden rounded">
                  <Image
                    src={card.image_url || "/placeholder.svg?height=40&width=30"}
                    alt={card.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium">{card.name}</TableCell>
              <TableCell>{card.set_name}</TableCell>
              <TableCell>{card.pack}</TableCell>
              <TableCell>{card.rarity || "N/A"}</TableCell>
              <TableCell>{card.card_number}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button asChild size="icon" variant="ghost">
                    <Link href={`/cards/${card.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Link>
                  </Button>
                  <Button asChild size="icon" variant="ghost">
                    <Link href={`/admin/cards/edit/${card.id}`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the card "{card.name}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(card.id)}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting && deletingId === card.id ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

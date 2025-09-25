"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ListPlus, Heart } from "lucide-react"

export function TradeTabsNav() {
  const pathname = usePathname()

  // Déterminer la valeur active en fonction du chemin actuel
  const activeTab = pathname.includes("/wishlist") ? "wishlist" : pathname.includes("/my-trades") ? "my-trades" : "none"

  return (
    <div className="mb-8">
      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-trades" asChild>
            <Link
              href="/my-trades"
              className={cn("flex items-center justify-center gap-2", activeTab === "my-trades" ? "font-medium" : "")}
            >
              <ListPlus className="h-4 w-4" />
              <span className="hidden md:inline">Mes Échanges</span>
              <span className="md:hidden">Échanges</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="wishlist" asChild>
            <Link
              href="/wishlist"
              className={cn("flex items-center justify-center gap-2", activeTab === "wishlist" ? "font-medium" : "")}
            >
              <Heart className="h-4 w-4" />
              <span className="hidden md:inline">Liste de Souhaits</span>
              <span className="md:hidden">Souhaits</span>
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}

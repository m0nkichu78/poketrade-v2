"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/lib/supabase-provider"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// Importez l'icône nécessaire
import { UserIcon, Heart, ListPlus, LogOutIcon } from "lucide-react"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/user-avatar"

export default function Header() {
  const { supabase } = useSupabase()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // Update the Sheet component to close when a link is clicked
  // First, add a state to control the sheet open state
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Then update the Sheet component to use this state */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg font-medium" onClick={() => setSheetOpen(false)}>
                  Accueil
                </Link>
                <Link href="/cards" className="text-lg font-medium" onClick={() => setSheetOpen(false)}>
                  Cartes
                </Link>
                <Link href="/trades" className="text-lg font-medium" onClick={() => setSheetOpen(false)}>
                  Trades
                </Link>
                <Link href="/community" className="text-lg font-medium" onClick={() => setSheetOpen(false)}>
                  Communauté
                </Link>
                {!user && (
                  <>
                    <Link href="/login" className="text-lg font-medium" onClick={() => setSheetOpen(false)}>
                      Connexion
                    </Link>
                    <Link href="/signup" className="text-lg font-medium" onClick={() => setSheetOpen(false)}>
                      S'inscrire
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl">
                <span>Poké</span>
                <span className="text-primary">Trade</span>
              </span>
              <Badge variant="secondary" className="text-xs font-semibold uppercase">
                Beta
              </Badge>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 ml-6">
            <Link href="/cards" className="text-sm font-medium transition-colors hover:text-primary">
              Cartes
            </Link>
            <Link href="/trades" className="text-sm font-medium transition-colors hover:text-primary">
              Trades
            </Link>
            <Link href="/community" className="text-sm font-medium transition-colors hover:text-primary">
              Communauté
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Remove the NotificationBadge component */}

          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <UserAvatar user={user} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-trades" className="flex items-center">
                        <ListPlus className="mr-2 h-4 w-4" />
                        <span>Mes Échanges</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist" className="flex items-center">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Liste de Souhaits</span>
                      </Link>
                    </DropdownMenuItem>

                    {/* Remove the notifications menu item */}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOutIcon className="mr-2 h-4 w-4" />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/login">Connexion</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/signup">S'inscrire</Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}

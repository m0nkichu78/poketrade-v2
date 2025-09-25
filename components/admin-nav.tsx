"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CreditCard, Users, Settings, Database, BarChart, HardDrive, Home } from "lucide-react"

const adminRoutes = [
  {
    href: "/admin",
    label: "Tableau de bord",
    icon: Home,
  },
  {
    href: "/admin/cards",
    label: "Cartes",
    icon: CreditCard,
  },
  {
    href: "/admin/users",
    label: "Utilisateurs",
    icon: Users,
  },
  {
    href: "/admin/storage",
    label: "Stockage",
    icon: HardDrive,
  },
  {
    href: "/admin/stats",
    label: "Statistiques",
    icon: BarChart,
  },
  {
    href: "/admin/seed",
    label: "Seed DB",
    icon: Database,
  },
  {
    href: "/admin/settings",
    label: "Paramètres",
    icon: Settings,
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="grid gap-2 p-4 md:p-6">
      {adminRoutes.map((route) => (
        <Button
          key={route.href}
          variant={pathname === route.href ? "default" : "ghost"}
          className={cn("justify-start", pathname === route.href && "bg-primary text-primary-foreground")}
          asChild
        >
          <Link href={route.href}>
            <route.icon className="mr-2 h-4 w-4" />
            {route.label}
          </Link>
        </Button>
      ))}
    </nav>
  )
}

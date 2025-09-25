"use client"

import { Coffee } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function BuyMeCoffeeButton() {
  const [isVisible, setIsVisible] = useState(false)

  // Ajouter un petit délai avant d'afficher le bouton pour ne pas gêner le chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <a
      href="https://buymeacoffee.com/m0nkichu"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 transition-all duration-300 hover:scale-105 shadow-lg rounded-full"
    >
      <Button className="rounded-full px-4 py-2 flex items-center gap-2">
        <Coffee className="h-4 w-4" />
        <span className="hidden sm:inline">Offrir un café</span>
      </Button>
    </a>
  )
}

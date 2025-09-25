import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SupabaseProvider } from "@/lib/supabase-provider"
import Header from "@/components/header"
import { Footer } from "@/components/footer"
import { BuyMeCoffeeButton } from "@/components/buy-me-coffee-button"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "PokéTrade - Echanges Pokémon TCG Pocket",
  description:
    "Échangez vos cartes Pokémon facilement ! Trouvez des dresseurs pour échanger vos cartes Pokémon TCG Pocket en renseignant celles que vous possédez et celles que vous recherchez. Rejoignez la communauté et complétez votre collection en quelques clics ! 🔥✨",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <SupabaseProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
              <Footer />
            </div>
            <BuyMeCoffeeButton />
            <Toaster />
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

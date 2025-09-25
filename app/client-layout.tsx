"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SupabaseProvider } from "@/lib/supabase-provider"
import { LanguageProvider } from "@/lib/i18n/language-context"
import Header from "@/components/header"
import { useLanguage } from "@/lib/i18n/language-context"

function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t py-4 text-center text-sm text-muted-foreground">
      <div className="container mx-auto">{t("footer.copyright", { year: new Date().getFullYear() })}</div>
    </footer>
  )
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <SupabaseProvider>
        <LanguageProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </LanguageProvider>
      </SupabaseProvider>
    </ThemeProvider>
  )
}

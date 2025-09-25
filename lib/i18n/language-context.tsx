"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { en, fr } from "./translations"

type Language = "en" | "fr"
type Translations = typeof en

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const defaultLanguage: Language = "en"

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: () => "",
})

export const useLanguage = () => useContext(LanguageContext)

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(defaultLanguage)
  const [translations, setTranslations] = useState<Translations>(en)
  const [mounted, setMounted] = useState(false)

  // Initialize language from localStorage on client-side only
  useEffect(() => {
    setMounted(true)
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "fr")) {
      setLanguageState(savedLanguage)
      setTranslations(savedLanguage === "en" ? en : fr)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    if (lang === language) return

    localStorage.setItem("language", lang)
    setLanguageState(lang)
    setTranslations(lang === "en" ? en : fr)

    // Force reload to ensure all components update with the new language
    if (typeof window !== "undefined") {
      window.location.reload()
    }
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    if (!mounted) return key // Return key during SSR to avoid hydration mismatch

    const keys = key.split(".")
    let value: any = translations

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }

    if (typeof value === "string") {
      if (params) {
        return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
          return acc.replace(new RegExp(`{${paramKey}}`, "g"), String(paramValue))
        }, value)
      }
      return value
    }

    console.warn(`Translation value is not a string: ${key}`)
    return key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

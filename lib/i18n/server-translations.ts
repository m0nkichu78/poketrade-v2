import { cookies } from "next/headers"
import { translations } from "./translations"

export async function getTranslations() {
  const cookieStore = cookies()
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "en"

  return function translate(key: string, params?: Record<string, string>) {
    const keys = key.split(".")
    let value = translations[lang]

    for (const k of keys) {
      if (!value[k]) {
        return key // Return the key if translation not found
      }
      value = value[k]
    }

    if (typeof value === "string" && params) {
      return Object.entries(params).reduce(
        (acc, [paramKey, paramValue]) => acc.replace(`{{${paramKey}}}`, paramValue),
        value,
      )
    }

    return value
  }
}

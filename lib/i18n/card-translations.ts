// This file contains translations for card-specific data

// Map of English card attributes to French translations
export const cardAttributeTranslations = {
  // Rarities
  Common: "Commune",
  Uncommon: "Peu commune",
  Rare: "Rare",
  "Double Rare": "Double Rare",
  "Art Rare": "Art Rare",
  "Full Art": "Full Art",
  Rainbow: "Arc-en-ciel",
  Immersive: "Immersive",
  Gold: "Or",

  // Sets
  "Scarlet & Violet": "Écarlate & Violet",
  "Paldean Fates": "Destins de Paldea",
  "Temporal Forces": "Forces Temporelles",
  "Obsidian Flames": "Flammes Obsidiennes",
  "Paradox Rift": "Faille Paradoxale",
  "151": "151",

  // Packs
  "Starter Pack": "Pack de Démarrage",
  "Booster Pack": "Pack d'Extension",
  "Special Pack": "Pack Spécial",
  "Promo Pack": "Pack Promotionnel",

  // Card types
  Pokémon: "Pokémon",
  Trainer: "Dresseur",
  Energy: "Énergie",

  // Other attributes that might appear on cards
  Shiny: "Chromatique",
  Promo: "Promo",
  "Special Illustration": "Illustration Spéciale",
}

// Function to translate card attributes based on current language
export function translateCardAttribute(attribute: string | null, language: string): string | null {
  if (!attribute) return null

  if (language === "fr" && attribute in cardAttributeTranslations) {
    return cardAttributeTranslations[attribute as keyof typeof cardAttributeTranslations]
  }

  return attribute
}

// Function to translate a card object's attributes
export function translateCardData(card: any, language: string): any {
  if (language === "en") return card

  if (language === "fr") {
    return {
      ...card,
      rarity: translateCardAttribute(card.rarity, language),
      set_name: translateCardAttribute(card.set_name, language),
      pack: translateCardAttribute(card.pack, language),
      // We don't translate the card name, id, or image_url
    }
  }

  return card
}

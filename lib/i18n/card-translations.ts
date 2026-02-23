// This file contains translations for card-specific data
// Avec l'API TCGdex en francais, les noms de raretes, sets, et boosters
// sont deja en francais. Ce fichier sert principalement pour les attributs
// qui pourraient necessiter une traduction supplementaire.

// Map des attributs de carte
export const cardAttributeTranslations: Record<string, string> = {
  // Raretes TCGdex (deja en francais, mais gardes pour reference)
  "Un Diamant": "Un Diamant",
  "Deux Diamants": "Deux Diamants",
  "Trois Diamants": "Trois Diamants",
  "Quatre Diamants": "Quatre Diamants",
  "Une Étoile": "Une Étoile",
  "Deux Étoiles": "Deux Étoiles",
  "Trois Étoiles": "Trois Étoiles",
  "Couronne": "Couronne",

  // Types de cartes
  Pokémon: "Pokémon",
  Trainer: "Dresseur",
  Energy: "Énergie",

  // Autres attributs
  Promo: "Promo",
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
      // boosters sont deja en francais depuis TCGdex
    }
  }

  return card
}

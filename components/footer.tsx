import Link from "next/link"
import { Button } from "@/components/ui/button"
// Ajouter l'icône Coffee
import { Coffee } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Colonne 1: À propos */}
          <div>
            <h3 className="font-bold text-lg mb-4">PokéTrade</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Plateforme d'échange de cartes Pokémon TCG Pocket entre collectionneurs.
            </p>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base">
                <span>Poké</span>
                <span className="text-primary">Trade</span>
              </span>
              <span className="text-xs bg-secondary px-2 py-0.5 rounded-md font-semibold uppercase">Beta</span>
            </div>
          </div>

          {/* Colonne 2: Liens utiles */}
          <div>
            <h3 className="font-bold text-lg mb-4">Liens utiles</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">
                  Communauté
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3: Informations légales */}
          <div>
            <h3 className="font-bold text-lg mb-4">Informations légales</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/mentions" className="text-muted-foreground hover:text-foreground transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Conditions générales d'utilisation
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4: Newsletter */}
          <div>
            <h3 className="font-bold text-lg mb-4">Restez informé</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Inscrivez-vous à notre newsletter pour recevoir les dernières actualités.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Votre email"
                className="px-3 py-2 text-sm rounded-md border bg-background flex-1"
                aria-label="Votre email pour la newsletter"
              />
              <Button size="sm" aria-label="S'inscrire à la newsletter envoyée par contact.poketrade@free.fr">
                S'inscrire
              </Button>
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t my-8"></div>

        {/* Disclaimer et copyright */}
        <div className="text-xs text-muted-foreground space-y-4">
          <p>
            Pokémon, Pokémon TCG Pocket et toutes les images de cartes, noms de personnages, noms d'extensions,
            illustrations, logos et marques associés sont la propriété de Nintendo, The Pokémon Company International,
            Game Freak, Creatures Inc. et DeNA Co., Ltd. PokéTrade n'est pas affilié, sponsorisé ou approuvé par ces
            entreprises.
          </p>
          <p>
            PokéTrade est une plateforme communautaire indépendante créée par des fans pour faciliter les échanges entre
            collectionneurs. Ce site est conçu dans le respect des droits de propriété intellectuelle.
          </p>
          <div className="flex items-center justify-between pt-2">
            <p>© {currentYear} PokéTrade. Tous droits réservés.</p>
            <a
              href="https://buymeacoffee.com/m0nkichu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-muted-foreground hover:text-primary transition-colors"
            >
              <Coffee className="h-4 w-4 mr-1" />
              <span>Offrir un café</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

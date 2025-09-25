import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata = {
  title: "FAQ - PokéTrade",
  description: "Questions fréquemment posées sur PokéTrade et les échanges de cartes Pokémon TCG Pocket",
}

export default function FAQPage() {
  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-3xl font-bold mb-2">Foire Aux Questions</h1>
      <p className="text-muted-foreground mb-8">
        Trouvez des réponses aux questions les plus fréquemment posées sur PokéTrade et les échanges de cartes Pokémon
        TCG Pocket.
      </p>

      <Accordion type="single" collapsible className="space-y-4">
        <AccordionItem value="item-1" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-medium py-4">Comment fonctionne PokéTrade ?</AccordionTrigger>
          <AccordionContent className="pb-4 text-muted-foreground">
            <p>
              PokéTrade est une plateforme qui facilite les échanges de cartes Pokémon TCG Pocket entre collectionneurs.
              Le processus est simple :
            </p>
            <ol className="list-decimal pl-5 mt-2 space-y-2">
              <li>Créez un compte et complétez votre profil avec votre nom et ID en jeu</li>
              <li>Ajoutez les cartes que vous possédez à votre liste d'échange</li>
              <li>Ajoutez les cartes que vous recherchez à votre liste de souhaits</li>
              <li>
                Notre système vous mettra automatiquement en relation avec des joueurs qui ont ce que vous voulez et qui
                veulent ce que vous avez
              </li>
              <li>
                Visitez le profil des autres joueurs pour voir leurs coordonnées et finaliser l'échange dans le jeu
                Pokémon TCG Pocket
              </li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-medium py-4">
            Comment ajouter des cartes à ma liste d'échange ?
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-muted-foreground">
            <p>Pour ajouter des cartes à votre liste d'échange :</p>
            <ol className="list-decimal pl-5 mt-2 space-y-2">
              <li>Connectez-vous à votre compte</li>
              <li>Naviguez vers la page "Cartes" pour parcourir la base de données</li>
              <li>Lorsque vous trouvez une carte que vous possédez, cliquez sur "Ajouter aux échanges"</li>
              <li>Vous pouvez également sélectionner plusieurs cartes à la fois et les ajouter en lot</li>
              <li>Consultez votre liste d'échange dans la section "Mes Échanges"</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-medium py-4">
            Comment trouver des correspondances d'échange ?
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-muted-foreground">
            <p>
              Une fois que vous avez ajouté des cartes à votre liste d'échange et à votre liste de souhaits, notre
              système recherche automatiquement des correspondances. Pour les consulter :
            </p>
            <ol className="list-decimal pl-5 mt-2 space-y-2">
              <li>Accédez à la page "Trades" depuis le menu principal</li>
              <li>
                Consultez l'onglet "Correspondances Parfaites" pour voir les utilisateurs qui ont des cartes que vous
                voulez et qui veulent des cartes que vous avez
              </li>
              <li>
                Vous pouvez également consulter les onglets "Cartes Souhaitées" et "Cartes Demandées" pour voir d'autres
                opportunités d'échange
              </li>
              <li>Cliquez sur "Voir le profil du dresseur" pour contacter un autre utilisateur</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-medium py-4">Comment finaliser un échange ?</AccordionTrigger>
          <AccordionContent className="pb-4 text-muted-foreground">
            <p>
              PokéTrade facilite la mise en relation, mais les échanges se finalisent dans le jeu Pokémon TCG Pocket :
            </p>
            <ol className="list-decimal pl-5 mt-2 space-y-2">
              <li>Après avoir trouvé une correspondance, visitez le profil du dresseur</li>
              <li>Notez son ID en jeu qui est affiché sur son profil</li>
              <li>Utilisez cet ID pour retrouver le joueur dans Pokémon TCG Pocket</li>
              <li>Suivez la procédure d'échange dans le jeu pour finaliser la transaction</li>
              <li>N'oubliez pas de mettre à jour vos listes après l'échange</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-medium py-4">Est-ce que PokéTrade est gratuit ?</AccordionTrigger>
          <AccordionContent className="pb-4 text-muted-foreground">
            <p>
              Oui, PokéTrade est entièrement gratuit ! Notre plateforme est créée par des fans pour la communauté des
              collectionneurs de Pokémon TCG Pocket. Nous ne prenons aucune commission sur les échanges et n'avons pas
              de fonctionnalités payantes.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-6" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-medium py-4">
            Comment fonctionne la page Communauté ?
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-muted-foreground">
            <p>La page Communauté vous permet de suivre l'activité des utilisateurs de PokéTrade :</p>
            <ol className="list-decimal pl-5 mt-2 space-y-2">
              <li>Consultez les statistiques globales de la plateforme</li>
              <li>Découvrez les cartes les plus demandées par la communauté</li>
              <li>Identifiez les dresseurs les plus actifs</li>
              <li>
                Suivez en temps réel les activités récentes comme les ajouts de cartes et les correspondances d'échange
              </li>
            </ol>
            <p className="mt-2">
              C'est un excellent moyen de rester informé des tendances et de l'activité de la communauté PokéTrade !
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-7" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-medium py-4">
            Comment signaler un problème ou un utilisateur ?
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-muted-foreground">
            <p>Si vous rencontrez un problème technique ou souhaitez signaler un utilisateur :</p>
            <ol className="list-decimal pl-5 mt-2 space-y-2">
              <li>
                Utilisez notre page{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact
                </Link>{" "}
                pour nous envoyer un message détaillé
              </li>
              <li>Précisez la nature du problème et incluez autant de détails que possible</li>
              <li>Pour signaler un utilisateur, indiquez son nom et ID en jeu, ainsi que la raison du signalement</li>
              <li>Notre équipe examinera votre demande et prendra les mesures appropriées</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Vous n'avez pas trouvé votre réponse ?</h2>
        <p className="mb-4">N'hésitez pas à nous contacter directement si vous avez d'autres questions.</p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Contactez-nous
        </Link>
      </div>
    </div>
  )
}

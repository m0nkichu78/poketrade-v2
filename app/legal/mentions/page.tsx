export const metadata = {
  title: "Mentions légales - PokéTrade",
  description: "Mentions légales de la plateforme PokéTrade",
}

export default function MentionsLegalesPage() {
  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-3xl font-bold mb-6">Mentions légales</h1>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Éditeur du site</h2>
          <p>Le site PokéTrade est édité par :</p>
          <p>
            <strong>PokéTrade SAS</strong>
            <br />
            Société par actions simplifiée au capital de 10 000 €<br />
            Siège social : 123 Avenue des Dresseurs, 75001 Paris, France
            <br />
            SIRET : 123 456 789 00012
            <br />
            RCS Paris B 123 456 789
            <br />
            N° TVA intracommunautaire : FR 12 123456789
            <br />
            Directeur de la publication : Jean Dupont
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Hébergement</h2>
          <p>Le site PokéTrade est hébergé par :</p>
          <p>
            <strong>Vercel Inc.</strong>
            <br />
            340 S Lemon Ave #4133
            <br />
            Walnut, CA 91789
            <br />
            États-Unis
            <br />
            <a href="https://vercel.com" className="text-primary hover:underline">
              https://vercel.com
            </a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Contact</h2>
          <p>Pour toute question concernant le site, vous pouvez nous contacter :</p>
          <p>
            Par email :{" "}
            <a href="mailto:contact.poketrade@free.fr" className="text-primary hover:underline">
              contact.poketrade@free.fr
            </a>
            <br />
            Par téléphone : +33 1 23 45 67 89
            <br />
            Par courrier : PokéTrade SAS, 123 Avenue des Dresseurs, 75001 Paris, France
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Propriété intellectuelle</h2>
          <p>
            La structure générale, les textes, images, graphismes, sons, vidéos et autres éléments composant le site
            sont la propriété exclusive de PokéTrade SAS.
          </p>
          <p>
            Toute représentation totale ou partielle de ce site par quelque procédé que ce soit, sans l'autorisation
            expresse de PokéTrade SAS, est interdite et constituerait une contrefaçon sanctionnée par les articles
            L.335-2 et suivants du Code de la propriété intellectuelle.
          </p>
          <p>
            Les marques et logos présents sur le site sont des marques déposées par PokéTrade SAS ou ses partenaires.
            Toute reproduction totale ou partielle de ces marques sans autorisation expresse est prohibée.
          </p>
          <p>
            <strong>Propriété intellectuelle Pokémon :</strong> Pokémon, Pokémon TCG Pocket et toutes les images de
            cartes, noms de personnages, noms d'extensions, illustrations, logos et marques associés sont la propriété
            de Nintendo, The Pokémon Company International, Game Freak, Creatures Inc. et DeNA Co., Ltd.
          </p>
          <p>
            PokéTrade n'est pas affilié, sponsorisé ou approuvé par ces entreprises. PokéTrade est une plateforme
            communautaire indépendante créée par des fans pour faciliter les échanges entre collectionneurs.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Données personnelles</h2>
          <p>
            Les informations recueillies sur ce site font l'objet d'un traitement informatique destiné à PokéTrade SAS
            pour la gestion de sa clientèle et la prospection commerciale.
          </p>
          <p>
            Conformément à la loi « informatique et libertés » du 6 janvier 1978 modifiée et au Règlement européen
            n°2016/679/UE du 27 avril 2016, vous bénéficiez d'un droit d'accès, de rectification, de portabilité et
            d'effacement de vos données ou encore de limitation du traitement. Vous pouvez également, pour des motifs
            légitimes, vous opposer au traitement des données vous concernant.
          </p>
          <p>
            Pour plus d'informations sur la gestion de vos données personnelles et l'exercice de vos droits, veuillez
            consulter notre{" "}
            <a href="/legal/privacy" className="text-primary hover:underline">
              Politique de confidentialité
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
          <p>
            Le site PokéTrade utilise des cookies pour améliorer l'expérience utilisateur. En naviguant sur ce site,
            vous acceptez l'utilisation de cookies conformément à notre{" "}
            <a href="/legal/privacy" className="text-primary hover:underline">
              Politique de confidentialité
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Limitation de responsabilité</h2>
          <p>
            PokéTrade SAS s'efforce d'assurer au mieux de ses possibilités l'exactitude et la mise à jour des
            informations diffusées sur ce site, dont elle se réserve le droit de corriger, à tout moment et sans
            préavis, le contenu.
          </p>
          <p>PokéTrade SAS décline toute responsabilité :</p>
          <ul className="list-disc pl-6 mb-4">
            <li>pour toute interruption du site ;</li>
            <li>pour toute survenance de bogues ;</li>
            <li>pour toute inexactitude ou omission portant sur des informations disponibles sur le site ;</li>
            <li>
              pour tous dommages résultant d'une intrusion frauduleuse d'un tiers ayant entraîné une modification des
              informations mises à la disposition sur le site ;
            </li>
            <li>
              et plus généralement de tout dommage direct ou indirect, quelles qu'en soient les causes, origines,
              natures ou conséquences.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Droit applicable et juridiction compétente</h2>
          <p>
            Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français
            seront seuls compétents.
          </p>
        </section>

        <p className="text-sm text-muted-foreground mt-12">Dernière mise à jour : 24 mars 2025</p>
      </div>
    </div>
  )
}

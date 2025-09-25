import type { Metadata } from "next"
import Link from "next/link"
import { SignUpForm } from "@/components/signup-form"

// Métadonnées
export const metadata: Metadata = {
  title: "Inscription - PokéTrade",
  description: "Créez un compte PokéTrade",
}

export default function SignUpPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          {/* Titre et description */}
          <h1 className="text-2xl font-semibold tracking-tight">Créer un compte</h1>
          <p className="text-sm text-muted-foreground">Entrez votre email ci-dessous pour créer votre compte</p>
        </div>
        <SignUpForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          {/* Lien de connexion */}
          <Link href="/login" className="hover:text-brand underline underline-offset-4">
            Vous avez déjà un compte ? Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  )
}

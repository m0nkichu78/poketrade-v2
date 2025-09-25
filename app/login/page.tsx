import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Connexion - PokéTrade",
  description: "Connectez-vous à votre compte PokéTrade",
}

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Bienvenue</h1>
          <p className="text-sm text-muted-foreground">Entrez votre email pour vous connecter à votre compte</p>
        </div>
        <LoginForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link href="/signup" className="hover:text-brand underline underline-offset-4">
            Vous n'avez pas de compte ? Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  )
}

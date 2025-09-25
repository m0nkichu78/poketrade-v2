"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getUrl } from "@/lib/url-utils"
import { activityService } from "@/lib/activity-service"

export function SignUpForm() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get the full callback URL using our utility function
      const redirectTo = getUrl("auth/callback")
      console.log("Redirect URL:", redirectTo) // For debugging

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
        },
      })

      if (error) {
        throw error
      }

      // Créer une activité pour le nouvel utilisateur
      if (data.user) {
        await activityService.createActivity({
          user_id: data.user.id,
          type: "user_signup",
          content: "a rejoint PokéTrade",
        })
      }

      toast({
        title: "Succès !",
        description: "Vérifiez votre email pour confirmer votre compte.",
      })

      router.push("/login")
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Échec de l'inscription",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="nom@exemple.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              placeholder="********"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect="off"
              disabled={isLoading}
              required
              minLength={6}
            />
          </div>
          <Button disabled={isLoading} type="submit">
            {isLoading ? "Création du compte..." : "Créer un compte"}
          </Button>
        </div>
      </form>
    </div>
  )
}

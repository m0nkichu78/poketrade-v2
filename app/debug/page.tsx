"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DebugPage() {
  const { supabase } = useSupabase()
  const [supabaseUrl, setSupabaseUrl] = useState<string | null>(null)
  const [authStatus, setAuthStatus] = useState<string>("Checking...")
  const [cardCount, setCardCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check environment variables
    setSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || null)

    // Check auth status
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setAuthStatus(session ? `Authenticated as ${session.user.email}` : "Not authenticated")
      } catch (err: any) {
        setAuthStatus(`Auth error: ${err.message}`)
      }
    }

    // Check database connection
    const checkDatabase = async () => {
      try {
        const { data, error } = await supabase.from("cards").select("count")
        if (error) throw error
        setCardCount(data[0]?.count || 0)
      } catch (err: any) {
        setError(`Database error: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
    checkDatabase()
  }, [supabase])

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Debug Information</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Checking if environment variables are properly set</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {supabaseUrl ? "✅ Set" : "❌ Not set"}
            </p>
            <p>
              <strong>NEXT_PUBLIC_SEED_SECRET_TOKEN:</strong>{" "}
              {process.env.NEXT_PUBLIC_SEED_SECRET_TOKEN ? "✅ Set" : "❌ Not set"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Checking authentication status</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Status:</strong> {authStatus}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Connection</CardTitle>
            <CardDescription>Checking database connection and data</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading database information...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <p>
                <strong>Card Count:</strong> {cardCount} cards in database
              </p>
            )}
          </CardContent>
        </Card>

        <Button asChild>
          <a href="/api/test-connection" target="_blank" rel="noopener noreferrer">
            Test API Connection
          </a>
        </Button>
      </div>
    </div>
  )
}

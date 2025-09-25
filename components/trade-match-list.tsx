"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

type CardWithId = {
  id: number
  card: {
    id: string
    name: string
    set_name: string
    pack: string
    rarity: string | null
    card_number: string
    image_url: string
  }
}

type User = {
  id: string
  in_game_name: string
  in_game_id: string
}

type TradeMatch = {
  user: User
  theyHave: CardWithId[]
  theyWant: CardWithId[]
}

export function TradeMatchList({
  matches,
  emptyMessage,
  emptyAction,
}: {
  matches: TradeMatch[]
  emptyMessage: string
  emptyAction: React.ReactNode
}) {
  if (matches.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">{emptyMessage}</p>
        {emptyAction}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {matches.map((match) => (
        <Card key={match.user.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{match.user.in_game_name || "Unnamed Trainer"}</span>
              <span className="text-sm font-normal text-muted-foreground">
                ID: {match.user.in_game_id || "Not set"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="theyHave" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="theyHave">They Have ({match.theyHave.length})</TabsTrigger>
                <TabsTrigger value="theyWant">They Want ({match.theyWant.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="theyHave" className="mt-4">
                {match.theyHave.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {match.theyHave.map(({ id, card }) => (
                      <Link key={id} href={`/cards/${card.id}`}>
                        <div className="space-y-2">
                          <div className="aspect-[2/3] relative rounded overflow-hidden">
                            <Image
                              src={card.image_url || "/placeholder.svg?height=300&width=200"}
                              alt={card.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="text-sm font-medium truncate">{card.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {card.set_name}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    This user doesn't have cards from your wishlist
                  </p>
                )}
              </TabsContent>
              <TabsContent value="theyWant" className="mt-4">
                {match.theyWant.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {match.theyWant.map(({ id, card }) => (
                      <Link key={id} href={`/cards/${card.id}`}>
                        <div className="space-y-2">
                          <div className="aspect-[2/3] relative rounded overflow-hidden">
                            <Image
                              src={card.image_url || "/placeholder.svg?height=300&width=200"}
                              alt={card.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="text-sm font-medium truncate">{card.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {card.set_name}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    This user doesn't want cards from your trade listings
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

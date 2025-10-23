"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { checkTokenAccess } from "@/lib/zora/token-gate"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Lock, Unlock, Search, Sparkles, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Drop {
  id: string
  title: string
  description: string
  content_type: string
  thumbnail_url?: string
  required_coin_balance: number
  required_coin_balance_usd: number
  creator_wallet_address: string
  creator_coin_address: string
  view_count: number
  created_at: string
  creator?: {
    display_name: string
    zora_handle: string
    profile_image?: string
  }
}

export default function ExplorePage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [drops, setDrops] = useState<Drop[]>([])
  const [filteredDrops, setFilteredDrops] = useState<Drop[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [accessMap, setAccessMap] = useState<Record<string, boolean>>({})
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    loadDrops()
  }, [])

  useEffect(() => {
    if (address && drops.length > 0) {
      checkAllAccess()
    }
  }, [address, drops])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = drops.filter(
        (drop) =>
          drop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          drop.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          drop.creator?.display_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredDrops(filtered)
    } else {
      setFilteredDrops(drops)
    }
  }, [searchQuery, drops])

  const loadDrops = async () => {
    if (!supabase) return

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("drops")
        .select(
          `
          *,
          creator:users!creator_wallet_address (
            display_name,
            zora_handle,
            profile_image
          )
        `
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading drops:", error)
        toast.error("Failed to load drops")
        return
      }

      setDrops(data || [])
      setFilteredDrops(data || [])
    } catch (error) {
      console.error("Network error:", error)
      toast.error("Network error loading drops")
    } finally {
      setIsLoading(false)
    }
  }

  const checkAllAccess = async () => {
    if (!address || drops.length === 0) return

    const accessChecks: Record<string, boolean> = {}

    await Promise.all(
      drops.map(async (drop) => {
        const { hasAccess } = await checkTokenAccess(
          address,
          drop.creator_coin_address,
          drop.required_coin_balance
        )
        accessChecks[drop.id] = hasAccess
      })
    )

    setAccessMap(accessChecks)
  }

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-x-hidden">
        <AuroraBackground />
        <Navigation />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 px-4 py-24 max-w-full">
        <div className="mx-auto max-w-7xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/20 border border-foreground/20">
              <Sparkles className="h-4 w-4 text-foreground animate-pulse" />
              <span className="text-sm font-semibold text-foreground">Discover Drops</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              Explore Token-Gated Content
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover exclusive drops from your favorite creators. Hold their coins to unlock premium content.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search drops or creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background border-foreground/20 focus:border-foreground pl-12 h-14 text-base"
              />
            </div>
          </div>

          {/* Drops Grid */}
          {filteredDrops.length === 0 ? (
            <Card className="glass-strong border-primary/20 max-w-2xl mx-auto">
              <CardContent className="py-12 text-center">
                <TrendingUp className="h-12 w-12 text-primary/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No drops found matching your search" : "No drops available yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrops.map((drop) => {
                const hasAccess = accessMap[drop.id] ?? false
                const creator = Array.isArray(drop.creator) ? drop.creator[0] : drop.creator

                return (
                  <Link key={drop.id} href={`/drops/${drop.id}`}>
                    <Card className="bg-background border-foreground/20 hover:border-foreground/40 transition-all group cursor-pointer h-full flex flex-col">
                      {/* Thumbnail */}
                      {drop.thumbnail_url ? (
                        <div className="aspect-video overflow-hidden rounded-t-2xl relative">
                          <img
                            src={drop.thumbnail_url}
                            alt={drop.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {!hasAccess && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                              <Lock className="h-12 w-12 text-white" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-video bg-background/10 rounded-t-2xl flex items-center justify-center">
                          {hasAccess ? (
                            <Unlock className="h-12 w-12 text-primary" />
                          ) : (
                            <Lock className="h-12 w-12 text-primary/50" />
                          )}
                        </div>
                      )}

                      {/* Content */}
                      <CardHeader className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          {creator?.profile_image ? (
                            <img
                              src={creator.profile_image}
                              alt={creator.display_name}
                              className="w-10 h-10 rounded-full border-2 border-primary"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="line-clamp-1 text-base">{drop.title}</CardTitle>
                            <p className="text-xs text-muted-foreground">
                              by {creator?.display_name || "Creator"}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {drop.description}
                        </p>
                      </CardHeader>

                      {/* Footer */}
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Required</span>
                            <span className="font-semibold text-primary">
                              {drop.required_coin_balance.toLocaleString()} tokens
                            </span>
                          </div>
                          <Button
                            className={`w-full rounded-full ${
                              hasAccess
                                ? "bg-gradient-to-r from-primary to-accent"
                                : "bg-muted text-muted-foreground"
                            }`}
                            asChild
                          >
                            <div className="flex items-center justify-center gap-2">
                              {hasAccess ? (
                                <>
                                  <Unlock className="h-4 w-4" />
                                  View Content
                                </>
                              ) : (
                                <>
                                  <Lock className="h-4 w-4" />
                                  Locked
                                </>
                              )}
                            </div>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
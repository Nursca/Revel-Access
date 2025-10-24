'use client'

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
import { Loader2, Lock, Unlock, Search, Sparkles, TrendingUp, Copy } from "lucide-react"
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

/* -- Simple local toast component used only on this page -- */
function LocalToast({ message, open }: { message: string; open: boolean }) {
  return (
    <div
      aria-live="polite"
      className={`fixed right-4 bottom-6 z-50 transition transform ${
        open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="rounded-lg bg-black/90 text-white px-4 py-2 text-sm shadow-lg">
        {message}
      </div>
    </div>
  )
}

export default function ExplorePage() {
  const { address } = useAccount()
  const router = useRouter()
  const [drops, setDrops] = useState<Drop[]>([])
  const [filteredDrops, setFilteredDrops] = useState<Drop[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [accessMap, setAccessMap] = useState<Record<string, boolean>>({})
  const supabase = getSupabaseBrowserClient()

  // Local toast state
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  useEffect(() => {
    loadDrops()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (address && drops.length > 0) {
      checkAllAccess()
    }
  }, [address, drops])

  useEffect(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const filtered = drops.filter(
        (drop) =>
          drop.title.toLowerCase().includes(q) ||
          drop.description?.toLowerCase().includes(q) ||
          drop.creator?.display_name.toLowerCase().includes(q)
      )
      setFilteredDrops(filtered)
    } else {
      setFilteredDrops(drops)
    }
  }, [searchQuery, drops])

  const showToast = (msg: string, ms = 2000) => {
    setToastMessage(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), ms)
  }

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
        showToast("Failed to load drops")
        return
      }

      setDrops((data as Drop[]) || [])
      setFilteredDrops((data as Drop[]) || [])
    } catch (error) {
      console.error("Network error:", error)
      showToast("Network error loading drops")
    } finally {
      setIsLoading(false)
    }
  }

  const checkAllAccess = async () => {
    if (!address || drops.length === 0) return

    const accessChecks: Record<string, boolean> = {}

    await Promise.all(
      drops.map(async (drop) => {
        try {
          const { hasAccess } = await checkTokenAccess(
            address,
            drop.creator_coin_address,
            drop.required_coin_balance
          )
          accessChecks[drop.id] = hasAccess
        } catch (e) {
          accessChecks[drop.id] = false
        }
      })
    )

    setAccessMap(accessChecks)
  }

  const copyDropLink = async (dropId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/drops/${dropId}`
    try {
      await navigator.clipboard.writeText(url)
      showToast("Link copied successfully!")
    } catch (err) {
      console.error("Clipboard error:", err)
      showToast("Failed to copy link")
    }
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

      {/* Sticky search wrapper */}
      <div className="relative z-10 px-3 sm:px-4 pt-20 max-w-full">
        <div className="mx-auto max-w-7xl w-full">
          {/* Header */}
          <div className="text-center space-y-3 sm:space-y-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-background/20 border border-foreground/20">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-foreground animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-foreground">Discover Drops</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary px-4">
              Explore Token-Gated Content
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
              Discover exclusive drops from creators. Hold their coins to unlock premium content.
            </p>
          </div>

          {/* Sticky Search Bar */}
          <div className="sticky top-16 z-40 bg-background/60 backdrop-blur-sm border-b border-border/20 py-3">
            <div className="max-w-4xl mx-auto px-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search drops or creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 sm:h-11 text-sm bg-background/90 border-border/30 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mt-4 px-2">
            {filteredDrops.length === 0 ? (
              <Card className="glass-strong border-primary/20 max-w-2xl mx-auto mt-6">
                <CardContent className="py-8 sm:py-10 text-center">
                  <TrendingUp className="h-8 w-8 text-primary/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "No drops found matching your search" : "No drops available yet"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              // compact grid: show more on screen
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {filteredDrops.map((drop) => {
                  const hasAccess = accessMap[drop.id] ?? false
                  const creator = Array.isArray(drop.creator) ? drop.creator[0] : drop.creator

                  return (
                    <Card
                      key={drop.id}
                      className="bg-background border-foreground/10 hover:border-foreground/30 transition-all group h-full flex flex-col rounded-lg overflow-hidden"
                    >
                      <Link href={`/drops/${drop.id}`} className="flex flex-col h-full">
                        {/* Thumbnail (smaller aspect to fit compact grid) */}
                        {drop.thumbnail_url ? (
                          <div className="aspect-[4/3] overflow-hidden relative">
                            <img
                              src={drop.thumbnail_url}
                              alt={drop.title}
                              className={`w-full h-full object-cover transition-all duration-500 ${
                                hasAccess
                                  ? 'group-hover:scale-105'
                                  : 'blur-md brightness-75 group-hover:blur-sm group-hover:brightness-90'
                              }`}
                            />
                            {!hasAccess && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <Lock className="h-6 w-6 text-white/90 drop-shadow-md" />
                              </div>
                            )}
                            </div>
                        ) : (
                          <div className="aspect-[4/3] bg-background/10 flex items-center justify-center">
                            {hasAccess ? (
                              <Unlock className="h-6 w-6 text-primary" />
                            ) : (
                              <Lock className="h-6 w-6 text-primary/50" />
                            )}
                          </div>
                        )}

                        {/* Content (compact) */}
                        <CardHeader className="flex-1 pb-2 px-2">
                          <div className="flex items-center gap-2 mb-1">
                            {creator?.profile_image ? (
                              <img
                                src={creator.profile_image}
                                alt={creator.display_name}
                                className="w-7 h-7 rounded-full border-2 border-primary flex-shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="h-3 w-3 text-primary" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <CardTitle className="line-clamp-1 text-xs font-semibold">{drop.title}</CardTitle>
                              <p className="text-[10px] text-muted-foreground truncate">by {creator?.display_name || "Creator"}</p>
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 px-1">
                            {drop.description}
                          </p>
                        </CardHeader>

                        {/* Footer */}
                        <CardContent className="pt-1 pb-2 px-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Req</span>
                            <span className="font-semibold text-primary text-[12px]">
                              {drop.required_coin_balance.toLocaleString()} tokens
                            </span>
                          </div>

                          <div className="flex gap-2 mt-2">
                            <Button
                              className={`flex-1 rounded-full text-xs py-1 ${
                                hasAccess ? "bg-gradient-to-r from-primary to-accent" : "bg-muted text-muted-foreground"
                              }`}
                              asChild
                            >
                              <div className="flex items-center justify-center gap-1">
                                {hasAccess ? <><Unlock className="h-3 w-3" />View</> : <><Lock className="h-3 w-3" />Locked</>}
                              </div>
                            </Button>

                            <button
                              onClick={(e) => copyDropLink(drop.id, e)}
                              aria-label="Copy link"
                              className="rounded-full border border-foreground/10 hover:border-foreground/30 h-8 w-8 flex items-center justify-center"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Local toast */}
      <LocalToast message={toastMessage} open={toastOpen} />
    </div>
  )
}

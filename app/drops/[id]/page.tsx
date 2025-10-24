'use client'

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useParams, useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { checkTokenAccess } from "@/lib/zora/token-gate"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Lock, Unlock, ExternalLink, Sparkles, Eye, Share2 } from "lucide-react"

interface Drop {
  id: string
  title: string
  description?: string
  content_type: string
  content_url?: string
  content_text?: string
  thumbnail_url?: string
  required_coin_balance: number
  required_coin_balance_usd?: number
  creator_coin_address: string
  view_count?: number
  unlock_count?: number
  created_at: string
  creator?: {
    display_name: string
    zora_handle: string
    profile_image?: string
  }
}

/* Local toast used on detail page */
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

export default function DropDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [drop, setDrop] = useState<Drop | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingAccess, setIsCheckingAccess] = useState(false)
  const supabase = getSupabaseBrowserClient()

  // local toast
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  useEffect(() => {
    if (params?.id) {
      loadDrop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id])

  useEffect(() => {
    if (drop && address) {
      checkAccess()
    }
  }, [drop, address])

  const showToast = (msg: string, ms = 2000) => {
    setToastMessage(msg)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), ms)
  }

  const loadDrop = async () => {
    if (!params?.id || !supabase) return

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
            profile_image,
            zora_creator_coin_address
          )
        `
        )
        .eq("id", params.id)
        .single()

      if (error) {
        console.error("Error loading drop:", error.message || error)
        showToast(`Drop not found`)
        router.push("/explore")
        return
      }

      if (!data) {
        console.error("Error loading drop: No data returned")
        showToast("Drop not found")
        router.push("/explore")
        return
      }

      setDrop(data as Drop)

      // Increment view count (best-effort)
      try {
        await supabase
          .from("drops")
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq("id", params.id)
      } catch (e) {
        // ignore
      }
    } catch (error) {
      console.error("Network error loading drop:", error)
      showToast("Failed to load drop")
    } finally {
      setIsLoading(false)
    }
  }

  const checkAccess = async () => {
    if (!address || !drop) return

    setIsCheckingAccess(true)

    try {
      const { hasAccess: access, userBalance: balance } = await checkTokenAccess(
        address,
        drop.creator_coin_address,
        drop.required_coin_balance
      )

      setHasAccess(access)
      setUserBalance(balance)

      if (access && supabase) {
        await supabase.from("drop_views").upsert(
          {
            drop_id: drop.id,
            viewer_wallet_address: address.toLowerCase(),
            coin_balance_at_view: balance,
          },
          { onConflict: "drop_id,viewer_wallet_address" }
        )

        // Increment unlock count (best-effort)
        try {
          await supabase
            .from("drops")
            .update({ unlock_count: (drop.unlock_count || 0) + 1 })
            .eq("id", drop.id)
        } catch (e) {
          // ignore
        }
      }
    } catch (error) {
      console.error("Error checking access:", error)
      setHasAccess(false)
    } finally {
      setIsCheckingAccess(false)
    }
  }

  const copyDropLink = async () => {
    const url = window.location.href
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

  if (!drop) {
    return null
  }

  const creator = Array.isArray(drop.creator) ? drop.creator[0] : drop.creator
  const tokensNeeded = Math.max(0, drop.required_coin_balance - userBalance)

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 px-3 sm:px-4 py-20 sm:py-24 max-w-full">
        <div className="mx-auto max-w-5xl w-full space-y-4 sm:space-y-6">
          {/* Back & Share Buttons */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="glass border-primary/30 text-sm sm:text-base"
              size="sm"
            >
              ← Back
            </Button>
            <Button
              variant="outline"
              onClick={copyDropLink}
              className="glass border-primary/30 gap-2 text-sm sm:text-base"
              size="sm"
            >
              <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Creator Info */}
              <div className="flex items-center gap-3 sm:gap-4">
                {creator?.profile_image ? (
                  <img
                    src={creator.profile_image}
                    alt={creator.display_name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-primary flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-lg sm:text-xl truncate">{creator?.display_name}</h3>
                  <a
                    href={`https://zora.co/${creator?.zora_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    @{creator?.zora_handle} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Drop Title & Description */}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{drop.title}</h1>
                {drop.description && (
                  <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">{drop.description}</p>
                )}
              </div>

              {/* Content Display */}
              <Card className="glass-strong border-primary/20">
                <CardContent className="p-0">
                  {isCheckingAccess ? (
                    <div className="aspect-video flex items-center justify-center">
                      <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary" />
                    </div>
                  ) : hasAccess ? (
                    <div className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-accent">
                        <Unlock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="font-semibold">Content Unlocked</span>
                      </div>

                      {drop.content_type === "image" && drop.content_url && (
                        <img
                          src={drop.content_url}
                          alt={drop.title}
                          className="w-full rounded-lg"
                        />
                      )}

                      {drop.content_type === "text" && drop.content_text && (
                        <div className="glass rounded-lg p-4 sm:p-6 border border-accent/20">
                          <pre className="whitespace-pre-wrap font-sans text-sm sm:text-base leading-relaxed">
                            {drop.content_text}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
                      {drop.thumbnail_url && (
                        <img
                          src={drop.thumbnail_url}
                          alt={drop.title}
                          className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30"
                        />
                      )}
                      <div className="relative z-10 text-center space-y-3 sm:space-y-4 p-4 sm:p-8">
                        <Lock className="h-16 w-16 sm:h-20 sm:w-20 text-primary mx-auto" />
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold mb-2">Content Locked</h3>
                          <p className="text-sm sm:text-base text-muted-foreground px-2">
                            Hold {drop.required_coin_balance.toLocaleString()} {creator?.display_name}'s coins to unlock
                          </p>
                        </div>

                        {isConnected ? (
                          <div className="glass rounded-lg p-3 sm:p-4 border border-primary/30 bg-background/80">
                            <p className="text-xs sm:text-sm mb-1 sm:mb-2">Your Balance: {userBalance.toFixed(2)} tokens</p>
                            <p className="text-base sm:text-lg font-bold text-primary">
                              Need {tokensNeeded.toFixed(2)} more tokens
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Connect your wallet to check access
                          </p>
                        )}

                        <Button
                          className="rounded-full bg-gradient-to-r from-primary to-accent px-6 sm:px-8 text-sm sm:text-base"
                          asChild
                        >
                          <a
                            href={`https://zora.co/${creator?.zora_handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Buy Coins on Zora <ExternalLink className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Access Requirements */}
              <Card className="glass-strong border-primary/20">
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base">Access Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Minimum Tokens</p>
                    <p className="text-xl sm:text-2xl font-bold text-primary">
                      {drop.required_coin_balance.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">USD Value (at creation)</p>
                    <p className="text-base sm:text-lg font-semibold">
                      ${drop.required_coin_balance_usd?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Creator Coin</p>
                    <p className="text-xs sm:text-sm font-mono break-all text-muted-foreground">
                      {drop.creator_coin_address.slice(0, 6)}...{drop.creator_coin_address.slice(-4)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="glass-strong border-accent/20">
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base">Drop Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Views
                    </span>
                    <span className="text-sm sm:text-base font-semibold">{drop.view_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                      <Unlock className="h-3 w-3" /> Unlocks
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-accent">{drop.unlock_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Type</span>
                    <span className="text-sm sm:text-base font-semibold capitalize">{drop.content_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Created</span>
                    <span className="text-xs">
                      {new Date(drop.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Your Access Status */}
              {isConnected && (
                <Card
                  className={`glass-strong ${hasAccess ? "border-accent/30 bg-accent/5" : "border-primary/30"}`}
                >
                  <CardHeader>
                    <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                      {hasAccess ? (
                        <>
                          <Unlock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
                          You Have Access
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                          Access Denied
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Your Balance</p>
                      <p className="text-base sm:text-lg font-bold">{userBalance.toFixed(2)} tokens</p>
                    </div>
                    {!hasAccess && tokensNeeded > 0 && (
                      <div className="glass rounded-lg p-2 sm:p-3 border border-primary/20">
                        <p className="text-xs text-muted-foreground mb-1">Tokens Needed</p>
                        <p className="text-lg sm:text-xl font-bold text-primary">
                          {tokensNeeded.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Local toast */}
      <LocalToast message={toastMessage} open={toastOpen} />
    </div>
  )
}

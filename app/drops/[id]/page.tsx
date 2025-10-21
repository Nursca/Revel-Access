"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useParams, useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { checkTokenAccess } from "@/lib/zora/token-gate"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Lock, Unlock, ExternalLink, Sparkles, Eye } from "lucide-react"
import { toast } from "sonner"

export default function DropDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [drop, setDrop] = useState<any>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingAccess, setIsCheckingAccess] = useState(false)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (params?.id) {
      loadDrop()
    }
  }, [params?.id])

  useEffect(() => {
    if (drop && address) {
      checkAccess()
    }
  }, [drop, address])

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
        toast.error(`Drop not found: ${error.message || "Unknown error"}`)
        router.push("/explore")
        return
      }

      if (!data) {
        console.error("Error loading drop: No data returned")
        toast.error("Drop not found")
        router.push("/explore")
        return
      }

      setDrop(data)

      // Increment view count
      await supabase
        .from("drops")
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq("id", params.id)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error("Network error loading drop:", errorMessage)
      toast.error(`Failed to load drop: ${errorMessage}`)
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

      // Track unlock if user has access
      if (access && supabase) {
        await supabase.from("drop_views").upsert(
          {
            drop_id: drop.id,
            viewer_wallet_address: address.toLowerCase(),
            coin_balance_at_view: balance,
          },
          { onConflict: "drop_id,viewer_wallet_address" }
        )

        // Increment unlock count
        await supabase
          .from("drops")
          .update({ unlock_count: (drop.unlock_count || 0) + 1 })
          .eq("id", drop.id)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error("Error checking access:", errorMessage)
      setHasAccess(false)
    } finally {
      setIsCheckingAccess(false)
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

      <div className="relative z-10 px-4 py-24 max-w-full">
        <div className="mx-auto max-w-5xl w-full space-y-8">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="glass border-primary/30"
          >
            ← Back
          </Button>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Creator Info */}
              <div className="flex items-center gap-4">
                {creator?.profile_image ? (
                  <img
                    src={creator.profile_image}
                    alt={creator.display_name}
                    className="w-16 h-16 rounded-full border-2 border-primary"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-xl">{creator?.display_name}</h3>
                  <a
                    href={`https://zora.co/${creator?.zora_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    @{creator?.zora_handle} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Drop Title & Description */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{drop.title}</h1>
                {drop.description && (
                  <p className="text-lg text-muted-foreground">{drop.description}</p>
                )}
              </div>

              {/* Content Display */}
              <Card className="glass-strong border-primary/20">
                <CardContent className="p-0">
                  {isCheckingAccess ? (
                    <div className="aspect-video flex items-center justify-center">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                  ) : hasAccess ? (
                    // UNLOCKED CONTENT
                    <div className="space-y-4 p-6">
                      <div className="flex items-center gap-2 text-sm text-accent">
                        <Unlock className="h-4 w-4" />
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
                        <div className="glass rounded-lg p-6 border border-accent/20">
                          <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
                            {drop.content_text}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    // LOCKED CONTENT
                    <div className="aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
                      {drop.thumbnail_url && (
                        <img
                          src={drop.thumbnail_url}
                          alt={drop.title}
                          className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30"
                        />
                      )}
                      <div className="relative z-10 text-center space-y-4 p-8">
                        <Lock className="h-20 w-20 text-primary mx-auto" />
                        <div>
                          <h3 className="text-2xl font-bold mb-2">Content Locked</h3>
                          <p className="text-muted-foreground">
                            Hold {drop.required_coin_balance.toLocaleString()} {creator?.display_name}'s
                            coins to unlock
                          </p>
                        </div>

                        {isConnected ? (
                          <div className="glass rounded-lg p-4 border border-primary/30 bg-background/80">
                            <p className="text-sm mb-2">Your Balance: {userBalance.toFixed(2)} tokens</p>
                            <p className="text-lg font-bold text-primary">
                              Need {tokensNeeded.toFixed(2)} more tokens
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Connect your wallet to check access
                          </p>
                        )}

                        <Button 
                          className="rounded-full bg-gradient-to-r from-primary to-accent px-8"
                          asChild
                        >
                          <a
                            href={`https://zora.co/${creator?.zora_handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Buy Coins on Zora <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Access Requirements */}
              <Card className="glass-strong border-primary/20">
                <CardHeader>
                  <CardTitle className="text-base">Access Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Minimum Tokens</p>
                    <p className="text-2xl font-bold text-primary">
                      {drop.required_coin_balance.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">USD Value (at creation)</p>
                    <p className="text-lg font-semibold">
                      ${drop.required_coin_balance_usd?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Creator Coin</p>
                    <p className="text-sm font-mono break-all text-muted-foreground">
                      {drop.creator_coin_address.slice(0, 6)}...{drop.creator_coin_address.slice(-4)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="glass-strong border-accent/20">
                <CardHeader>
                  <CardTitle className="text-base">Drop Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Views
                    </span>
                    <span className="font-semibold">{drop.view_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Unlock className="h-3 w-3" /> Unlocks
                    </span>
                    <span className="font-semibold text-accent">{drop.unlock_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <span className="font-semibold capitalize">{drop.content_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-xs">
                      {new Date(drop.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Your Access Status */}
              {isConnected && (
                <Card
                  className={`glass-strong ${
                    hasAccess ? "border-accent/30 bg-accent/5" : "border-primary/30"
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      {hasAccess ? (
                        <>
                          <Unlock className="h-4 w-4 text-accent" />
                          You Have Access
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 text-primary" />
                          Access Denied
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Your Balance</p>
                      <p className="text-lg font-bold">{userBalance.toFixed(2)} tokens</p>
                    </div>
                    {!hasAccess && tokensNeeded > 0 && (
                      <div className="glass rounded-lg p-3 border border-primary/20">
                        <p className="text-xs text-muted-foreground mb-1">Tokens Needed</p>
                        <p className="text-xl font-bold text-primary">
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
    </div>
  )
}
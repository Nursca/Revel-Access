"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAccount } from "wagmi"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { useTokenVerification } from "@/hooks/use-token-verification"
import { Lock, Unlock, Eye, Users, ArrowLeft, Loader2, ExternalLink } from "lucide-react"
import Link from "next/link"
import type { Drop } from "@/lib/types"
import { formatTokenAmount } from "@/lib/token-verification"
import { getDropById, incrementDropViews, recordUnlock, hasUserUnlocked } from "@/lib/db/drops"

export default function DropDetailPage() {
  const params = useParams()
  const { address, isConnected } = useAccount()
  const [drop, setDrop] = useState<Drop | null>(null)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [hasUnlocked, setHasUnlocked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Token verification
  const {
    isLoading: isVerifying,
    hasAccess,
    balance,
  } = useTokenVerification(drop?.tokenAddress || "", drop?.tokenRequirement || "0")

  useEffect(() => {
    async function loadDrop() {
      if (!params.id || typeof params.id !== "string") return

      setIsLoading(true)
      const foundDrop = await getDropById(params.id)
      if (foundDrop) {
        setDrop(foundDrop)
        await incrementDropViews(params.id)

        // Check if user has already unlocked
        if (address) {
          const unlocked = await hasUserUnlocked(params.id, address)
          setHasUnlocked(unlocked)
        }
      }
      setIsLoading(false)
    }

    loadDrop()
  }, [params.id, address])

  const handleUnlock = async () => {
    if (!hasAccess || !drop || !address || hasUnlocked) return

    setIsUnlocking(true)
    const result = await recordUnlock(drop.id, address)

    if (result.success) {
      setHasUnlocked(true)
      // Refresh drop data
      const updatedDrop = await getDropById(drop.id)
      if (updatedDrop) setDrop(updatedDrop)
    }

    setIsUnlocking(false)
  }

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <AuroraBackground />
        <Navigation />
        <div className="relative z-10 text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading drop...</p>
        </div>
      </div>
    )
  }

  if (!drop) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <AuroraBackground />
        <Navigation />
        <div className="relative z-10 text-center">
          <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Drop not found</h3>
          <Link href="/explore" className="text-primary hover:underline">
            Back to Explore
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 px-4 py-24">
        <div className="mx-auto max-w-4xl">
          {/* Back Button */}
          <Link
            href="/explore"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
          </Link>

          <div className="glass-strong overflow-hidden rounded-3xl">
            {/* Drop Header */}
            <div className="border-b border-border p-8">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {drop.creatorImage ? (
                    <img
                      src={drop.creatorImage || "/placeholder.svg"}
                      alt={drop.creatorName}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {drop.creatorName[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{drop.creatorName}</h3>
                    <p className="text-sm text-muted-foreground">Creator</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    drop.status === "active"
                      ? "bg-primary/10 text-primary"
                      : drop.status === "draft"
                        ? "bg-muted-foreground/10 text-muted-foreground"
                        : "bg-accent/10 text-accent"
                  }`}
                >
                  {drop.status}
                </span>
              </div>

              <h1 className="mb-3 text-3xl font-bold">{drop.title}</h1>
              <p className="mb-6 text-muted-foreground">{drop.description}</p>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {drop.views || 0} views
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {drop.unlocks || 0} unlocks
                </span>
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium">{drop.contentType}</span>
              </div>
            </div>

            {/* Token Gate Status */}
            <div className="border-b border-border bg-surface/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="mb-1 font-semibold">Token Requirement</h3>
                  <p className="text-sm text-muted-foreground">
                    Hold at least {formatTokenAmount(drop.tokenRequirement)} {drop.creatorName} Creator Coins
                  </p>
                </div>

                {isConnected ? (
                  <div className="text-right">
                    {isVerifying ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                      </div>
                    ) : hasAccess ? (
                      <div className="flex items-center gap-2 text-primary">
                        <Unlock className="h-5 w-5" />
                        <div>
                          <div className="text-sm font-semibold">Access Granted</div>
                          <div className="text-xs text-muted-foreground">Balance: {formatTokenAmount(balance)}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Lock className="h-5 w-5" />
                        <div>
                          <div className="text-sm font-semibold">Locked</div>
                          <div className="text-xs">Balance: {formatTokenAmount(balance)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Connect wallet to verify</div>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="p-8">
              {!isConnected ? (
                <div className="py-12 text-center">
                  <Lock className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="mb-2 text-xl font-semibold">Connect Your Wallet</h3>
                  <p className="mb-6 text-muted-foreground">Connect your wallet to unlock this exclusive content</p>
                </div>
              ) : isVerifying ? (
                <div className="py-12 text-center">
                  <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-primary" />
                  <h3 className="mb-2 text-xl font-semibold">Verifying Token Balance</h3>
                  <p className="text-muted-foreground">Checking your Creator Coin balance...</p>
                </div>
              ) : hasAccess ? (
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                      <Unlock className="h-5 w-5" />
                      <span className="font-semibold">Content Unlocked</span>
                    </div>
                    {!hasUnlocked && (
                      <Button
                        onClick={handleUnlock}
                        disabled={isUnlocking}
                        className="rounded-full bg-gradient-to-r from-primary to-accent px-6 py-2 font-bold text-background"
                      >
                        {isUnlocking ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Recording...
                          </>
                        ) : (
                          "Record Unlock"
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Content Preview */}
                  <div className="glass overflow-hidden rounded-2xl">
                    {drop.thumbnailUrl && (
                      <img
                        src={drop.thumbnailUrl || "/placeholder.svg"}
                        alt={drop.title}
                        className="aspect-video w-full object-cover"
                      />
                    )}
                    <div className="p-6">
                      <p className="mb-4 text-sm text-muted-foreground">
                        Access the full {drop.contentType} content below
                      </p>
                      <a
                        href={drop.contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 font-semibold text-background hover:opacity-90"
                      >
                        View Content
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Lock className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="mb-2 text-xl font-semibold">Insufficient Token Balance</h3>
                  <p className="mb-6 text-muted-foreground">
                    You need {formatTokenAmount(drop.tokenRequirement)} {drop.creatorName} Creator Coins to unlock this
                    content
                  </p>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Your balance: {formatTokenAmount(balance)} tokens
                  </p>
                  <Button className="rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 font-bold text-background">
                    Get Creator Coins
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

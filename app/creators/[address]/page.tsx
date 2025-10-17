"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Lock, Eye, Users, ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"
import type { Drop } from "@/lib/types"
import type { UserProfile } from "@/lib/auth"

export default function CreatorProfilePage() {
  const params = useParams()
  const [creator, setCreator] = useState<UserProfile | null>(null)
  const [drops, setDrops] = useState<Drop[]>([])

  useEffect(() => {
    // TODO: Fetch creator profile and drops from database when Supabase is connected
    // For now, load from localStorage
    const savedDrops = localStorage.getItem("revel_drops")
    if (savedDrops) {
      const allDrops: Drop[] = JSON.parse(savedDrops)
      const creatorDrops = allDrops.filter((drop) => drop.creatorAddress === params.address && drop.status === "active")
      setDrops(creatorDrops)

      // Get creator info from first drop
      if (creatorDrops.length > 0) {
        const firstDrop = creatorDrops[0]
        setCreator({
          walletAddress: firstDrop.creatorAddress,
          role: "creator",
          displayName: firstDrop.creatorName,
          bio: "",
          profileImage: firstDrop.creatorImage,
          createdAt: "",
        })
      }
    }
  }, [params.address])

  if (!creator) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <AuroraBackground />
        <Navigation />
        <div className="relative z-10 text-center">
          <p className="text-muted-foreground">Creator not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 px-4 py-24">
        <div className="mx-auto max-w-7xl">
          {/* Back Button */}
          <Link
            href="/creators"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Creators
          </Link>

          {/* Creator Header */}
          <div className="glass-strong mb-8 rounded-3xl p-8">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              {/* Avatar */}
              {creator.profileImage ? (
                <img
                  src={creator.profileImage || "/placeholder.svg"}
                  alt={creator.displayName}
                  className="h-24 w-24 rounded-full ring-4 ring-primary/20"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary ring-4 ring-primary/20">
                  {creator.displayName[0]}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="mb-2 text-3xl font-bold">{creator.displayName}</h1>
                <p className="mb-4 text-muted-foreground">{creator.bio || "Creator on Revel"}</p>

                <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{drops.length}</span>
                    <span className="text-muted-foreground">Drops</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-accent" />
                    <span className="font-semibold">{drops.reduce((sum, drop) => sum + (drop.unlocks || 0), 0)}</span>
                    <span className="text-muted-foreground">Unlocks</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Button className="rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 font-bold text-background">
                Get Creator Coins
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Drops Section */}
          <div>
            <h2 className="mb-6 text-2xl font-bold">Exclusive Drops</h2>

            {drops.length === 0 ? (
              <div className="glass-strong rounded-3xl py-16 text-center">
                <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No active drops</h3>
                <p className="text-muted-foreground">This creator hasn't published any drops yet</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {drops.map((drop) => (
                  <DropCard key={drop.id} drop={drop} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DropCard({ drop }: { drop: Drop }) {
  return (
    <Link href={`/drops/${drop.id}`}>
      <div className="glass group relative overflow-hidden rounded-2xl transition-all hover:border-primary hover:glow-primary">
        {/* Thumbnail */}
        {drop.thumbnailUrl ? (
          <div className="aspect-video overflow-hidden">
            <img
              src={drop.thumbnailUrl || "/placeholder.svg"}
              alt={drop.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center bg-surface">
            <Lock className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Lock Badge */}
        <div className="absolute right-3 top-3 rounded-full bg-background/80 p-2 backdrop-blur-sm">
          <Lock className="h-4 w-4 text-primary" />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="mb-2 line-clamp-1 font-semibold">{drop.title}</h3>
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{drop.description}</p>

          <div className="flex items-center justify-between">
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium">{drop.contentType}</span>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {drop.views || 0}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {drop.unlocks || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

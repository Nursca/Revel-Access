"use client"

import { useEffect, useState } from "react"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { Input } from "@/components/ui/input"
import { Search, Lock, Users } from "lucide-react"
import Link from "next/link"
import { getAllCreators } from "@/lib/db/users"
import type { UserProfile } from "@/lib/auth"
import { getAllDrops } from "@/lib/db/drops"

interface CreatorWithStats extends UserProfile {
  dropCount: number
  totalUnlocks: number
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState<CreatorWithStats[]>([])
  const [filteredCreators, setFilteredCreators] = useState<CreatorWithStats[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCreators() {
      setIsLoading(true)
      const allCreators = await getAllCreators()
      const allDrops = await getAllDrops({ status: "active" })

      // Add stats to creators
      const creatorsWithStats: CreatorWithStats[] = allCreators.map((creator) => {
        const creatorDrops = allDrops.filter(
          (drop) => drop.creatorAddress.toLowerCase() === creator.walletAddress.toLowerCase(),
        )
        return {
          ...creator,
          dropCount: creatorDrops.length,
          totalUnlocks: creatorDrops.reduce((sum, drop) => sum + (drop.unlocks || 0), 0),
        }
      })

      setCreators(creatorsWithStats)
      setFilteredCreators(creatorsWithStats)
      setIsLoading(false)
    }

    loadCreators()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = creators.filter((creator) =>
        creator.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredCreators(filtered)
    } else {
      setFilteredCreators(creators)
    }
  }, [searchQuery, creators])

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 px-4 py-24">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold">Discover Creators</h1>
            <p className="text-muted-foreground">Find and support your favorite creators on Revel</p>
          </div>

          {/* Search */}
          <div className="glass-strong mb-8 rounded-3xl p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass border-border bg-surface pl-10"
              />
            </div>
          </div>

          {/* Creators Grid */}
          {isLoading ? (
            <div className="glass-strong rounded-3xl py-16 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 animate-pulse text-muted-foreground" />
              <p className="text-muted-foreground">Loading creators...</p>
            </div>
          ) : filteredCreators.length === 0 ? (
            <div className="glass-strong rounded-3xl py-16 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No creators found</h3>
              <p className="text-muted-foreground">Try adjusting your search query</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCreators.map((creator) => (
                <CreatorCard key={creator.walletAddress} creator={creator} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CreatorCard({ creator }: { creator: CreatorWithStats }) {
  return (
    <Link href={`/creators/${creator.walletAddress}`}>
      <div className="glass group relative overflow-hidden rounded-2xl p-6 transition-all hover:border-primary hover:glow-primary">
        {/* Creator Avatar */}
        <div className="mb-4 flex justify-center">
          {creator.profileImage ? (
            <img
              src={creator.profileImage || "/placeholder.svg"}
              alt={creator.displayName}
              className="h-20 w-20 rounded-full ring-2 ring-primary/20 transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary ring-2 ring-primary/20">
              {creator.displayName[0]}
            </div>
          )}
        </div>

        {/* Creator Info */}
        <h3 className="mb-2 text-center text-xl font-bold">{creator.displayName}</h3>
        {creator.bio && <p className="mb-4 line-clamp-2 text-center text-sm text-muted-foreground">{creator.bio}</p>}

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1 text-primary">
              <Lock className="h-4 w-4" />
            </div>
            <div className="text-lg font-bold">{creator.dropCount}</div>
            <div className="text-xs text-muted-foreground">Drops</div>
          </div>
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1 text-accent">
              <Users className="h-4 w-4" />
            </div>
            <div className="text-lg font-bold">{creator.totalUnlocks}</div>
            <div className="text-xs text-muted-foreground">Unlocks</div>
          </div>
        </div>
      </div>
    </Link>
  )
}

"use client"

import { useEffect, useState } from "react"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Lock, Eye, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import type { Drop } from "@/lib/types"
import { getAllDrops } from "@/lib/db/drops"

export default function ExplorePage() {
  const [drops, setDrops] = useState<Drop[]>([])
  const [filteredDrops, setFilteredDrops] = useState<Drop[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [contentTypeFilter, setContentTypeFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("recent")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDrops() {
      setIsLoading(true)
      const activeDrops = await getAllDrops({ status: "active" })
      setDrops(activeDrops)
      setFilteredDrops(activeDrops)
      setIsLoading(false)
    }
    loadDrops()
  }, [])

  useEffect(() => {
    let filtered = [...drops]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (drop) =>
          drop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          drop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          drop.creatorName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Content type filter
    if (contentTypeFilter !== "all") {
      filtered = filtered.filter((drop) => drop.contentType === contentTypeFilter)
    }

    // Sort
    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === "popular") {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
    } else if (sortBy === "unlocks") {
      filtered.sort((a, b) => (b.unlocks || 0) - (a.unlocks || 0))
    }

    setFilteredDrops(filtered)
  }, [searchQuery, contentTypeFilter, sortBy, drops])

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 px-4 py-24">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold">Explore Drops</h1>
            <p className="text-muted-foreground">Discover exclusive content from your favorite creators</p>
          </div>

          {/* Filters */}
          <div className="glass-strong mb-8 rounded-3xl p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Search */}
              <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search drops or creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass border-border bg-surface pl-10"
                />
              </div>

              {/* Content Type Filter */}
              <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                <SelectTrigger className="glass border-border bg-surface">
                  <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="glass border-border bg-surface">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="unlocks">Most Unlocks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{drops.length}</div>
                  <div className="text-sm text-muted-foreground">Active Drops</div>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-accent/10 p-3">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{new Set(drops.map((d) => d.creatorAddress)).size}</div>
                  <div className="text-sm text-muted-foreground">Creators</div>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{drops.reduce((sum, drop) => sum + (drop.unlocks || 0), 0)}</div>
                  <div className="text-sm text-muted-foreground">Total Unlocks</div>
                </div>
              </div>
            </div>
          </div>

          {/* Drops Grid */}
          {isLoading ? (
            <div className="glass-strong rounded-3xl py-16 text-center">
              <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Loading Drops</h3>
              <p className="text-muted-foreground">Please wait while we fetch the drops for you</p>
            </div>
          ) : filteredDrops.length === 0 ? (
            <div className="glass-strong rounded-3xl py-16 text-center">
              <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No drops found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDrops.map((drop) => (
                <DropCard key={drop.id} drop={drop} />
              ))}
            </div>
          )}
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
          {/* Creator Info */}
          <div className="mb-3 flex items-center gap-2">
            {drop.creatorImage ? (
              <img
                src={drop.creatorImage || "/placeholder.svg"}
                alt={drop.creatorName}
                className="h-6 w-6 rounded-full"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {drop.creatorName[0]}
              </div>
            )}
            <span className="text-sm font-medium text-muted-foreground">{drop.creatorName}</span>
          </div>

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

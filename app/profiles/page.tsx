"use client"

import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Search, Users, Sparkles, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Profile {
  wallet_address: string
  zora_handle: string
  display_name: string
  bio: string
  profile_image: string
  is_creator: boolean
  zora_creator_coin_address: string
  created_at: string
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "creators" | "fans">("all")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    loadProfiles()
  }, [])

  useEffect(() => {
    filterProfiles()
  }, [searchQuery, filterType, profiles])

  const loadProfiles = async () => {
    if (!supabase) return

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading profiles:", error)
        toast.error("Failed to load profiles")
        return
      }

      setProfiles(data || [])
      setFilteredProfiles(data || [])
    } catch (error) {
      console.error("Network error:", error)
      toast.error("Network error")
    } finally {
      setIsLoading(false)
    }
  }

  const filterProfiles = () => {
    let filtered = profiles

    // Filter by type
    if (filterType === "creators") {
      filtered = filtered.filter(p => p.is_creator)
    } else if (filterType === "fans") {
      filtered = filtered.filter(p => !p.is_creator)
    }

    // Filter by search
    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.zora_handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredProfiles(filtered)
  }

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-x-hidden">
        <AuroraBackground />
        <Navigation />
        <div className="relative z-10 flex min-h-screen items-center justify-center pt-16">
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30">
              <Users className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">Community</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Discover Profiles
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore creators and fans in the Revel community
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass border-primary/30 focus:border-primary pl-12 h-12"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setFilterType("all")}
                className={`glass ${
                  filterType === "all" 
                    ? "border-primary bg-primary/10 text-primary" 
                    : "border-primary/30"
                }`}
              >
                All ({profiles.length})
              </Button>
              <Button
                variant="outline"
                onClick={() => setFilterType("creators")}
                className={`glass ${
                  filterType === "creators" 
                    ? "border-primary bg-primary/10 text-primary" 
                    : "border-primary/30"
                }`}
              >
                Creators ({profiles.filter(p => p.is_creator).length})
              </Button>
              <Button
                variant="outline"
                onClick={() => setFilterType("fans")}
                className={`glass ${
                  filterType === "fans" 
                    ? "border-accent bg-accent/10 text-accent" 
                    : "border-accent/30"
                }`}
              >
                Fans ({profiles.filter(p => !p.is_creator).length})
              </Button>
            </div>
          </div>

          {/* Profiles Grid */}
          {filteredProfiles.length === 0 ? (
            <Card className="glass-strong border-primary/20">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-primary/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No profiles found matching your search" : "No profiles yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProfiles.map((profile) => (
                <Card 
                  key={profile.wallet_address} 
                  className="glass-strong border-primary/20 hover:border-primary/40 transition-all group h-full"
                >
                  <CardContent className="pt-6 space-y-4">
                    {/* Avatar */}
                    <Link href={`/profiles/${profile.zora_handle}`} className="block">
                      <div className="relative cursor-pointer">
                        {profile.profile_image ? (
                          <img
                            src={profile.profile_image}
                            alt={profile.display_name}
                            className="w-20 h-20 rounded-full mx-auto border-2 border-primary group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto border-2 border-primary group-hover:scale-110 transition-transform">
                            <Users className="h-10 w-10 text-primary" />
                          </div>
                        )}
                        {profile.is_creator && (
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-white text-xs font-semibold">
                            <Sparkles className="h-3 w-3" />
                            Creator
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="text-center space-y-2 mt-4">
                        <h3 className="font-bold text-lg line-clamp-1">{profile.display_name}</h3>
                        <p className="text-sm text-muted-foreground">@{profile.zora_handle}</p>
                        {profile.bio && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {profile.bio}
                          </p>
                        )}
                      </div>
                    </Link>

                    {/* Zora Link - Standalone, not nested */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full glass border-accent/30 hover:border-accent"
                      asChild
                    >
                      <a
                        href={`https://zora.co/${profile.zora_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2"
                      >
                        View on Zora
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
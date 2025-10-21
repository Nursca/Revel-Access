"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { fetchCreatorCoin, formatCurrency, formatNumber } from "@/lib/zora/profile"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Loader2, 
  ExternalLink, 
  Users, 
  TrendingUp, 
  Sparkles,
  ArrowLeft,
  Calendar
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [drops, setDrops] = useState<any[]>([])
  const [coinStats, setCoinStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (params?.handle) {
      loadProfile()
    }
  }, [params?.handle])

  const loadProfile = async () => {
    if (!params?.handle || !supabase) return

    setIsLoading(true)

    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("zora_handle", params.handle)
        .single()

      if (profileError || !profileData) {
        toast.error("Profile not found")
        router.push("/profiles")
        return
      }

      setProfile(profileData)

      // Fetch drops if creator
      if (profileData.is_creator) {
        const { data: dropsData } = await supabase
          .from("drops")
          .select("*")
          .eq("creator_wallet_address", profileData.wallet_address)
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        setDrops(dropsData || [])

        // Fetch coin stats
        if (profileData.zora_handle) {
          const coin = await fetchCreatorCoin(profileData.zora_handle)
          setCoinStats(coin)
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
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

  if (!profile) {
    return null
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 px-4 py-24 max-w-full">
        <div className="mx-auto max-w-6xl w-full space-y-8">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="glass border-primary/30"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {/* Profile Header */}
          <Card className="glass-strong border-primary/20">
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar */}
                <div className="shrink-0">
                  {profile.profile_image ? (
                    <img
                      src={profile.profile_image}
                      alt={profile.display_name}
                      className="w-32 h-32 rounded-full border-4 border-primary shadow-glow-primary"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary">
                      <Users className="h-16 w-16 text-primary" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl md:text-4xl font-bold">{profile.display_name}</h1>
                      {profile.is_creator && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-white text-sm font-semibold">
                          <Sparkles className="h-4 w-4" />
                          Creator
                        </span>
                      )}
                    </div>
                    <p className="text-lg text-muted-foreground">@{profile.zora_handle}</p>
                  </div>

                  {profile.bio && (
                    <p className="text-muted-foreground">{profile.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Joined {new Date(profile.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {profile.wallet_address.slice(0, 6)}...{profile.wallet_address.slice(-4)}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="glass border-accent/30 hover:border-accent"
                      asChild
                    >
                      <a
                        href={`https://zora.co/${profile.zora_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Zora
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Creator Stats */}
          {profile.is_creator && coinStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-strong border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Market Cap
                  </CardTitle>
                </CardHeader><CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(parseFloat(coinStats.marketCap))}
                  </p>
                </CardContent>
              </Card>          <Card className="glass-strong border-accent/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                Coin Holders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {coinStats.uniqueHolders.toLocaleString()}
              </p>
            </CardContent>
          </Card>          <Card className="glass-strong border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Token Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(coinStats.pricePerToken)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}      {/* Creator Drops */}
      {profile.is_creator && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Exclusive Drops</h2>
          {drops.length === 0 ? (
            <Card className="glass-strong border-primary/20">
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 text-primary/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No drops yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drops.map((drop) => (
                <Link key={drop.id} href={`/drops/${drop.id}`}>
                  <Card className="glass-strong border-primary/20 hover:border-primary/40 transition-all group cursor-pointer h-full">
                    {drop.thumbnail_url && (
                      <div className="aspect-video overflow-hidden rounded-t-2xl">
                        <img
                          src={drop.thumbnail_url}
                          alt={drop.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{drop.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {drop.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Required</span>
                        <span className="font-semibold text-primary">
                          {drop.required_coin_balance.toLocaleString()} tokens
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  </div>
</div>
)
}
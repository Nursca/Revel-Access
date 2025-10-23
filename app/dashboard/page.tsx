"use client"

import { useState, useEffect } from "react"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { fetchCreatorCoin, formatCurrency, formatNumber } from "@/lib/zora/profile"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Users, TrendingUp, Sparkles, Eye } from "lucide-react"
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
  view_count: number
  unlock_count: number
  is_active: boolean
  created_at: string
}

export default function DashboardPage() {
  const { ready, authenticated } = usePrivy()
  const { wallets } = useWallets()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [drops, setDrops] = useState<Drop[]>([])
  const [coinStats, setCoinStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()

  const address = wallets[0]?.address
  const isConnected = authenticated && !!address

  useEffect(() => {
    if (!ready) return
    
    if (!isConnected || !address) {
      router.push("/auth")
      return
    }

    loadDashboard()
  }, [ready, isConnected, address, router])

  const loadDashboard = async () => {
    if (!address || !supabase) return

    setIsLoading(true)

    try {
      // Fetch user from Supabase
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", address.toLowerCase())
        .single()

      if (userError || !userData) {
        toast.error("Profile not found. Please sign in with Zora.")
        router.push("/auth")
        return
      }

      if (!userData.is_creator) {
        toast.error("This page is for creators only.")
        router.push("/explore")
        return
      }

      setUser(userData)

      // Fetch creator's drops
      const { data: dropsData, error: dropsError } = await supabase
        .from("drops")
        .select("*")
        .eq("creator_wallet_address", address.toLowerCase())
        .order("created_at", { ascending: false })

      if (dropsError) {
        console.error("Error fetching drops:", dropsError)
      } else {
        setDrops(dropsData || [])
      }

      // Fetch coin stats from Zora
      if (userData.zora_handle) {
        const coin = await fetchCreatorCoin(userData.zora_handle)
        setCoinStats(coin)
      }
    } catch (error) {
      console.error("Dashboard load error:", error)
      toast.error("Failed to load dashboard")
    } finally {
      setIsLoading(false)
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

      <div className="relative z-10 px-4 py-24 max-w-full">
        <div className="mx-auto max-w-7xl w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Creator Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Welcome back, {user?.display_name || user?.zora_handle}
              </p>
            </div>
            <Link href="/drops/create">
              <Button className="rounded-full bg-gradient-to-r from-primary to-accent px-8 py-6 text-lg font-bold shadow-glow-primary">
                <Plus className="mr-2 h-5 w-5" />
                Create Drop
              </Button>
            </Link>
          </div>

          {/* Coin Stats */}
          {coinStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="glass-strong border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Market Cap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(parseFloat(coinStats.marketCap))}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-strong border-accent/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" />
                    Holders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {coinStats.uniqueHolders.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-strong border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Price/Token
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(coinStats.pricePerToken)}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-strong border-accent/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Eye className="h-4 w-4 text-accent" />
                    Total Drops
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {drops.length}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Drops List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Drops</h2>
            {drops.length === 0 ? (
              <Card className="glass-strong border-primary/20">
                <CardContent className="py-12 text-center">
                  <Sparkles className="h-12 w-12 text-primary/50 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You haven't created any drops yet
                  </p>
                  <Link href="/drops/create">
                    <Button className="rounded-full bg-gradient-to-r from-primary to-accent">
                      Create Your First Drop
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drops.map((drop) => (
                  <Link key={drop.id} href={`/drops/${drop.id}`}>
                    <Card className="glass-strong border-primary/20 hover:border-primary/40 transition-all group cursor-pointer">
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
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Required</span>
                          <span className="font-semibold text-primary">
                            {drop.required_coin_balance.toLocaleString()} tokens
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Eye className="h-3 w-3" /> Views
                          </span>
                          <span className="font-semibold">{drop.view_count}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Unlocks</span>
                          <span className="font-semibold text-accent">{drop.unlock_count}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
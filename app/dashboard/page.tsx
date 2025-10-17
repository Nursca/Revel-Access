"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, Users, Eye, Lock, BarChart3 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface Drop {
  id: string
  creator_address: string
  title: string
  description: string
  content_type: 'video' | 'audio' | 'image' | 'text'
  content_url: string
  thumbnail_url?: string
  status: 'draft' | 'active' | 'archived'
  views: number
  unlocks: number
  created_at: string
}

interface Stats {
  total_drops: number
  total_views: number
  total_unlocks: number
  active_drops: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [user, setUser] = useState<any>(null)
  const [drops, setDrops] = useState<Drop[]>([])
  const [stats, setStats] = useState<Stats>({ total_drops: 0, total_views: 0, total_unlocks: 0, active_drops: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!isConnected || !address) {
      router.replace("/onboarding")
      return
    }

    const loadData = async () => {
      setIsLoading(true)
      try {
        // Fetch user
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('wallet_address', address)
          .single()

        if (userError || !userData || userData.role !== 'creator') {
          toast.error("Access denied—complete creator setup first")
          router.replace("/onboarding/creator")
          return
        }

        setUser(userData)

        // Fetch stats via RPC
        const { data: statsData } = await supabase.rpc('get_creator_stats', { creator_addr: address })
        if (statsData) {
          setStats(statsData[0])
        }

        // Fetch drops
        const { data: dropsData, error: dropsError } = await supabase
          .from('drops')
          .select('*')
          .eq('creator_address', address)
          .order('created_at', { ascending: false })

        if (dropsError) {
          toast.error("Failed to load drops")
        } else {
          setDrops(dropsData || [])
        }
      } catch (error) {
        console.error('Dashboard load error:', error)
        toast.error("Failed to load dashboard")
        router.replace("/onboarding")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router, address, isConnected, supabase])

  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <AuroraBackground />
        <Navigation />
        <div className="relative z-10 px-4 py-24">
          <div className="mx-auto max-w-7xl space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 px-4 py-24">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold">Creator Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.display_name}</p>
            </div>
            <Link href="/dashboard/drops/new">
              <Button className="rounded-full bg-gradient-to-r from-primary to-accent px-6 py-6 font-bold text-background hover:shadow-glow-primary transition-all">
                <Plus className="mr-2 h-5 w-5" />
                Create Drop
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<Lock className="h-6 w-6 text-primary" />} label="Total Drops" value={stats.total_drops} />
            <StatCard icon={<TrendingUp className="h-6 w-6 text-accent" />} label="Active Drops" value={stats.active_drops} />
            <StatCard icon={<Eye className="h-6 w-6 text-primary" />} label="Total Views" value={stats.total_views} />
            <StatCard icon={<Users className="h-6 w-6 text-accent" />} label="Total Unlocks" value={stats.total_unlocks} />
          </div>

          {/* Drops Section */}
          <div className="glass-strong rounded-3xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Drops</h2>
              <Link href="/dashboard/drops">
                <Button variant="outline" className="rounded-full">View All</Button>
              </Link>
            </div>

            {drops.length === 0 ? (
              <div className="py-12 text-center">
                <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No drops yet</h3>
                <p className="mb-6 text-muted-foreground">Create your first token-gated drop to get started</p>
                <Link href="/dashboard/drops/new">
                  <Button className="rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 font-bold text-background">
                    <Plus className="mr-2 h-5 w-5" />
                    Create Your First Drop
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {drops.slice(0, 6).map((drop) => (
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

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="glass-strong hover:shadow-glow-primary transition-shadow">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="rounded-full bg-primary/10 p-3">{icon}</div>
        </div>
        <div className="text-3xl font-bold text-foreground">{value.toLocaleString()}</div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}

function DropCard({ drop }: { drop: Drop }) {
  return (
    <Link href={`/drops/${drop.id}`} className="block">
      <Card className="glass-strong group relative overflow-hidden rounded-2xl transition-all hover:shadow-glow-primary cursor-pointer border-2 border-transparent hover:border-primary">
        {/* Thumbnail */}
        {drop.thumbnail_url ? (
          <div className="aspect-video overflow-hidden">
            <img
              src={drop.thumbnail_url}
              alt={drop.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center bg-muted">
            <Lock className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Content */}
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                drop.status === "active"
                  ? "bg-primary/10 text-primary"
                  : drop.status === "draft"
                    ? "bg-muted-foreground/10 text-muted-foreground"
                    : "bg-accent/10 text-accent"
              }`}
            >
              {drop.status}
            </span>
            <span className="text-xs text-muted-foreground capitalize">{drop.content_type}</span>
          </div>

          <CardTitle className="mb-2 line-clamp-1 font-semibold group-hover:text-primary transition-colors">{drop.title}</CardTitle>
          <CardDescription className="mb-4 line-clamp-2 text-sm">{drop.description}</CardDescription>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {drop.views} views
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {drop.unlocks} unlocks
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
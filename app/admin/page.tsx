"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Lock, TrendingUp, Eye, Shield, AlertCircle, CheckCircle, XCircle, MoreVertical } from "lucide-react"
import type { Drop } from "@/lib/types"
import type { UserProfile } from "@/lib/auth"
import Link from "next/link"

// Admin wallet addresses (in production, this would be in env vars or database)
const ADMIN_ADDRESSES = ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"]

export default function AdminPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCreators: 0,
    totalFans: 0,
    totalDrops: 0,
    activeDrops: 0,
    totalViews: 0,
    totalUnlocks: 0,
  })
  const [drops, setDrops] = useState<Drop[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])

  useEffect(() => {
    // Check if user is admin
    if (!isConnected || !address) {
      router.push("/")
      return
    }

    const isAdminUser = ADMIN_ADDRESSES.includes(address)
    if (!isAdminUser) {
      router.push("/")
      return
    }

    setIsAdmin(true)

    // Load data
    loadAdminData()
  }, [address, isConnected, router])

  const loadAdminData = () => {
    // TODO: Fetch from database when Supabase is connected
    // For now, load from localStorage

    // Load drops
    const savedDrops = localStorage.getItem("revel_drops")
    if (savedDrops) {
      const allDrops: Drop[] = JSON.parse(savedDrops)
      setDrops(allDrops)

      // Calculate stats
      const activeDrops = allDrops.filter((d) => d.status === "active")
      const totalViews = allDrops.reduce((sum, drop) => sum + (drop.views || 0), 0)
      const totalUnlocks = allDrops.reduce((sum, drop) => sum + (drop.unlocks || 0), 0)

      setStats((prev) => ({
        ...prev,
        totalDrops: allDrops.length,
        activeDrops: activeDrops.length,
        totalViews,
        totalUnlocks,
      }))
    }

    // Load users (mock data for now)
    const mockUsers: UserProfile[] = [
      {
        walletAddress: "0x123...",
        role: "creator",
        displayName: "Sample Creator",
        bio: "Creating amazing content",
        createdAt: new Date().toISOString(),
      },
    ]
    setUsers(mockUsers)
    setStats((prev) => ({
      ...prev,
      totalUsers: mockUsers.length,
      totalCreators: mockUsers.filter((u) => u.role === "creator").length,
      totalFans: mockUsers.filter((u) => u.role === "fan").length,
    }))
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 px-4 py-24">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">Platform management and analytics</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<Users className="h-6 w-6 text-primary" />} label="Total Users" value={stats.totalUsers} />
            <StatCard
              icon={<Lock className="h-6 w-6 text-accent" />}
              label="Total Drops"
              value={stats.totalDrops}
              subtitle={`${stats.activeDrops} active`}
            />
            <StatCard icon={<Eye className="h-6 w-6 text-primary" />} label="Total Views" value={stats.totalViews} />
            <StatCard
              icon={<TrendingUp className="h-6 w-6 text-accent" />}
              label="Total Unlocks"
              value={stats.totalUnlocks}
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="glass-strong">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="drops">Drops</TabsTrigger>
              <TabsTrigger value="moderation">Moderation</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="glass-strong rounded-3xl p-6">
                <h2 className="mb-6 text-2xl font-bold">Platform Health</h2>

                <div className="space-y-4">
                  <HealthItem
                    icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                    label="System Status"
                    value="Operational"
                    status="success"
                  />
                  <HealthItem
                    icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                    label="Database"
                    value="Connected"
                    status="success"
                  />
                  <HealthItem
                    icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                    label="Token Verification"
                    value="Active"
                    status="success"
                  />
                  <HealthItem
                    icon={<AlertCircle className="h-5 w-5 text-yellow-500" />}
                    label="Pending Moderation"
                    value={`${drops.filter((d) => d.status === "draft").length} items`}
                    status="warning"
                  />
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="glass-strong rounded-3xl p-6">
                  <h3 className="mb-4 text-xl font-bold">User Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Creators</span>
                      <span className="font-semibold">{stats.totalCreators}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Fans</span>
                      <span className="font-semibold">{stats.totalFans}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <span className="font-semibold">Total</span>
                      <span className="font-semibold">{stats.totalUsers}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-strong rounded-3xl p-6">
                  <h3 className="mb-4 text-xl font-bold">Drop Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Active</span>
                      <span className="font-semibold">{stats.activeDrops}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Draft</span>
                      <span className="font-semibold">{drops.filter((d) => d.status === "draft").length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Archived</span>
                      <span className="font-semibold">{drops.filter((d) => d.status === "archived").length}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <span className="font-semibold">Total</span>
                      <span className="font-semibold">{stats.totalDrops}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="glass-strong rounded-3xl p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">User Management</h2>
                  <Button variant="outline" className="glass bg-transparent">
                    Export Users
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">User</th>
                        <th className="pb-3 font-medium">Role</th>
                        <th className="pb-3 font-medium">Wallet</th>
                        <th className="pb-3 font-medium">Joined</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.walletAddress} className="border-b border-border/50">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              {user.profileImage ? (
                                <img
                                  src={user.profileImage || "/placeholder.svg"}
                                  alt={user.displayName}
                                  className="h-10 w-10 rounded-full"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                  {user.displayName[0]}
                                </div>
                              )}
                              <div>
                                <div className="font-semibold">{user.displayName}</div>
                                <div className="text-sm text-muted-foreground">{user.bio?.slice(0, 30)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                user.role === "creator" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 font-mono text-sm text-muted-foreground">
                            {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                          </td>
                          <td className="py-4 text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Drops Tab */}
            <TabsContent value="drops">
              <div className="glass-strong rounded-3xl p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Drop Management</h2>
                  <Button variant="outline" className="glass bg-transparent">
                    Export Drops
                  </Button>
                </div>

                <div className="space-y-4">
                  {drops.map((drop) => (
                    <div key={drop.id} className="glass flex items-center justify-between rounded-2xl p-4">
                      <div className="flex items-center gap-4">
                        {drop.thumbnailUrl ? (
                          <img
                            src={drop.thumbnailUrl || "/placeholder.svg"}
                            alt={drop.title}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-surface">
                            <Lock className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{drop.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            by {drop.creatorName} • {drop.contentType}
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
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
                      <div className="flex items-center gap-3">
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
                        <Link href={`/drops/${drop.id}`}>
                          <Button variant="outline" size="sm" className="glass bg-transparent">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Moderation Tab */}
            <TabsContent value="moderation">
              <div className="glass-strong rounded-3xl p-6">
                <h2 className="mb-6 text-2xl font-bold">Content Moderation</h2>

                <div className="space-y-4">
                  {drops
                    .filter((d) => d.status === "draft")
                    .map((drop) => (
                      <div key={drop.id} className="glass rounded-2xl p-4">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h3 className="mb-1 font-semibold">{drop.title}</h3>
                            <p className="mb-2 text-sm text-muted-foreground">{drop.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Submitted by {drop.creatorName} on {new Date(drop.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-500">
                            Pending Review
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <Button size="sm" className="bg-green-500 hover:bg-green-600">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="glass bg-transparent text-red-500">
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                          <Link href={`/drops/${drop.id}`}>
                            <Button size="sm" variant="outline" className="glass bg-transparent">
                              Review
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}

                  {drops.filter((d) => d.status === "draft").length === 0 && (
                    <div className="py-12 text-center">
                      <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                      <h3 className="mb-2 text-lg font-semibold">All caught up!</h3>
                      <p className="text-muted-foreground">No content pending moderation</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode
  label: string
  value: number
  subtitle?: string
}) {
  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-full bg-surface p-3">{icon}</div>
      </div>
      <div className="text-3xl font-bold">{value.toLocaleString()}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {subtitle && <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>}
    </div>
  )
}

function HealthItem({
  icon,
  label,
  value,
  status,
}: {
  icon: React.ReactNode
  label: string
  value: string
  status: "success" | "warning" | "error"
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <span
        className={`text-sm font-semibold ${
          status === "success" ? "text-green-500" : status === "warning" ? "text-yellow-500" : "text-red-500"
        }`}
      >
        {value}
      </span>
    </div>
  )
}

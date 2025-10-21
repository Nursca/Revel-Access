"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Loader2,
  Users,
  FileText,
  TrendingUp,
  Eye,
  Trash2,
  Search,
  Shield,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"

// Get admin wallets from environment variable
const getAdminWallets = (): string[] => {
  const wallets = process.env.NEXT_PUBLIC_ADMIN_WALLETS || ""
  return wallets.split(",").map((w) => w.trim().toLowerCase()).filter(Boolean)
}

const ADMIN_WALLETS = getAdminWallets()

interface User {
  wallet_address: string
  display_name: string
  zora_handle: string
  profile_image?: string
  is_creator: boolean
  created_at: string
}

interface Drop {
  id: string
  title: string
  description?: string
  is_active: boolean
  view_count: number
  unlock_count: number
  creator: {
    display_name: string
  }[]
}

export default function AdminDashboard() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCreators: 0,
    totalFans: 0,
    totalDrops: 0,
    totalViews: 0,
    totalUnlocks: 0,
  })
  const [users, setUsers] = useState<User[]>([])
  const [drops, setDrops] = useState<Drop[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "drops">("overview")
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!isConnected || !address) {
      router.push("/auth")
      return
    }

    if (ADMIN_WALLETS.length === 0) {
      toast.error("No admin wallets configured. Set NEXT_PUBLIC_ADMIN_WALLETS in .env.local")
      router.push("/explore")
      return
    }

    if (!ADMIN_WALLETS.includes(address.toLowerCase())) {
      toast.error("Access denied. Admin only.")
      router.push("/explore")
      return
    }

    setIsAdmin(true)
    loadDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, router])

  const loadDashboardData = async () => {
    if (!supabase) return

    setIsLoading(true)

    try {
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (usersError) throw usersError

      const { data: dropsData, error: dropsError } = await supabase
        .from("drops")
        .select(
          `
          *,
          creator:users!creator_wallet_address (
            display_name,
            zora_handle
          )
        `
        )
        .order("created_at", { ascending: false })

      if (dropsError) throw dropsError

      setUsers(usersData || [])
      setDrops(dropsData || [])

      const creators = (usersData || []).filter((u: User) => u.is_creator)
      const fans = (usersData || []).filter((u: User) => !u.is_creator)
      const totalViews = (dropsData || []).reduce((sum: number, d: Drop) => sum + (d.view_count || 0), 0)
      const totalUnlocks = (dropsData || []).reduce((sum: number, d: Drop) => sum + (d.unlock_count || 0), 0)

      setStats({
        totalUsers: usersData?.length || 0,
        totalCreators: creators.length,
        totalFans: fans.length,
        totalDrops: dropsData?.length || 0,
        totalViews,
        totalUnlocks,
      })
    } catch (error) {
      console.error("Error loading admin data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (walletAddress: string) => {
    if (!confirm("Are you sure you want to delete this user? This will also delete all their drops.")) {
      return
    }

    try {
      const { error } = await supabase!
        .from("users")
        .delete()
        .eq("wallet_address", walletAddress)

      if (error) throw error

      toast.success("User deleted successfully")
      loadDashboardData()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user")
    }
  }

  const handleDeleteDrop = async (dropId: string) => {
    if (!confirm("Are you sure you want to delete this drop?")) {
      return
    }

    try {
      const { error } = await supabase!
        .from("drops")
        .delete()
        .eq("id", dropId)

      if (error) throw error

      toast.success("Drop deleted successfully")
      loadDashboardData()
    } catch (error) {
      console.error("Error deleting drop:", error)
      toast.error("Failed to delete drop")
    }
  }

  const handleToggleDropStatus = async (dropId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase!
        .from("drops")
        .update({ is_active: !currentStatus })
        .eq("id", dropId)

      if (error) throw error

      toast.success(`Drop ${!currentStatus ? "activated" : "deactivated"}`)
      loadDashboardData()
    } catch (error) {
      console.error("Error toggling drop status:", error)
      toast.error("Failed to update drop status")
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.zora_handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.wallet_address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredDrops = drops.filter(
    (drop) =>
      drop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drop.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  if (!isAdmin) {
    return null
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 px-4 py-24 max-w-full">
        <div className="mx-auto max-w-7xl w-full space-y-8">
          <div className="flex items-center gap-4">
            <div className="inline-flex rounded-full bg-destructive/10 p-3">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">Platform management & analytics</p>
            </div>
          </div>

          <Card className="glass-strong border-destructive/30 bg-destructive/5">
            <CardContent className="py-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive font-medium">
                Admin access detected. Handle user data responsibly.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="glass-strong border-primary/20">
              <CardContent className="pt-6">
                <Users className="h-4 w-4 text-primary mb-2" />
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </CardContent>
            </Card>

            <Card className="glass-strong border-accent/20">
              <CardContent className="pt-6">
                <Users className="h-4 w-4 text-accent mb-2" />
                <p className="text-2xl font-bold">{stats.totalCreators}</p>
                <p className="text-xs text-muted-foreground">Creators</p>
              </CardContent>
            </Card>

            <Card className="glass-strong border-primary/20">
              <CardContent className="pt-6">
                <Users className="h-4 w-4 text-primary mb-2" />
                <p className="text-2xl font-bold">{stats.totalFans}</p>
                <p className="text-xs text-muted-foreground">Fans</p>
              </CardContent>
            </Card>

            <Card className="glass-strong border-accent/20">
              <CardContent className="pt-6">
                <FileText className="h-4 w-4 text-accent mb-2" />
                <p className="text-2xl font-bold">{stats.totalDrops}</p>
                <p className="text-xs text-muted-foreground">Total Drops</p>
              </CardContent>
            </Card>

            <Card className="glass-strong border-primary/20">
              <CardContent className="pt-6">
                <Eye className="h-4 w-4 text-primary mb-2" />
                <p className="text-2xl font-bold">{stats.totalViews}</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </CardContent>
            </Card>

            <Card className="glass-strong border-accent/20">
              <CardContent className="pt-6">
                <TrendingUp className="h-4 w-4 text-accent mb-2" />
                <p className="text-2xl font-bold">{stats.totalUnlocks}</p>
                <p className="text-xs text-muted-foreground">Unlocks</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2 border-b border-border">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("overview")}
              className={`rounded-none border-b-2 ${
                activeTab === "overview" ? "border-primary text-primary" : "border-transparent"
              }`}
            >
              Overview
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("users")}
              className={`rounded-none border-b-2 ${
                activeTab === "users" ? "border-primary text-primary" : "border-transparent"
              }`}
            >
              Users ({stats.totalUsers})
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("drops")}
              className={`rounded-none border-b-2 ${
                activeTab === "drops" ? "border-primary text-primary" : "border-transparent"
              }`}
            >
              Drops ({stats.totalDrops})
            </Button>
          </div>

          {(activeTab === "users" || activeTab === "drops") && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass border-primary/30 pl-10"
              />
            </div>
          )}

          {activeTab === "users" && (
            <Card className="glass-strong border-primary/20">
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Wallet</th>
                        <th className="text-left py-3 px-4">Role</th>
                        <th className="text-left py-3 px-4">Joined</th>
                        <th className="text-right py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.wallet_address} className="border-b border-border/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {user.profile_image ? (
                                <img
                                  src={user.profile_image}
                                  alt={user.display_name}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                  <Users className="h-4 w-4 text-primary" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold">{user.display_name}</p>
                                <p className="text-xs text-muted-foreground">@{user.zora_handle}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-xs font-mono text-muted-foreground">
                              {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                user.is_creator ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                              }`}
                            >
                              {user.is_creator ? "Creator" : "Fan"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user.wallet_address)}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "drops" && (
            <Card className="glass-strong border-primary/20">
              <CardHeader>
                <CardTitle>All Drops</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4">Drop</th>
                        <th className="text-left py-3 px-4">Creator</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Views</th>
                        <th className="text-left py-3 px-4">Unlocks</th>
                        <th className="text-right py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDrops.map((drop) => {
                        const creator = Array.isArray(drop.creator) ? drop.creator[0] : (drop.creator as any)
                        return (
                          <tr key={drop.id} className="border-b border-border/50">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-semibold">{drop.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {drop.description}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">{creator?.display_name}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                  drop.is_active ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {drop.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm">{drop.view_count || 0}</td>
                            <td className="py-3 px-4 text-sm">{drop.unlock_count || 0}</td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleDropStatus(drop.id, drop.is_active)}
                                className="text-xs"
                              >
                                {drop.is_active ? "Deactivate" : "Activate"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteDrop(drop.id)}
                                className="text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
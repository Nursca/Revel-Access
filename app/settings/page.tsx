"use client"

import { useState, useEffect } from "react"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, User, Sparkles, ExternalLink, Shield, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function SettingsPage() {
  const { ready, authenticated } = usePrivy()
  const { wallets } = useWallets()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
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
    loadUser()
  }, [ready, isConnected, address, router])

  const loadUser = async () => {
    if (!address || !supabase) return

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", address.toLowerCase())
        .single()

      if (error || !data) {
        toast.error("Profile not found. Please sign in with Zora.")
        router.push("/auth")
        return
      }

      setUser(data)
    } catch (error) {
      console.error("Error loading user:", error)
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

  if (!user) {
    return null
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 px-4 py-24 max-w-full">
        <div className="mx-auto max-w-4xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your profile and preferences
            </p>
          </div>

          {/* Profile Info (Read-Only) */}
          <Card className="bg-background border-foreground/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-foreground" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                {user.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.display_name}
                    className="w-20 h-20 rounded-full border-2 border-primary"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{user.display_name}</h3>
                  <p className="text-sm text-muted-foreground">@{user.zora_handle}</p>
                  {user.is_creator && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mt-2">
                      <Sparkles className="h-3 w-3" />
                      Creator
                    </span>
                  )}
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bio</label>
                  <div className="mt-1 glass rounded-lg p-4 border border-primary/20">
                    <p className="text-sm">{user.bio}</p>
                  </div>
                </div>
              )}

              {/* Wallet */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
                <div className="mt-1 glass rounded-lg p-3 border border-primary/20">
                  <p className="text-sm font-mono">{user.wallet_address}</p>
                </div>
              </div>

              {/* Creator Coin */}
              {user.is_creator && user.zora_creator_coin_address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Creator Coin Address</label>
                  <div className="mt-1 glass rounded-lg p-3 border border-primary/20">
                    <p className="text-sm font-mono">{user.zora_creator_coin_address}</p>
                  </div>
                </div>
              )}

              {/* Info Alert */}
              <div className="glass rounded-lg p-4 border border-accent/20 bg-accent/5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-accent mb-1">Profile Data Synced from Zora</p>
                    <p className="text-muted-foreground">
                      Your profile information is automatically imported from your Zora profile. 
                      To update your name, bio, or avatar, edit your profile on Zora and sign in again to Revel.
                    </p>
                  </div>
                </div>
              </div>

              {/* Zora Link */}
              <Button
                variant="outline"
                className="w-full glass border-accent/30 hover:border-accent"
                asChild
              >
                <a
                  href={`https://zora.co/${user.zora_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  Edit Profile on Zora
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="glass-strong border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Last Sign In</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.last_sign_in).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <Link href={`/profiles/${user.zora_handle}`}>
                  <Button variant="outline" className="w-full glass border-primary/30">
                    View Public Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
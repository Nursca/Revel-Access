"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { ConnectWallet } from "@/components/connect-wallet"
import { Users, Sparkles, ArrowRight, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

export default function OnboardingPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [selectedRole, setSelectedRole] = useState<"creator" | "fan" | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const supabase = getSupabaseBrowserClient()

  const handleContinue = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!selectedRole) {
      toast.error("Please select a role")
      return
    }

    setIsChecking(true)
    try {
      // Quick profile check
      if (supabase) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', address)
          .single()

        if (!existingUser) {
          toast.info("Complete your profile to continue")
          // Route to profile modal or handle here
          return
        }
      }

      router.push(`/onboarding/${selectedRole}`)
    } catch (error) {
      toast.error("Something went wrong—try again")
    } finally {
      setIsChecking(false)
    }
  }

  const progress = selectedRole ? 50 : 0

  const handleCardClick = (role: "creator" | "fan") => {
    setSelectedRole(role)
    toast.info(`${role === "creator" ? "Creator" : "Fan"} mode selected!`)
  }

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-20">
        <div className="w-full max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome to Revel
            </h1>
            <p className="text-lg text-muted-foreground">Choose how you want to experience the platform</p>
            <div className="mt-6 w-full max-w-md mx-auto">
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {!isConnected && (
            <div className="mb-8 text-center">
              <p className="mb-4 text-muted-foreground">Connect your wallet to get started</p>
              <div className="flex justify-center">
                <ConnectWallet />
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Creator Card */}
            <button
              onClick={() => handleCardClick("creator")}
              className={`glass-strong group relative overflow-hidden rounded-3xl p-8 text-left transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 ${selectedRole === "creator" ? "border-primary glow-primary" : "border-transparent"}`}
            >
              <div className="relative z-10">
                <div className="inline-flex rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mb-3 text-2xl font-bold mt-6">I'm a Creator</CardTitle>
                <CardDescription className="mb-6 text-muted-foreground">
                  Share exclusive content with your community. Create token-gated drops and build deeper connections with your fans.
                </CardDescription>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    Create exclusive drops
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    Token-gate your content
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    Build your community
                  </li>
                </ul>
                {selectedRole === "creator" && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
                    <CheckCircle className="h-4 w-4" />
                    Selected
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Fan Card */}
            <button
              onClick={() => handleCardClick("fan")}
              className={`glass-strong group relative overflow-hidden rounded-3xl p-8 text-left transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 ${selectedRole === "fan" ? "border-accent glow-accent" : "border-transparent"}`}
            >
              <div className="relative z-10">
                <div className="inline-flex rounded-full bg-accent/10 p-4 group-hover:bg-accent/20 transition-colors">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="mb-3 text-2xl font-bold mt-6">I'm a Fan</CardTitle>
                <CardDescription className="mb-6 text-muted-foreground">
                  Discover and unlock exclusive content from your favorite creators. Support them directly and get access to premium experiences.
                </CardDescription>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    Discover exclusive drops
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    Unlock premium content
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    Support creators directly
                  </li>
                </ul>
                {selectedRole === "fan" && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-accent mb-2">
                    <CheckCircle className="h-4 w-4" />
                    Selected
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          {/* Continue Button */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleContinue}
              disabled={!selectedRole || !isConnected || isChecking}
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-8 py-6 text-lg font-bold text-background disabled:opacity-50 hover:shadow-glow-primary transition-all duration-300"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>

          {!isConnected && (
            <p className="mt-4 text-center text-sm text-muted-foreground animate-pulse">Connect your wallet to unlock the experience</p>
          )}
        </div>
      </div>
    </div>
  )
}
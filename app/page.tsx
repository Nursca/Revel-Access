"use client"

import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Lock, Users, Zap, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  const { ready, authenticated } = usePrivy()
  const { wallets } = useWallets()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<{ is_creator: boolean } | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const supabase = getSupabaseBrowserClient()

  const address = wallets[0]?.address

  useEffect(() => {
    async function fetchProfile() {
      if (authenticated && address && supabase) {
        setProfileLoading(true)
        try {
          const { data } = await supabase
            .from("users")
            .select("is_creator")
            .eq("wallet_address", address.toLowerCase())
            .single()
          
          if (data) {
            setUserProfile(data)
          }
        } catch (error) {
          console.error("Error fetching profile:", error)
        } finally {
          setProfileLoading(false)
        }
      } else {
        setUserProfile(null)
      }
    }
    fetchProfile()
  }, [authenticated, address, supabase])

  // Determine CTA button text and destination
  const getCtaButton = () => {
    if (!ready) {
      return (
        <Button disabled className="rounded-full bg-gradient-to-r from-primary to-accent px-12 py-8 text-xl font-bold">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Loading...
        </Button>
      )
    }

    if (authenticated && userProfile) {
      const destination = userProfile.is_creator ? "/dashboard" : "/explore"
      const text = userProfile.is_creator ? "Go to Dashboard" : "Explore Drops"
      
      return (
        <Link href={destination}>
          <Button className="rounded-full bg-gradient-to-r from-primary to-accent px-12 py-8 text-xl font-bold shadow-glow-primary hover:scale-105 transition-all hover:shadow-2xl">
            {text}
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>
        </Link>
      )
    }

    if (authenticated && profileLoading) {
      return (
        <Button disabled className="rounded-full bg-gradient-to-r from-primary to-accent px-12 py-8 text-xl font-bold">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Loading Profile...
        </Button>
      )
    }

    if (authenticated && !userProfile) {
      return (
        <Link href="/auth">
          <Button className="rounded-full bg-gradient-to-r from-primary to-accent px-12 py-8 text-xl font-bold shadow-glow-primary hover:scale-105 transition-all hover:shadow-2xl">
            Complete Sign In
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>
        </Link>
      )
    }

    return (
      <Link href="/auth">
        <Button className="rounded-full bg-gradient-to-r from-primary to-accent px-12 py-8 text-xl font-bold shadow-glow-primary hover:scale-105 transition-all hover:shadow-2xl">
          Get Started
          <Sparkles className="ml-2 h-6 w-6" />
        </Button>
      </Link>
    )
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="px-4 py-24 md:py-32 text-center">
          <div className="mx-auto max-w-6xl space-y-10">
            {/* Logo with Shine Effect */}
            <div className="flex justify-center mb-8 animate-fade-in">
              <div className="relative group">
                {/* Glowing background */}
                <div className="absolute inset-0 -m-6 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur-3xl opacity-40 group-hover:opacity-60 animate-pulse transition-opacity" />
                
                {/* Logo */}
                <div className="relative">
                  <Image
                    src="/revel-logo.png"
                    alt="Revel"
                    width={140}
                    height={140}
                    className="relative z-10 drop-shadow-2xl"
                  />
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent animate-shimmer" style={{ width: '200%', height: '200%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-primary/30 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">Powered by Zora & Base</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold leading-[1.1] animate-fade-in tracking-tight" style={{ animationDelay: '0.2s' }}>
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Turn Your Zora Coins
              </span>
              <br />
              <span className="text-foreground">Into Access Keys</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Revel Access lets creators share exclusive content with their community using Zora Creator Coins as token gates. 
              <span className="block mt-2 font-semibold text-foreground">No new tokens. No code. Simple on-chain access.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-fade-in pt-4" style={{ animationDelay: '0.4s' }}>
              {getCtaButton()}
              <Link href="/explore">
                <Button variant="outline" className="rounded-full glass border-primary/30 px-12 py-8 text-xl font-semibold hover:bg-primary/5 hover:border-primary/50 transition-all">
                  Explore Drops
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-4 py-28">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Creators Choose Revel</h2>
              <p className="text-xl text-muted-foreground">Built for the next generation of creator economy</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="glass-strong border-primary/20 hover:border-primary/50 transition-all group hover:scale-105 hover:shadow-glow-primary">
                <CardContent className="pt-10 pb-8 px-8 space-y-5">
                  <div className="inline-flex rounded-full bg-primary/10 p-5 group-hover:bg-primary/20 transition-colors">
                    <Lock className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Token-Gated Drops</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Share exclusive content that only your coin holders can access. Set custom token requirements in real-time.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-strong border-accent/20 hover:border-accent/50 transition-all group hover:scale-105 hover:shadow-glow-accent">
                <CardContent className="pt-10 pb-8 px-8 space-y-5">
                  <div className="inline-flex rounded-full bg-accent/10 p-5 group-hover:bg-accent/20 transition-colors">
                    <Zap className="h-10 w-10 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold">Instant Verification</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Sign in with your Zora profile. We verify ownership on-chain to prevent impersonation.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-strong border-primary/20 hover:border-primary/50 transition-all group hover:scale-105 hover:shadow-glow-primary">
                <CardContent className="pt-10 pb-8 px-8 space-y-5">
                  <div className="inline-flex rounded-full bg-primary/10 p-5 group-hover:bg-primary/20 transition-colors">
                    <Users className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Own Your Community</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    No platform fees. No middlemen. Your coins, your rules, your community on Base.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-4 py-28">
          <div className="mx-auto max-w-6xl space-y-16">
            <div className="text-center space-y-5">
              <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                How It Works
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Three simple steps to start sharing exclusive content
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center space-y-5 group">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 text-primary font-bold text-3xl border-2 border-primary group-hover:scale-110 transition-transform shadow-lg">
                  1
                </div>
                <h3 className="text-2xl font-bold">Sign In with Zora</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Connect your Base wallet and verify your Zora profile. We check that you own the profile.
                </p>
              </div>

              <div className="text-center space-y-5 group">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 text-accent font-bold text-3xl border-2 border-accent group-hover:scale-110 transition-transform shadow-lg">
                  2
                </div>
                <h3 className="text-2xl font-bold">Create Your Drop</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Upload content and set how many of your coins fans need to hold. We fetch real-time prices.
                </p>
              </div>

              <div className="text-center space-y-5 group">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 text-primary font-bold text-3xl border-2 border-primary group-hover:scale-110 transition-transform shadow-lg">
                  3
                </div>
                <h3 className="text-2xl font-bold">Share & Earn</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Share your drop link. Only holders can access. Track views and grow your community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-28">
          <div className="mx-auto max-w-5xl">
            <Card className="glass-strong border-primary/30 overflow-hidden hover:border-primary/50 transition-all">
              <div className="relative p-16 md:p-20 text-center space-y-8">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
                <div className="relative z-10">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    Ready to Take Control of Your Community?
                  </h2>
                  <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                    Join creators who are building ownership-based communities on Base.
                  </p>
                  {authenticated && userProfile ? (
                    <Link href={userProfile.is_creator ? "/dashboard" : "/explore"}>
                      <Button className="rounded-full bg-gradient-to-r from-primary to-accent px-14 py-8 text-xl font-bold shadow-glow-primary hover:scale-105 transition-all hover:shadow-2xl">
                        {userProfile.is_creator ? "Go to Dashboard" : "Explore Drops"}
                        <ArrowRight className="ml-2 h-7 w-7" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth">
                      <Button className="rounded-full bg-gradient-to-r from-primary to-accent px-14 py-8 text-xl font-bold shadow-glow-primary hover:scale-105 transition-all hover:shadow-2xl">
                        Get Started Free
                        <ArrowRight className="ml-2 h-7 w-7" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-150%) translateY(-150%) rotate(45deg);
          }
          100% {
            transform: translateX(150%) translateY(150%) rotate(45deg);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
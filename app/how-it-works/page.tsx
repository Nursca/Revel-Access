import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Lock, Users, Zap, Sparkles, Shield, Coins, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HowItWorksPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 px-4 py-24 max-w-full">
        <div className="mx-auto max-w-6xl space-y-16">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">How It Works</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Token-Gated Access Made Simple
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Revel Access connects creators and fans through on-chain ownership. Here's how it works.
            </p>
          </div>

          {/* For Creators */}
          <section className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center">For Creators</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="glass-strong border-primary/20">
                <CardContent className="pt-8 space-y-4">
                  <div className="inline-flex rounded-full bg-primary/10 p-4">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">1. Sign In with Zora</h3>
                  <p className="text-muted-foreground">
                    Connect your Base wallet and verify your Zora profile. We check that you own your creator coin to prevent impersonation.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-strong border-accent/20">
                <CardContent className="pt-8 space-y-4">
                  <div className="inline-flex rounded-full bg-accent/10 p-4">
                    <Sparkles className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold">2. Create Drops</h3>
                  <p className="text-muted-foreground">
                    Upload exclusive content (images, text, more coming). Set how many of your coins fans need to hold. We fetch real-time prices.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-strong border-primary/20">
                <CardContent className="pt-8 space-y-4">
                  <div className="inline-flex rounded-full bg-primary/10 p-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">3. Share & Grow</h3>
                  <p className="text-muted-foreground">
                    Share your drop links anywhere. Only coin holders can access. Track views, unlocks, and grow your community.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* For Fans */}
          <section className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center">For Fans</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="glass-strong border-accent/20">
                <CardContent className="pt-8 space-y-4">
                  <div className="inline-flex rounded-full bg-accent/10 p-4">
                    <Zap className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold">1. Connect Wallet</h3>
                  <p className="text-muted-foreground">
                    Sign in with Base (no complicated setup). Optionally verify your Zora profile to show your support.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-strong border-primary/20">
                <CardContent className="pt-8 space-y-4">
                  <div className="inline-flex rounded-full bg-primary/10 p-4">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">2. Explore Drops</h3>
                  <p className="text-muted-foreground">
                    Browse exclusive drops from your favorite creators. See which ones you can unlock based on your coin holdings.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-strong border-accent/20">
                <CardContent className="pt-8 space-y-4">
                  <div className="inline-flex rounded-full bg-accent/10 p-4">
                    <Coins className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold">3. Unlock Content</h3>
                  <p className="text-muted-foreground">
                    Hold the required amount of a creator's coin to unlock their drops. Buy coins directly on Zora if needed.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Key Features */}
          <section className="glass-strong rounded-3xl p-12 border-2 border-primary/20">
            <h2 className="text-3xl font-bold text-center mb-12">Why Revel Access?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">No Impersonation</h3>
                  <p className="text-muted-foreground">
                    We verify wallet ownership against Zora profiles. Only real creators can create drops.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Real-Time Token Gates</h3>
                  <p className="text-muted-foreground">
                    Set requirements in tokens or USD. Prices update automatically from Zora's live market data.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Own Your Community</h3>
                  <p className="text-muted-foreground">
                    No platform fees. No middlemen. Your coins, your rules, your audience on Base.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">On-Chain Verification</h3>
                  <p className="text-muted-foreground">
                    All access checks happen on-chain via Zora SDK. Fully transparent and trustless.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Started?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button className="rounded-full bg-gradient-to-r from-primary to-accent px-12 py-7 text-xl font-bold shadow-glow-primary">
                  Sign In Now
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="outline" className="rounded-full glass border-primary/30 px-12 py-7 text-xl font-semibold">
                  Explore Drops
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
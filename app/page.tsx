import type React from "react"
import { AuroraBackground } from "@/components/aurora-background"
import { GenesisOrb } from "@/components/genesis-orb"
import { Navigation } from "@/components/navigation"
import { ArrowRight, Sparkles, Lock, Users, Check } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

function getCurrentYear() {
  return new Date().getFullYear();
}

export default function HomePage() {
  const currentYear = getCurrentYear();

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navigation />

      {/* Hero Section */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-16 md:pt-20">
        <div className="mx-auto max-w-5xl text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src="revel-logo.png"
              alt="Revel"
              width={120}
              height={120}
              className="animate-pulse drop-shadow-glow-primary"
            />
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-balance text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Onchain Experiences
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              For Your Community
            </span>
          </h1>
          <center>
            <p className="mb-12 max-w-3xl text-pretty text-lg text-foreground md:text-xl">
              Create token-gated content, exclusive drops, and unforgettable moments
              <br className="hidden md:block" />
              for your most dedicated fans. Built on Base.
            </p>
          </center>

          {/* CTA Buttons */}
          <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <GenesisOrb />
            <Link
              href="/explore"
              className="glass group flex items-center gap-3 rounded-full px-8 py-4 font-semibold text-foreground transition-all hover:bg-primary/5 hover:border-primary hover:shadow-glow-primary"
            >
              Explore Drops
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Trust Badge */}
          <div className="mb-12 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Powered by Zora Creator Coins on Base
          </div>

          {/* Feature Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<Sparkles className="h-6 w-6 text-primary" />}
              title="Exclusive Drops"
              description="Share premium content with token holders"
            />
            <FeatureCard
              icon={<Lock className="h-6 w-6 text-accent" />}
              title="Token-Gated"
              description="Powered by Zora Creator Coins on Base"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-primary" />}
              title="Build Community"
              description="Reward your most engaged supporters"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center text-4xl font-bold md:text-5xl text-foreground">
            How It Works
          </h2>

          <div className="grid gap-12 md:grid-cols-2">
            {/* For Creators */}
            <div className="glass-strong rounded-3xl p-8 shadow-lg backdrop-blur-xl transition-all hover:shadow-glow-primary">
              <div className="mb-6 inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                For Creators
              </div>
              <h3 className="mb-4 text-2xl font-bold text-foreground">Share Your Best Work</h3>
              <ol className="space-y-4">
                <li className="flex gap-3 text-foreground">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary animate-fade-in">
                    <Check className="h-4 w-4" />
                  </span>
                  <span>Connect your wallet and set up your creator profile</span>
                </li>
                <li className="flex gap-3 text-foreground">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary animate-fade-in [animation-delay:0.1s]">
                    <Check className="h-4 w-4" />
                  </span>
                  <span>Create a drop with exclusive content (video, audio, images)</span>
                </li>
                <li className="flex gap-3 text-foreground">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary animate-fade-in [animation-delay:0.2s]">
                    <Check className="h-4 w-4" />
                  </span>
                  <span>Set token requirements using your Zora Creator Coin</span>
                </li>
                <li className="flex gap-3 text-foreground">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary animate-fade-in [animation-delay:0.3s]">
                    <Check className="h-4 w-4" />
                  </span>
                  <span>Share with your community and watch engagement grow</span>
                </li>
              </ol>
            </div>

            {/* For Fans */}
            <div className="glass-strong rounded-3xl p-8 shadow-lg backdrop-blur-xl transition-all hover:shadow-glow-accent">
              <div className="mb-6 inline-flex rounded-full bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
                For Fans
              </div>
              <h3 className="mb-4 text-2xl font-bold text-foreground">Unlock Exclusive Access</h3>
              <ol className="space-y-4">
                <li className="flex gap-3 text-foreground">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent animate-fade-in">
                    <Check className="h-4 w-4" />
                  </span>
                  <span>Connect your wallet to discover creators</span>
                </li>
                <li className="flex gap-3 text-foreground">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent animate-fade-in [animation-delay:0.1s]">
                    <Check className="h-4 w-4" />
                  </span>
                  <span>Browse exclusive drops from your favorite creators</span>
                </li>
                <li className="flex gap-3 text-foreground">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent animate-fade-in [animation-delay:0.2s]">
                    <Check className="h-4 w-4" />
                  </span>
                  <span>Hold the required Creator Coins to unlock content</span>
                </li>
                <li className="flex gap-3 text-foreground">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent animate-fade-in [animation-delay:0.3s]">
                    <Check className="h-4 w-4" />
                  </span>
                  <span>Enjoy premium experiences and support creators directly</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 px-4 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl text-center">
          <p className="font-sans font-bold text-base text-muted-foreground">
            Built on Base • Powered by Zora Creator Coins
          </p>
          <p className="mt-2 font-sans font-bold text-base text-muted-foreground">
            © {currentYear} Revel. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="glass rounded-2xl p-6 text-center transition-all hover:border-primary/50 hover:shadow-glow-primary animate-fade-in">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-foreground/80">{description}</p>
    </div>
  )
}
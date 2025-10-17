"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import dynamic from "next/dynamic"

const ConnectWallet = dynamic(
  () => import("@/components/connect-wallet").then((mod) => mod.ConnectWallet),
  { ssr: false }
)

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 px-4 py-4">
      <div className="glass-strong mx-auto flex max-w-7xl items-center justify-between rounded-full px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/upscalemedia-transformed-revel-logo.png-DLGfQxkr09GVff1o1oEVIYVf02gOmf.jpeg"
            alt="Revel"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-xl font-bold">Revel</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/explore"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          >
            Explore
          </Link>
          <Link
            href="/creators"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          >
            Creators
          </Link>
          <Link
            href="/how-it-works"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          >
            How It Works
          </Link>
        </div>

        {/* Connect Wallet */}
        <div className="hidden md:block">
          <ConnectWallet />
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="glass-strong mt-4 rounded-3xl p-6 md:hidden">
          <div className="flex flex-col gap-4">
            <Link
              href="/explore"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Explore
            </Link>
            <Link
              href="/creators"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Creators
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <div className="pt-4">
              <ConnectWallet />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
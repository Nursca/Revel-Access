"use client"

import { useState } from "react"
import Link from "next/link"
import { Sparkles } from "lucide-react"

export function GenesisOrb() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      href="/onboarding"
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      {isHovered && (
        <div className="absolute -inset-2 animate-pulse rounded-full bg-gradient-to-r from-primary to-accent opacity-50 blur-xl" />
      )}

      {/* Button */}
      <button className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-8 py-4 font-bold text-background shadow-lg transition-transform hover:scale-105 cursor-pointer">
        <Sparkles className="h-5 w-5" />
        Start Creating
      </button>
    </Link>
  )
}

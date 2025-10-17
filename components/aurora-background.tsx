"use client"

export function AuroraBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-[#0D1420]" />

      {/* Aurora blobs */}
      <div
        className="aurora-blob absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/20"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="aurora-blob absolute right-1/4 top-1/3 h-80 w-80 rounded-full bg-accent/15"
        style={{ animationDelay: "7s" }}
      />
      <div
        className="aurora-blob absolute bottom-1/4 left-1/3 h-72 w-72 rounded-full bg-primary/15"
        style={{ animationDelay: "14s" }}
      />

      {/* Noise overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}

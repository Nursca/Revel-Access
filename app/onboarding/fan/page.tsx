"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, Loader2 } from "lucide-react"
import { createOrUpdateUser } from "@/lib/db/users"

export default function FanOnboardingPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    profileImage: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || !address) {
      alert("Please connect your wallet")
      return
    }

    setIsLoading(true)

    const fanProfile = {
      walletAddress: address,
      role: "fan" as const,
      ...formData,
      createdAt: new Date().toISOString(),
    }

    const result = await createOrUpdateUser(fanProfile)

    if (!result.success) {
      alert(`Error creating profile: ${result.error}`)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    router.push("/explore")
  }

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 px-4 py-24">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold">Set Up Your Fan Profile</h1>
            <p className="text-muted-foreground">Customize your profile to connect with creators</p>
          </div>

          <form onSubmit={handleSubmit} className="glass-strong space-y-6 rounded-3xl p-8">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                placeholder="Your name"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
                className="glass border-border bg-surface"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell creators about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="glass border-border bg-surface"
              />
            </div>

            {/* Profile Image */}
            <div className="space-y-2">
              <Label htmlFor="profileImage">Profile Image URL (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="profileImage"
                  placeholder="https://..."
                  value={formData.profileImage}
                  onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                  className="glass border-border bg-surface"
                />
                <Button type="button" variant="outline" size="icon" className="glass shrink-0 bg-transparent">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-subtle">Recommended: 400x400px, JPG or PNG</p>
            </div>

            {/* Info Box */}
            <div className="glass rounded-2xl border-accent/20 p-4">
              <h3 className="mb-2 font-semibold text-accent">What's Next?</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Discover exclusive drops from creators</li>
                <li>• Hold Creator Coins to unlock premium content</li>
                <li>• Support your favorite creators directly</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-gradient-to-r from-primary to-accent py-6 text-lg font-bold text-background"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                "Start Exploring"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

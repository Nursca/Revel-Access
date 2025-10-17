"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { getCurrentUser, isCreator } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createDrop } from "@/lib/db/drops"

export default function CreateDropPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [user, setUser] = useState(getCurrentUser())
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contentType: "video" as "video" | "audio" | "image" | "text",
    contentUrl: "",
    thumbnailUrl: "",
    tokenRequirement: "",
    status: "draft" as "draft" | "active" | "archived",
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser || !isCreator(currentUser)) {
      router.push("/onboarding")
      return
    }
    setUser(currentUser)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || !user || !address) {
      alert("Please connect your wallet")
      return
    }

    setIsLoading(true)

    const result = await createDrop({
      creatorAddress: address,
      creatorName: user.displayName,
      creatorImage: user.profileImage,
      title: formData.title,
      description: formData.description,
      contentType: formData.contentType,
      contentUrl: formData.contentUrl,
      thumbnailUrl: formData.thumbnailUrl,
      tokenRequirement: formData.tokenRequirement,
      tokenAddress: user.zoraCreatorCoinAddress || "",
      status: formData.status,
    })

    if (!result.success) {
      alert(`Error creating drop: ${result.error}`)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    router.push("/dashboard")
  }

  if (!user || !isConnected) {
    return null
  }

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 px-4 py-24">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="mb-2 text-4xl font-bold">Create New Drop</h1>
            <p className="text-muted-foreground">Share exclusive content with your token holders</p>
          </div>

          <form onSubmit={handleSubmit} className="glass-strong space-y-6 rounded-3xl p-8">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Drop Title *</Label>
              <Input
                id="title"
                placeholder="Give your drop a catchy title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="glass border-border bg-surface"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what fans will get access to..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                className="glass border-border bg-surface"
              />
            </div>

            {/* Content Type */}
            <div className="space-y-2">
              <Label htmlFor="contentType">Content Type *</Label>
              <Select
                value={formData.contentType}
                onValueChange={(value: any) => setFormData({ ...formData, contentType: value })}
              >
                <SelectTrigger className="glass border-border bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content URL */}
            <div className="space-y-2">
              <Label htmlFor="contentUrl">Content URL *</Label>
              <div className="flex gap-2">
                <Input
                  id="contentUrl"
                  placeholder="https://... or IPFS hash"
                  value={formData.contentUrl}
                  onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                  required
                  className="glass border-border bg-surface"
                />
                <Button type="button" variant="outline" size="icon" className="glass shrink-0 bg-transparent">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-subtle">Upload your content to IPFS or provide a secure URL</p>
            </div>

            {/* Thumbnail URL */}
            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <div className="flex gap-2">
                <Input
                  id="thumbnailUrl"
                  placeholder="https://..."
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  className="glass border-border bg-surface"
                />
                <Button type="button" variant="outline" size="icon" className="glass shrink-0 bg-transparent">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-subtle">Recommended: 1200x630px, JPG or PNG</p>
            </div>

            {/* Token Requirement */}
            <div className="space-y-2">
              <Label htmlFor="tokenRequirement">Minimum Token Balance *</Label>
              <Input
                id="tokenRequirement"
                type="number"
                placeholder="1"
                value={formData.tokenRequirement}
                onChange={(e) => setFormData({ ...formData, tokenRequirement: e.target.value })}
                required
                className="glass border-border bg-surface"
              />
              <p className="text-xs text-subtle">
                Minimum number of {user.displayName} Creator Coins required to unlock this drop
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="glass border-border bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft (Not visible to fans)</SelectItem>
                  <SelectItem value="active">Active (Visible and unlockable)</SelectItem>
                  <SelectItem value="archived">Archived (Visible but not unlockable)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Info Box */}
            <div className="glass rounded-2xl border-primary/20 p-4">
              <h3 className="mb-2 font-semibold text-primary">Token Gating Info</h3>
              <p className="text-sm text-muted-foreground">
                This drop will be gated by your Zora Creator Coin: <br />
                <code className="mt-1 inline-block rounded bg-surface px-2 py-1 text-xs">
                  {user.zoraCreatorCoinAddress || "Not set"}
                </code>
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-full bg-gradient-to-r from-primary to-accent py-6 text-lg font-bold text-background"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Drop...
                  </>
                ) : (
                  "Create Drop"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

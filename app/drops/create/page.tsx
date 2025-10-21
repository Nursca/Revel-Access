"use client"

import { useState, useEffect, useRef } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { fetchCreatorCoin, formatCurrency } from "@/lib/zora/profile"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload, X, Sparkles, DollarSign, Coins } from "lucide-react"
import { toast } from "sonner"

export default function CreateDropPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [coinStats, setCoinStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [gateType, setGateType] = useState<"tokens" | "usd">("tokens")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content_type: "image" as "image" | "text",
    content_url: "",
    content_text: "",
    thumbnail_url: "",
    required_amount: "",
  })
  const [preview, setPreview] = useState({ image: "", thumbnail: "" })
  const imageInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!isConnected || !address) {
      router.push("/auth")
      return
    }
    loadUserData()
  }, [isConnected, address, router])

  const loadUserData = async () => {
    if (!address || !supabase) return

    try {
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", address.toLowerCase())
        .single()

      if (error || !userData || !userData.is_creator) {
        toast.error("Only creators can create drops")
        router.push("/explore")
        return
      }

      setUser(userData)

      if (userData.zora_handle) {
        const coin = await fetchCreatorCoin(userData.zora_handle)
        setCoinStats(coin)
      }
    } catch (error) {
      console.error("Error loading user:", error)
      toast.error("Failed to load profile")
      router.push("/dashboard")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "thumbnail") => {
    const file = e.target.files?.[0]
    if (!file || !supabase) {
      toast.error("No file selected")
      return
    }

    setUploadLoading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        if (type === "image") {
          setPreview((prev) => ({ ...prev, image: result }))
        } else {
          setPreview((prev) => ({ ...prev, thumbnail: result }))
        }
      }
      reader.readAsDataURL(file)

      // Upload to Supabase
      const fileExt = file.name.split(".").pop()
      const fileName = `${address}-${Date.now()}.${fileExt}`
      const filePath = `drops/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("drop-media")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("drop-media").getPublicUrl(filePath)

      if (type === "image") {
        setFormData((prev) => ({ ...prev, content_url: publicUrl }))
        if (!formData.thumbnail_url) {
          setFormData((prev) => ({ ...prev, thumbnail_url: publicUrl }))
        }
      } else {
        setFormData((prev) => ({ ...prev, thumbnail_url: publicUrl }))
      }

      toast.success(`${type === "image" ? "Content" : "Thumbnail"} uploaded!`)
    } catch (error: unknown) {
      console.error("Upload error:", error)
      const message = error instanceof Error ? error.message : String(error)
      toast.error(`Upload failed: ${message}`)
    } finally {
      setUploadLoading(false)
      e.target.value = ""
    }
  }

  const calculateRequiredTokens = (): number => {
    if (!formData.required_amount || !coinStats) return 0

    if (gateType === "usd") {
      const usdAmount = parseFloat(formData.required_amount)
      return usdAmount / coinStats.pricePerToken
    }

    return parseFloat(formData.required_amount)
  }

  const calculateUsdValue = (): number => {
    if (!formData.required_amount || !coinStats) return 0

    if (gateType === "tokens") {
      const tokens = parseFloat(formData.required_amount)
      return tokens * coinStats.pricePerToken
    }

    return parseFloat(formData.required_amount)
  }

  const handleSubmit = async () => {
    if (!address || !supabase || !user) {
      toast.error("Authentication required")
      return
    }

    if (!formData.title.trim()) {
      toast.error("Title is required")
      return
    }

    if (formData.content_type === "image" && !formData.content_url) {
      toast.error("Please upload an image")
      return
    }

    if (formData.content_type === "text" && !formData.content_text.trim()) {
      toast.error("Text content is required")
      return
    }

    if (!formData.required_amount || parseFloat(formData.required_amount) <= 0) {
      toast.error("Token gate amount is required")
      return
    }

    setIsLoading(true)

    try {
      const requiredTokens = calculateRequiredTokens()
      const usdValue = calculateUsdValue()

      const dropData = {
        creator_wallet_address: address.toLowerCase(),
        creator_coin_address: user.zora_creator_coin_address,
        title: formData.title,
        description: formData.description || null,
        content_type: formData.content_type,
        content_url: formData.content_url || null,
        content_text: formData.content_text || null,
        thumbnail_url: formData.thumbnail_url || null,
        required_coin_balance: requiredTokens,
        required_coin_balance_usd: usdValue,
        coin_price_at_creation: coinStats?.pricePerToken || 0,
        is_active: true,
      }

      const { data, error } = await supabase.from("drops").insert(dropData).select()

      if (error) {
        console.error("Error creating drop:", error)
        toast.error(`Failed to create drop: ${error.message}`)
        return
      }

      if (data && data.length > 0) {
        toast.success("Drop created successfully! 🎉")
        router.push(`/drops/${data[0].id}`)
      }
    } catch (error) {
      console.error("Network error:", error)
      toast.error("Failed to create drop")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || !coinStats) {
    return (
      <div className="relative min-h-screen overflow-x-hidden">
        <AuroraBackground />
        <Navigation />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 px-4 py-24 max-w-full">
        <div className="mx-auto max-w-4xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Create Exclusive Drop
            </h1>
            <p className="text-muted-foreground">
              Share premium content with your coin holders
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="md:col-span-2 space-y-6">
              <Card className="glass-strong border-primary/20">
                <CardHeader>
                  <CardTitle>Drop Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Title <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Give your drop a catchy title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="glass border-primary/30 focus:border-primary h-12"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what makes this content special..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="glass border-primary/30 focus:border-primary resize-none"
                    />
                  </div>

                  {/* Content Type */}
                  <div className="space-y-2">
                    <Label>Content Type <span className="text-primary">*</span></Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData({ ...formData, content_type: "image" })}
                        className={`glass h-12 ${
                          formData.content_type === "image"
                            ? "border-primary bg-primary/10"
                            : "border-primary/30"
                        }`}
                      >
                        Image
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData({ ...formData, content_type: "text" })}
                        className={`glass h-12 ${
                          formData.content_type === "text"
                            ? "border-primary bg-primary/10"
                            : "border-primary/30"
                        }`}
                      >
                        Text
                      </Button>
                    </div>
                  </div>

                  {/* Image Upload */}
                  {formData.content_type === "image" && (
                    <div className="space-y-2">
                      <Label>Content Image <span className="text-primary">*</span></Label>
                      {preview.image ? (
                        <div className="relative">
                          <img
                            src={preview.image}
                            alt="Preview"
                            className="w-full rounded-lg border-2 border-primary"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-destructive text-destructive-foreground"
                            onClick={() => {
                              setPreview((prev) => ({ ...prev, image: "" }))
                              setFormData({ ...formData, content_url: "" })
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          onClick={() => imageInputRef.current?.click()}
                          className="border-2 border-dashed border-primary/40 rounded-lg p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                        >
                          <Upload className="h-12 w-12 text-primary/60 mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload image
                          </p>
                        </div>
                      )}
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "image")}
                        className="hidden"
                      />
                    </div>
                  )}

                  {/* Text Content */}
                  {formData.content_type === "text" && (
                    <div className="space-y-2">
                      <Label htmlFor="content_text">
                        Text Content <span className="text-primary">*</span>
                      </Label>
                      <Textarea
                        id="content_text"
                        placeholder="Enter your exclusive text content here..."
                        value={formData.content_text}
                        onChange={(e) => setFormData({ ...formData, content_text: e.target.value })}
                        rows={8}
                        className="glass border-primary/30 focus:border-primary resize-none font-mono"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Token Gate */}
              <Card className="glass-strong border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    Token Gate
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Gate Type Toggle */}
                  <div className="space-y-2">
                    <Label>Set Requirement By</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setGateType("tokens")}
                        className={`glass h-12 ${
                          gateType === "tokens"
                            ? "border-accent bg-accent/10"
                            : "border-accent/30"
                        }`}
                      >
                        <Coins className="mr-2 h-4 w-4" />
                        Tokens
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setGateType("usd")}
                        className={`glass h-12 ${
                          gateType === "usd" ? "border-accent bg-accent/10" : "border-accent/30"
                        }`}
                      >
                        <DollarSign className="mr-2 h-4 w-4" />
                        USD Value
                      </Button>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <Label htmlFor="required_amount">
                      {gateType === "tokens" ? "Minimum Tokens" : "Minimum USD Value"}
                      <span className="text-accent ml-1">*</span>
                    </Label>
                    <Input
                      id="required_amount"
                      type="number"
                      step="0.01"
                      placeholder={gateType === "tokens" ? "e.g. 100" : "e.g. 10.00"}
                      value={formData.required_amount}
                      onChange={(e) => setFormData({ ...formData, required_amount: e.target.value })}
                      className="glass border-accent/30 focus:border-accent h-12 text-lg"
                    />
                  </div>

                  {/* Conversion Display */}
                  {formData.required_amount && coinStats && (
                    <div className="glass rounded-lg p-4 border border-accent/20 space-y-2">
                      <p className="text-sm text-muted-foreground">This equals:</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Tokens Required</span>
                        <span className="font-bold text-accent">
                          {calculateRequiredTokens().toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">USD Value</span>
                        <span className="font-bold text-primary">
                          {formatCurrency(calculateUsdValue())}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-accent/20">
                        <span className="text-xs text-muted-foreground">Current Price/Token</span>
                        <span className="text-xs font-semibold">
                          {formatCurrency(coinStats.pricePerToken)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Coin Stats */}
              <Card className="glass-strong border-primary/20">
                <CardHeader>
                  <CardTitle className="text-base">Your Coin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Symbol</p>
                    <p className="font-bold text-primary">{coinStats.symbol}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Holders</p>
                    <p className="font-semibold">{coinStats.uniqueHolders}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Market Cap</p>
                    <p className="font-semibold">
                      {formatCurrency(parseFloat(coinStats.marketCap))}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Publish Button */}
              <Button
                onClick={handleSubmit}
                disabled={isLoading || uploadLoading}
                className="w-full rounded-full bg-gradient-to-r from-primary to-accent py-6 text-lg font-bold shadow-glow-primary"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Publish Drop
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
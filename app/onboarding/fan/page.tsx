"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, Loader2, X, Sparkles, Heart, Zap, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"

interface User {
  id: string
  wallet_address: string
  role: 'creator' | 'fan'
  display_name: string
  bio?: string | null
  profile_image?: string | null
  cover_image?: string | null
  zora_creator_coin_address?: string | null
  social_links: Record<string, string>
  created_at: string
  updated_at: string
}

export default function FanOnboardingPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    profile_image: "",
  })
  const [preview, setPreview] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  const supabase = getSupabaseBrowserClient()
  const profileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isComplete) {
      router.replace("/explore")
    }
  }, [isComplete, router])

  useEffect(() => {
    if (isConnected && address && supabase) {
      const fetchProfile = async () => {
        try {
          const { data: existingUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', address)
            .single()

          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error)
            return
          }

          if (existingUser) {
            setFormData({
              display_name: existingUser.display_name,
              bio: existingUser.bio || "",
              profile_image: existingUser.profile_image || "",
            })
            if (existingUser.profile_image) setPreview(existingUser.profile_image)
          }
        } catch (error) {
          console.error('Network error fetching profile:', error)
        }
      }
      fetchProfile()
    }
  }, [isConnected, address, supabase, router])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !supabase) {
      toast.error('No file selected or Supabase not ready')
      return
    }

    setUploadLoading(true)

    try {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(file)

      const fileExt = file.name.split('.').pop()
      const fileName = `${address}-${Date.now()}.${fileExt}`
      const filePath = `profiles/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, profile_image: publicUrl }))
      toast.success('Profile image uploaded!')
    } catch (error: unknown) {
      console.error('Upload error:', error)
      const message = error instanceof Error ? error.message : String(error)
      toast.error(`Upload failed: ${message}`)
    } finally {
      setUploadLoading(false)
      e.target.value = ''
    }
  }

  const handleRemovePreview = () => {
    setPreview('')
    setFormData(prev => ({ ...prev, profile_image: '' }))
    toast.success('Image removed')
  }

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet')
      return
    }

    if (!formData.display_name.trim()) {
      toast.error('Display name is required')
      return
    }

    const supabase = getSupabaseBrowserClient()

    if (!supabase) {
      toast.error('Database connection failed')
      return
    }

    setIsLoading(true)

    const userData: Omit<User, 'id' | 'created_at' | 'updated_at'> = {
      wallet_address: address,
      role: 'fan',
      display_name: formData.display_name,
      bio: formData.bio || null,
      profile_image: formData.profile_image || null,
      cover_image: null,
      zora_creator_coin_address: null,
      social_links: {},
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(userData, { onConflict: 'wallet_address' })
        .select()

      if (error) {
        console.error('❌ Supabase upsert error:', error)
        toast.error(`Save failed: ${error.message}`)
        return
      }

      if (data && data.length > 0) {
        toast.success('Fan profile created! Welcome to Revel 🎉')
        setIsComplete(true)
      } else {
        toast.error('No data returned—check RLS policies')
      }
    } catch (fetchError) {
      console.error('❌ Network error:', fetchError)
      toast.error('Network issue—check browser console')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 px-4 py-24 max-w-full">
        <div className="mx-auto max-w-3xl w-full">
          {/* Header with Purple Glow */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full glass border border-primary/30 shadow-glow-primary">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">Fan Profile Setup</span>
            </div>
            <h1 className="mb-4 text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in">
              Join the Revel Community
            </h1>
            <p className="text-base md:text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Discover exclusive content and support your favorite creators
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Feature Cards */}
            <Card className="glass-strong border-primary/20 hover:border-primary/40 transition-all group">
              <CardContent className="pt-6">
                <div className="inline-flex rounded-full bg-primary/10 p-3 mb-3 group-hover:bg-primary/20 transition-colors">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1 text-foreground">Support Creators</h3>
                <p className="text-sm text-muted-foreground">Directly support the creators you love</p>
              </CardContent>
            </Card>

            <Card className="glass-strong border-accent/20 hover:border-accent/40 transition-all group">
              <CardContent className="pt-6">
                <div className="inline-flex rounded-full bg-accent/10 p-3 mb-3 group-hover:bg-accent/20 transition-colors">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-1 text-foreground">Unlock Drops</h3>
                <p className="text-sm text-muted-foreground">Access exclusive token-gated content</p>
              </CardContent>
            </Card>

            <Card className="glass-strong border-primary/20 hover:border-primary/40 transition-all group">
              <CardContent className="pt-6">
                <div className="inline-flex rounded-full bg-primary/10 p-3 mb-3 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1 text-foreground">Grow with Them</h3>
                <p className="text-sm text-muted-foreground">Be part of their journey from day one</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="glass-strong space-y-6 rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-primary/20 shadow-glow-primary">
            {/* Profile Image - Prominent Purple Section */}
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                {preview ? (
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-glow-primary">
                      <img src={preview} alt="Profile Preview" className="w-full h-full object-cover" />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg"
                      onClick={handleRemovePreview}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-dashed border-primary/40 flex items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group"
                    onClick={() => profileInputRef.current?.click()}>
                    <Upload className="h-8 w-8 text-primary/60 group-hover:text-primary transition-colors" />
                  </div>
                )}
              </div>
              
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => profileInputRef.current?.click()}
                  disabled={uploadLoading}
                  className="glass border-primary/30 hover:border-primary hover:bg-primary/10 transition-all"
                >
                  {uploadLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {preview ? 'Change' : 'Upload'} Profile Picture
                    </>
                  )}
                </Button>
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-2">Recommended: 400x400px, JPG or PNG</p>
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-semibold flex items-center gap-2">
                <span className="text-primary">*</span>
                Display Name
              </Label>
              <Input
                id="displayName"
                placeholder="Enter your name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="glass border-primary/30 focus:border-primary bg-surface h-12 text-base"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-semibold">
                Bio <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell creators about yourself and your interests..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="glass border-primary/30 focus:border-primary bg-surface resize-none"
              />
            </div>

            {/* Purple Info Box */}
            <div className="glass-strong rounded-2xl border-2 border-accent/30 p-5 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-accent/20 p-2 mt-1">
                  <Sparkles className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    What happens next?
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 animate-pulse" />
                      <span>Browse exclusive drops from top creators</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 animate-pulse" />
                      <span>Hold Creator Coins to unlock premium content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 animate-pulse" />
                      <span>Connect directly with your favorite creators</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button with Enhanced Purple Gradient */}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !formData.display_name.trim()}
              className="w-full rounded-full bg-gradient-to-r from-primary via-accent to-primary py-6 text-lg font-bold text-background hover:shadow-glow-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group bg-[length:200%_100%] hover:bg-[position:100%_0]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Your Profile...
                </>
              ) : (
                <>
                  Start Exploring
                  <Sparkles className="ml-2 h-5 w-5 group-hover:animate-pulse" />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By continuing, you agree to Revel's Terms of Service
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
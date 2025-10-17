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
import { Upload, Loader2, X, User, Image, Link2, Zap } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

const STEPS = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Images", icon: Image },
  { id: 3, title: "Zora Coin", icon: Zap },
  { id: 4, title: "Socials", icon: Link2 },
]

export default function CreatorOnboardingPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState({ profile: false, cover: false })
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    profile_image: "",
    cover_image: "",
    zora_creator_coin_address: "",
    social_links: { twitter: "", instagram: "", website: "" },
  })
  const [preview, setPreview] = useState({ profile: "", cover: "" })
  const [isComplete, setIsComplete] = useState(false)
  const supabase = getSupabaseBrowserClient()

  const profileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isComplete) {
      // Set localStorage flag to prevent re-onboarding
      localStorage.setItem('revel_onboarding_complete', 'true')
      router.replace("/dashboard")
    }
  }, [isComplete, router])

  useEffect(() => {
    // Check localStorage to skip if complete
    if (localStorage.getItem('revel_onboarding_complete')) {
      router.replace("/dashboard")
      return
    }

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
            toast.error('Failed to load profile')
            return
          }

          if (existingUser) {
            setFormData({
              display_name: existingUser.display_name,
              bio: existingUser.bio || "",
              profile_image: existingUser.profile_image || "",
              cover_image: existingUser.cover_image || "",
              zora_creator_coin_address: existingUser.zora_creator_coin_address || "",
              social_links: existingUser.social_links || { twitter: "", instagram: "", website: "" },
            })
            if (existingUser.profile_image) setPreview(prev => ({ ...prev, profile: existingUser.profile_image }))
            if (existingUser.cover_image) setPreview(prev => ({ ...prev, cover: existingUser.cover_image }))
          }
        } catch (error) {
          console.error('Network error fetching profile:', error)
          toast.error('Network issue loading profile')
        }
      }
      fetchProfile()
    }
  }, [isConnected, address, supabase, router])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0]
    if (!file || !supabase) {
      toast.error('No file selected or Supabase not ready')
      return
    }

    setUploadLoading(prev => ({ ...prev, [type]: true }))

    try {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(prev => ({ ...prev, [type]: ev.target?.result as string }))
      reader.readAsDataURL(file)

      const bucket = type === 'profile' ? 'profile-images' : 'cover-images'
      const fileExt = file.name.split('.').pop()
      const fileName = `${address}-${Date.now()}.${fileExt}`
      const filePath = `${type}s/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, [`${type}_image`]: publicUrl }))
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} image uploaded!`)
    } catch (error: unknown) {
      console.error('Upload error:', error)
      const message = error instanceof Error ? error.message : String(error)
      toast.error(`Upload failed: ${message || 'Check bucket permissions'}`)
    } finally {
      setUploadLoading(prev => ({ ...prev, [type]: false }))
      e.target.value = ''
    }
  }

  const triggerFileInput = (type: 'profile' | 'cover') => {
    if (type === 'profile') {
      profileInputRef.current?.click()
    } else {
      coverInputRef.current?.click()
    }
  }

  const handleRemovePreview = (type: 'profile' | 'cover') => {
    setPreview(prev => ({ ...prev, [type]: '' }))
    setFormData(prev => ({ ...prev, [`${type}_image`]: '' }))
    toast.success('Image removed')
  }

  const handleNextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || !address || !supabase || !formData.display_name.trim()) {
      toast.error('Connect wallet and add display name')
      return
    }

    setIsLoading(true)

    const userData: Omit<User, 'id' | 'created_at' | 'updated_at'> = {
      wallet_address: address,
      role: 'creator',
      display_name: formData.display_name,
      bio: formData.bio || null,
      profile_image: formData.profile_image || null,
      cover_image: formData.cover_image || null,
      zora_creator_coin_address: formData.zora_creator_coin_address || null,
      social_links: formData.social_links,
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(userData, { onConflict: 'wallet_address' })
        .select()

      console.log('Upsert response:', { data, error })

      if (error) {
        console.error('Supabase upsert error:', error)
        toast.error(`Save failed: ${error.message || 'Unknown error'}`)
        return
      }

      if (data && data.length > 0) {
        console.log('Profile saved:', data[0])
        toast.success('Creator profile saved successfully!')
        setIsComplete(true) // Trigger useEffect for replace
      } else {
        toast.error('No data returned—check RLS policies')
      }
    } catch (fetchError) {
      console.error('Network error saving profile:', fetchError)
      toast.error('Network issue—check connection and Supabase keys')
    } finally {
      setIsLoading(false)
    }
  }

  const activeStep = STEPS[currentStep - 1]

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 px-4 py-24">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold">Set Up Your Creator Profile</h1>
            <p className="text-muted-foreground">Tell your fans about yourself and your content</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              {STEPS.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full ${step.id <= currentStep ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="mt-1 text-xs">{step.id}</span>
                </div>
              ))}
            </div>
            <div className="h-1 bg-muted rounded-full">
              <div className="h-1 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300" style={{ width: `${(currentStep / STEPS.length) * 100}%` }} />
            </div>
            <p className="text-center text-sm font-medium mt-2">{activeStep.title}</p>
          </div>

          <form onSubmit={handleSubmit} className="glass-strong space-y-6 rounded-3xl p-6 md:p-8">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <Card className="glass-strong border-0">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Personal Info</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name *</Label>
                    <Input
                      id="displayName"
                      placeholder="Your creator name"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      required
                      className="glass border-border bg-surface"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio *</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell your fans about yourself and what you create..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      required
                      rows={4}
                      className="glass border-border bg-surface resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Images */}
            {currentStep === 2 && (
              <Card className="glass-strong border-0">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Image className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Images</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Profile Image</Label>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'profile')}
                        className="glass border-border bg-surface file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-background hover:file:bg-primary-hover"
                      />
                      <Button type="button" variant="outline" size="icon" onClick={() => triggerFileInput('profile')} disabled={uploadLoading.profile} className="glass shrink-0 bg-transparent">
                        {uploadLoading.profile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      </Button>
                    </div>
                    <input
                      ref={profileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'profile')}
                      className="hidden"
                    />
                    {preview.profile && (
                      <div className="relative mt-2">
                        <img src={preview.profile} alt="Profile Preview" className="h-24 w-24 rounded-full object-cover border" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground"
                          onClick={() => handleRemovePreview('profile')}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Recommended: 400x400px, JPG or PNG</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Cover Image</Label>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'cover')}
                        className="glass border-border bg-surface file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-background hover:file:bg-primary-hover"
                      />
                      <Button type="button" variant="outline" size="icon" onClick={() => triggerFileInput('cover')} disabled={uploadLoading.cover} className="glass shrink-0 bg-transparent">
                        {uploadLoading.cover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      </Button>
                    </div>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'cover')}
                      className="hidden"
                    />
                    {preview.cover && (
                      <div className="relative mt-2">
                        <img src={preview.cover} alt="Cover Preview" className="h-24 w-full rounded object-cover border" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground"
                          onClick={() => handleRemovePreview('cover')}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Recommended: 1600x400px, JPG or PNG</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Zora Coin */}
            {currentStep === 3 && (
              <Card className="glass-strong border-0">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Zora Creator Coin</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="zoraCreatorCoin">Zora Creator Coin Address *</Label>
                    <Input
                      id="zoraCreatorCoin"
                      placeholder="0x..."
                      value={formData.zora_creator_coin_address}
                      onChange={(e) => setFormData({ ...formData, zora_creator_coin_address: e.target.value })}
                      required
                      className="glass border-border bg-surface"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your Zora Creator Coin contract address on Base. This will be used for token-gating.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Social Links */}
            {currentStep === 4 && (
              <Card className="glass-strong border-0">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Social Links</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Twitter/X username"
                      value={formData.social_links.twitter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, twitter: e.target.value },
                        })
                      }
                      className="glass border-border bg-surface"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Instagram username"
                      value={formData.social_links.instagram}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, instagram: e.target.value },
                        })
                      }
                      className="glass border-border bg-surface"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Website URL"
                      value={formData.social_links.website}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, website: e.target.value },
                        })
                      }
                      className="glass border-border bg-surface"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  className="rounded-full"
                >
                  Back
                </Button>
              )}
              <div className="flex-1" />
              {currentStep === STEPS.length ? (
                <Button type="submit" disabled={isLoading} className="rounded-full bg-gradient-to-r from-primary to-accent px-8">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Complete Setup
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="rounded-full bg-gradient-to-r from-primary to-accent px-8 cursor-pointer"
                >
                  Next Step
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
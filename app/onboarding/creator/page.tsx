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
import { Upload, Loader2, X, User, Image, Link2, Zap, ChevronLeft, ChevronRight } from "lucide-react"
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
      localStorage.setItem('revel_onboarding_complete', 'true')
      router.replace("/dashboard")
    }
  }, [isComplete, router])

  useEffect(() => {
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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.display_name.trim()) {
          toast.error('Display name is required')
          return false
        }
        if (!formData.bio.trim()) {
          toast.error('Bio is required')
          return false
        }
        return true
      case 3:
        if (!formData.zora_creator_coin_address.trim()) {
          toast.error('Zora Creator Coin address is required')
          return false
        }
        if (!formData.zora_creator_coin_address.startsWith('0x')) {
          toast.error('Invalid address format')
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleNextStep = () => {
    if (!validateStep(currentStep)) {
      return
    }
    
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
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
      toast.error('Database connection failed - check console for details')
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

    console.log('📤 Attempting upsert with data:', userData)

    try {
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      console.log('🔍 Test query result:', { testData, testError })

      if (testError) {
        console.error('❌ Test query failed:', testError)
        toast.error(`Database connection failed: ${testError.message}`)
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('users')
        .upsert(userData, { onConflict: 'wallet_address' })
        .select()

      console.log('📥 Upsert response:', { data, error })

      if (error) {
        console.error('❌ Supabase upsert error:', error)
        toast.error(`Save failed: ${error.message}`)
        return
      }

      if (data && data.length > 0) {
        console.log('✅ Profile saved:', data[0])
        toast.success('Creator profile saved successfully!')
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

  const activeStep = STEPS[currentStep - 1]

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 px-4 py-24 max-w-full">
        <div className="mx-auto max-w-2xl w-full">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl md:text-4xl font-bold">Set Up Your Creator Profile</h1>
            <p className="text-sm md:text-base text-muted-foreground">Tell your fans about yourself and your content</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {STEPS.map((step) => (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all ${
                    step.id < currentStep 
                      ? 'bg-primary text-background' 
                      : step.id === currentStep 
                      ? 'bg-primary text-background ring-2 ring-primary ring-offset-2 ring-offset-background' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <step.icon className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <span className="mt-2 text-xs md:text-sm font-medium hidden sm:block">{step.title}</span>
                </div>
              ))}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out" 
                style={{ width: `${(currentStep / STEPS.length) * 100}%` }} 
              />
            </div>
            <p className="text-center text-sm font-medium mt-3 text-primary">{activeStep.title}</p>
          </div>

          <div className="glass-strong space-y-6 rounded-2xl md:rounded-3xl p-4 md:p-8">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <Card className="glass-strong border-0">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base md:text-lg">Personal Info</CardTitle>
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
                    <CardTitle className="text-base md:text-lg">Images</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Profile Image</Label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => triggerFileInput('profile')} 
                        disabled={uploadLoading.profile} 
                        className="glass w-full sm:flex-1 justify-center bg-transparent"
                      >
                        {uploadLoading.profile ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Choose Profile Image
                          </>
                        )}
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
                      <div className="relative inline-block mt-3">
                        <img src={preview.profile} alt="Profile Preview" className="h-32 w-32 rounded-full object-cover border-2 border-border" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleRemovePreview('profile')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Recommended: 400x400px, JPG or PNG</p>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Cover Image</Label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => triggerFileInput('cover')} 
                        disabled={uploadLoading.cover} 
                        className="glass w-full sm:flex-1 justify-center bg-transparent"
                      >
                        {uploadLoading.cover ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Choose Cover Image
                          </>
                        )}
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
                      <div className="relative inline-block mt-3 w-full">
                        <img src={preview.cover} alt="Cover Preview" className="h-32 w-full rounded-lg object-cover border-2 border-border" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleRemovePreview('cover')}
                        >
                          <X className="h-4 w-4" />
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
                    <CardTitle className="text-base md:text-lg">Zora Creator Coin</CardTitle>
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
                    <CardTitle className="text-base md:text-lg">Social Links (Optional)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter/X</Label>
                    <Input
                      id="twitter"
                      placeholder="@username"
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
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="@username"
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
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      placeholder="https://yoursite.com"
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
            <div className="flex justify-between items-center pt-4 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="rounded-full px-4 md:px-6"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              
              {currentStep === STEPS.length ? (
                <Button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading} 
                  className="rounded-full bg-gradient-to-r from-primary to-accent px-6 md:px-8 flex-1 sm:flex-initial"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="rounded-full bg-gradient-to-r from-primary to-accent px-6 md:px-8 flex-1 sm:flex-initial"
                >
                  <span className="hidden sm:inline">Next Step</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
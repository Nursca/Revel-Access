"use client"

import { useState, useEffect } from "react"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useSignMessage } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { ConnectWallet } from "@/components/connect-wallet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, ExternalLink, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { getProfile } from "@zoralabs/coins-sdk"

interface ZoraProfile {
  id: string
  handle: string
  displayName?: string
  bio?: string
  avatar?: {
    medium?: string
  }
  creatorCoin?: {
    address: string
    marketCap?: string
  }
  publicWallet?: {
    walletAddress: string
  }
}

export function SignInWithZora() {
  const { ready, authenticated } = usePrivy()
  const { wallets } = useWallets()
  const { signMessage } = useSignMessage()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [zoraHandle, setZoraHandle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"input" | "verify" | "complete">("input")
  const [errorMessage, setErrorMessage] = useState("")
  const supabase = getSupabaseBrowserClient()

  const activeWallet = wallets[0]
  const address = activeWallet?.address
  const isConnected = authenticated && !!address

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignIn = async () => {
    if (!isConnected || !address || !activeWallet) {
      toast.error("Please connect your Base wallet first")
      return
    }

    if (!zoraHandle.trim()) {
      toast.error("Please enter your Zora username")
      return
    }

    setIsLoading(true)
    setStep("verify")
    setErrorMessage("")

    try {
      console.log("🔍 Fetching Zora profile for:", zoraHandle)

      // Fetch Zora profile with error handling
      let response
      try {
        response = await getProfile({ 
          identifier: zoraHandle.toLowerCase().trim() 
        })
      } catch (fetchError) {
        console.error("❌ Zora API fetch error:", fetchError)
        setErrorMessage("Failed to connect to Zora API. Please check your internet connection.")
        setIsLoading(false)
        setStep("input")
        toast.error("Connection to Zora failed. Try again.")
        return
      }

      console.log("📥 Zora API response:", response)

      const profile: ZoraProfile | undefined = response?.data?.profile as any

      if (!profile || !profile.handle) {
        console.error("❌ Profile not found or invalid")
        setErrorMessage(`Profile "${zoraHandle}" not found on Zora.`)
        setIsLoading(false)
        setStep("input")
        toast.error("Zora profile not found. Check your username.")
        return
      }

      console.log("✅ Profile found:", profile.handle)

      // Verify wallet ownership
      const profileWallet = profile.publicWallet?.walletAddress?.toLowerCase()
      const connectedWallet = address.toLowerCase()

      console.log("🔐 Verifying wallet:", { profileWallet, connectedWallet })

      if (!profileWallet) {
        setErrorMessage("This Zora profile has no public wallet address.")
        setIsLoading(false)
        setStep("input")
        toast.error("Zora profile has no wallet address")
        return
      }

      if (profileWallet !== connectedWallet) {
        setErrorMessage(
          `This Zora profile belongs to ${profileWallet.slice(0, 6)}...${profileWallet.slice(-4)}. Connect the correct wallet.`
        )
        setIsLoading(false)
        setStep("input")
        toast.error("Wallet mismatch!")
        return
      }

      console.log("✅ Wallet verified")

      // Sign message using Privy's useSignMessage hook
      const message = `Sign in to Revel Access\n\nZora Handle: ${profile.handle}\nWallet: ${address}\nTimestamp: ${Date.now()}`
      
      let signatureResult: string
      try {
        const uiOptions = {
          title: "Sign In to Revel",
          description: "Sign this message to verify your Zora profile",
          buttonText: "Sign Message"
        }
        
        const result = await signMessage(
          { message },
          { 
            uiOptions,
            address: activeWallet.address
          }
        )
        
        signatureResult = result.signature
        console.log("✅ Message signed")
      } catch (signError) {
        console.error("❌ Signature rejected:", signError)
        setErrorMessage("Signature rejected. Please approve in your wallet.")
        setIsLoading(false)
        setStep("input")
        toast.error("Signature rejected")
        return
      }

      // Determine creator status
      const isCreator = !!profile.creatorCoin?.address
      console.log("👤 User is creator:", isCreator)

      if (!supabase) {
        setErrorMessage("Database connection failed")
        setIsLoading(false)
        toast.error("Database error")
        return
      }

      // Save to Supabase
      const userData = {
        wallet_address: address.toLowerCase(),
        zora_handle: profile.handle,
        display_name: profile.displayName || profile.handle,
        bio: profile.bio || null,
        profile_image: profile.avatar?.medium || null,
        zora_creator_coin_address: profile.creatorCoin?.address || null,
        is_creator: isCreator,
        zora_profile_data: profile,
        signature: signatureResult,
        last_sign_in: new Date().toISOString(),
      }

      console.log("💾 Saving to Supabase:", userData)

      const { data, error } = await supabase
        .from("users")
        .upsert(userData, { onConflict: "wallet_address" })
        .select()

      if (error) {
        console.error("❌ Supabase error:", error)
        setErrorMessage(`Database error: ${error.message}`)
        setIsLoading(false)
        setStep("input")
        toast.error(`Save failed: ${error.message}`)
        return
      }

      console.log("✅ Profile saved to database")

      if (data && data.length > 0) {
        setStep("complete")
        toast.success(`Welcome, ${profile.displayName || profile.handle}! 🎉`)
        
        setTimeout(() => {
          if (isCreator) {
            router.push("/dashboard")
          } else {
            router.push("/explore")
          }
        }, 1500)
      }

    } catch (error) {
      console.error("❌ Unexpected error:", error)
      setErrorMessage("Something went wrong. Please try again.")
      setIsLoading(false)
      setStep("input")
      toast.error("Sign in failed")
    }
  }

  if (!mounted || !ready) {
    return (
      <div className="w-full max-w-md">
        <div className="glass-strong rounded-2xl p-6 space-y-6 border-2 border-primary/20 min-h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-semibold text-primary">Powered by Zora</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Sign In With Zora
        </h2>
        <p className="text-sm text-muted-foreground">
          Verify your Zora profile to access Revel
        </p>
      </div>

      {/* Main Form */}
      <div className="glass-strong rounded-2xl p-6 space-y-6 border-2 border-primary/20">
        {step === "input" && (
          <>
            {!isConnected ? (
              <div className="space-y-4">
                <div className="glass rounded-xl p-6 border border-primary/20 bg-primary/5 text-center space-y-4">
                  <AlertCircle className="h-12 w-12 text-primary mx-auto" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Connect Your Wallet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect your Base wallet to continue with Zora sign-in
                    </p>
                  </div>
                  <ConnectWallet />
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Connected Wallet</Label>
                  <div className="glass rounded-lg p-3 border border-accent/20 bg-accent/5">
                    <p className="text-sm font-mono text-accent">
                      {address?.slice(0, 6)}...{address?.slice(-4)} ✓
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zoraHandle">
                    Zora Username <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="zoraHandle"
                    placeholder="yourhandle"
                    value={zoraHandle}
                    onChange={(e) => {
                      setZoraHandle(e.target.value)
                      setErrorMessage("")
                    }}
                    disabled={!isConnected || isLoading}
                    className="glass border-primary/30 focus:border-primary h-12"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isLoading) {
                        handleSignIn()
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    Don't have a Zora profile?
                    <a
                      href="https://zora.co"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1 ml-2"
                    >
                      Create one <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </div>

                {errorMessage && (
                  <div className="glass rounded-lg p-4 border border-destructive/30 bg-destructive/5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">{errorMessage}</p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSignIn}
                  disabled={isLoading || !isConnected || !zoraHandle.trim()}
                  className="w-full rounded-full bg-gradient-to-r from-primary to-accent py-6 text-lg font-bold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Continue with Zora"
                  )}
                </Button>
              </>
            )}
          </>
        )}

        {step === "verify" && (
          <div className="text-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <div className="space-y-2">
              <p className="font-semibold">Verifying your Zora profile</p>
              <p className="text-sm text-muted-foreground">
                Please sign the message in your wallet
              </p>
            </div>
          </div>
        )}

        {step === "complete" && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-lg">Welcome to Revel!</p>
              <p className="text-sm text-muted-foreground">
                Redirecting you...
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="glass rounded-xl p-4 border border-accent/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Why verify with Zora?</strong><br />
          This prevents impersonation by ensuring your connected wallet matches your Zora profile's public wallet.
        </p>
      </div>
    </div>
  )
}
"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { OnchainKitProvider } from "@coinbase/onchainkit"
import { base, baseSepolia } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi" // Standard WagmiProvider
import { PrivyProvider } from "@privy-io/react-auth"
import { config } from "@/lib/wagmi-config"

const queryClient = new QueryClient()

const isDevelopment = process.env.NODE_ENV === "development"
const chain = isDevelopment ? baseSepolia : base

// User interface (unchanged)
interface User {
  id?: string
  wallet_address: string
  zora_handle?: string
  display_name?: string
  bio?: string
  profile_image?: string
  zora_creator_coin_address?: string
  is_creator: boolean
  created_at?: string
  last_sign_in?: string
  signature?: string
  zora_profile_data?: any
}

const UserContext = createContext<{
  user: User | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
} | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  const primaryAddress = wallets[0]?.address

  const fetchUser = async () => {
    if (!authenticated || !primaryAddress || !supabase) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error: supabaseError } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", primaryAddress.toLowerCase())
        .single()

      if (supabaseError && supabaseError.code !== 'PGRST116') {
        throw supabaseError
      }

      setUser(data || null)
    } catch (err) {
      console.error("User fetch error:", err)
      setError("Failed to load profile")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [authenticated, primaryAddress])

  const value = {
    user,
    loading,
    error,
    refetch: fetchUser
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within UserProvider")
  }
  return context
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#FF3366",
          logo: "/revel-logo.png",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        defaultChain: chain,
        supportedChains: [base, baseSepolia], // Multi-chain for sync
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <OnchainKitProvider 
              chain={chain} 
              apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
              config={{
                analytics: false,
              }}
            >
              {children}
            </OnchainKitProvider>
          </UserProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  )
}
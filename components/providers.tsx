"use client"

import type React from "react"

import { OnchainKitProvider } from "@coinbase/onchainkit"
import { base, baseSepolia } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { config } from "@/lib/wagmi-config"

const queryClient = new QueryClient()

const isDevelopment = process.env.NODE_ENV === "development"
const chain = isDevelopment ? baseSepolia : base

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* 
          NOTE: NEXT_PUBLIC_ONCHAINKIT_API_KEY is intentionally a public client-side key.
          OnchainKit API keys are designed to be exposed in the browser (like Google Maps API keys).
          They are used for rate limiting and analytics, NOT for authentication.
          This is the official recommended usage per Coinbase OnchainKit documentation.
          Security warning can be safely ignored.
        */}
        <OnchainKitProvider 
          chain={chain} 
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          config={{
            analytics: false, // Disables telemetry/metrics requests to prevent blocks
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
"use client"

import type React from "react"
import { OnchainKitProvider } from "@coinbase/onchainkit"
import { base, baseSepolia } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { PrivyProvider } from "@privy-io/react-auth"
import { config } from "@/lib/wagmi-config"

const queryClient = new QueryClient()

const isDevelopment = process.env.NODE_ENV === "development"
const chain = isDevelopment ? baseSepolia : base

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
        supportedChains: [base, baseSepolia],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <OnchainKitProvider 
            chain={chain} 
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            config={{
              analytics: false,
            }}
          >
            {children}
          </OnchainKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  )
}
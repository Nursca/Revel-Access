import { createConfig, http } from "wagmi"
import { base, baseSepolia } from "wagmi/chains"
import { coinbaseWallet, injected } from "wagmi/connectors"

const isDevelopment = process.env.NODE_ENV === "development"
const chains = [isDevelopment ? baseSepolia : base] as const

export const config = createConfig({
  chains,
  connectors: [
    coinbaseWallet({
      appName: process.env.NEXT_PUBLIC_APP_NAME || "Revel",
      preference: "smartWalletOnly",
    }),
    injected(),
  ],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org"),
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
})
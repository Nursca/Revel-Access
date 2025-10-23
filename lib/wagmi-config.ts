import { createConfig, http } from "wagmi"
import { base, baseSepolia } from "wagmi/chains"
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors"

const isDevelopment = process.env.NODE_ENV === "development"
const chains = [base, baseSepolia] as const // Always include both for multi-chain support

export const config = createConfig({
  chains,
  connectors: [
    coinbaseWallet({
      appName: process.env.NEXT_PUBLIC_APP_NAME || "Revel",
      preference: "smartWalletOnly",
    }),
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
      showQrModal: true,
    }),
  ],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org"),
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
})

declare module "wagmi" {
  interface Register {
    config: typeof config
  }
}
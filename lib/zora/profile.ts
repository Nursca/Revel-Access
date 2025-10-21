import { getProfile, getProfileCoins } from "@zoralabs/coins-sdk"

export interface ZoraProfile {
  id: string
  handle: string
  displayName?: string
  bio?: string
  avatar?: {
    medium?: string
    small?: string
  }
  publicWallet?: {
    walletAddress: string
  }
  creatorCoin?: {
    address: string
    marketCap?: string
    marketCapDelta24h?: string
  }
  socialAccounts?: {
    twitter?: { username: string; displayName: string }
    instagram?: { username: string; displayName: string }
    farcaster?: { username: string; displayName: string }
  }
}

export interface CreatorCoin {
  address: string
  name: string
  symbol: string
  description?: string
  marketCap: string
  totalSupply: string
  uniqueHolders: number
  volume24h?: string
  pricePerToken: number
  mediaContent?: {
    previewImage?: {
      medium?: string
    }
  }
}

export async function fetchZoraProfile(identifier: string): Promise<ZoraProfile | null> {
  try {
    const response = await getProfile({ identifier: identifier.toLowerCase().trim() })
    const profile = response?.data?.profile as any

    if (!profile) return null

    return {
      id: profile.id,
      handle: profile.handle,
      displayName: profile.displayName,
      bio: profile.bio,
      avatar: profile.avatar,
      publicWallet: profile.publicWallet,
      creatorCoin: profile.creatorCoin,
      socialAccounts: profile.socialAccounts,
    }
  } catch (error) {
    console.error("Error fetching Zora profile:", error)
    return null
  }
}

export async function fetchCreatorCoin(identifier: string): Promise<CreatorCoin | null> {
  try {
    const response = await getProfileCoins({ identifier: identifier.toLowerCase().trim(), count: 1 })
    const coin = response?.data?.profile?.createdCoins?.edges?.[0]?.node as any

    if (!coin) return null

    const marketCap = parseFloat(coin.marketCap || "0")
    const totalSupply = parseFloat(coin.totalSupply || "1")
    const pricePerToken = marketCap / totalSupply

    return {
      address: coin.address,
      name: coin.name,
      symbol: coin.symbol,
      description: coin.description,
      marketCap: coin.marketCap,
      totalSupply: coin.totalSupply,
      uniqueHolders: coin.uniqueHolders || 0,
      volume24h: coin.volume24h,
      pricePerToken,
      mediaContent: coin.mediaContent,
    }
  } catch (error) {
    console.error("Error fetching creator coin:", error)
    return null
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`
  }
  return value.toFixed(2)
}
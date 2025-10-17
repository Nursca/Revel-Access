// Shared types for the Revel platform

export interface Drop {
  id: string
  creatorAddress: string
  creatorName: string
  creatorImage?: string
  title: string
  description: string
  contentType: "video" | "audio" | "image" | "text"
  contentUrl: string
  thumbnailUrl?: string
  tokenRequirement: string
  tokenAddress: string
  status: "draft" | "active" | "archived"
  views: number
  unlocks: number
  createdAt: string
  updatedAt: string
}

export interface Community {
  id: string
  creatorAddress: string
  name: string
  description: string
  imageUrl?: string
  memberCount: number
  createdAt: string
}

export interface Unlock {
  id: string
  dropId: string
  userAddress: string
  unlockedAt: string
}

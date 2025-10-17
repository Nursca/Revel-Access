"use client"

// Authentication utilities
// TODO: Replace with Supabase auth when integration is added

export interface UserProfile {
  walletAddress: string
  role: "creator" | "fan"
  displayName: string
  bio: string
  profileImage?: string
  coverImage?: string
  zoraCreatorCoinAddress?: string
  socialLinks?: {
    twitter?: string
    instagram?: string
    website?: string
  }
  createdAt: string
}

export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null

  const userStr = localStorage.getItem("revel_user")
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function isCreator(user: UserProfile | null): boolean {
  return user?.role === "creator"
}

export function isFan(user: UserProfile | null): boolean {
  return user?.role === "fan"
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("revel_user")
  }
}

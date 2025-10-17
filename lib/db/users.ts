"use client"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { UserProfile } from "@/lib/auth"

export async function createOrUpdateUser(profile: UserProfile): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient()

  if (!supabase) {
    // Fallback to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("revel_user", JSON.stringify(profile))
    }
    return { success: true }
  }

  try {
    const { error } = await supabase.from("users").upsert(
      {
        wallet_address: profile.walletAddress.toLowerCase(),
        role: profile.role,
        display_name: profile.displayName,
        bio: profile.bio,
        profile_image: profile.profileImage,
        cover_image: profile.coverImage,
        zora_creator_coin_address: profile.zoraCreatorCoinAddress?.toLowerCase(),
        social_links: profile.socialLinks,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "wallet_address",
      },
    )

    if (error) throw error

    // Also store in localStorage for quick access
    if (typeof window !== "undefined") {
      localStorage.setItem("revel_user", JSON.stringify(profile))
    }

    return { success: true }
  } catch (error) {
    console.error(" Error creating/updating user:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getUserByAddress(address: string): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient()

  if (!supabase) {
    // Fallback to localStorage
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("revel_user")
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user.walletAddress.toLowerCase() === address.toLowerCase()) {
          return user
        }
      }
    }
    return null
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", address.toLowerCase())
      .single()

    if (error) throw error
    if (!data) return null

    return {
      walletAddress: data.wallet_address,
      role: data.role,
      displayName: data.display_name,
      bio: data.bio,
      profileImage: data.profile_image,
      coverImage: data.cover_image,
      zoraCreatorCoinAddress: data.zora_creator_coin_address,
      socialLinks: data.social_links,
      createdAt: data.created_at,
    }
  } catch (error) {
    console.error(" Error fetching user:", error)
    return null
  }
}

export async function getAllCreators(): Promise<UserProfile[]> {
  const supabase = getSupabaseBrowserClient()

  if (!supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "creator")
      .order("created_at", { ascending: false })

    if (error) throw error

    // DB row type for users table
    interface DBUser {
      wallet_address: string
      role: string
      display_name?: string | null
      bio?: string | null
      profile_image?: string | null
      cover_image?: string | null
      zora_creator_coin_address?: string | null
      social_links?: Record<string, unknown>[] | null
      created_at?: string | null
      updated_at?: string | null
    }

    return (data || []).map((user: DBUser) => ({
      walletAddress: user.wallet_address,
      role: user.role,
      displayName: user.display_name,
      bio: user.bio,
      profileImage: user.profile_image,
      coverImage: user.cover_image,
      zoraCreatorCoinAddress: user.zora_creator_coin_address,
      socialLinks: user.social_links,
      createdAt: user.created_at,
    }))
  } catch (error) {
    console.error(" Error fetching creators:", error)
    return []
  }
}

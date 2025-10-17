"use client"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Drop } from "@/lib/types"

export async function createDrop(
  drop: Omit<Drop, "id" | "views" | "unlocks" | "createdAt" | "updatedAt">,
): Promise<{ success: boolean; dropId?: string; error?: string }> {
  const supabase = getSupabaseBrowserClient()

  if (!supabase) {
    // Fallback to localStorage
    const mockId = `drop_${Date.now()}`
    if (typeof window !== "undefined") {
      const drops = JSON.parse(localStorage.getItem("revel_drops") || "[]")
      drops.push({
        ...drop,
        id: mockId,
        views: 0,
        unlocks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      localStorage.setItem("revel_drops", JSON.stringify(drops))
    }
    return { success: true, dropId: mockId }
  }

  try {
    const { data, error } = await supabase
      .from("drops")
      .insert({
        creator_address: drop.creatorAddress.toLowerCase(),
        creator_name: drop.creatorName,
        creator_image: drop.creatorImage,
        title: drop.title,
        description: drop.description,
        content_type: drop.contentType,
        content_url: drop.contentUrl,
        thumbnail_url: drop.thumbnailUrl,
        token_requirement: drop.tokenRequirement,
        token_address: drop.tokenAddress.toLowerCase(),
        status: drop.status,
      })
      .select("id")
      .single()

    if (error) throw error

    return { success: true, dropId: data.id }
  } catch (error) {
    console.error(" Error creating drop:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getDropById(id: string): Promise<Drop | null> {
  const supabase = getSupabaseBrowserClient()

  if (!supabase) {
    // Fallback to localStorage
    if (typeof window !== "undefined") {
      const drops = JSON.parse(localStorage.getItem("revel_drops") || "[]")
      return drops.find((d: Drop) => d.id === id) || null
    }
    return null
  }

  try {
    const { data, error } = await supabase.from("drops").select("*").eq("id", id).single()

    if (error) throw error
    if (!data) return null

    return {
      id: data.id,
      creatorAddress: data.creator_address,
      creatorName: data.creator_name,
      creatorImage: data.creator_image,
      title: data.title,
      description: data.description,
      contentType: data.content_type,
      contentUrl: data.content_url,
      thumbnailUrl: data.thumbnail_url,
      tokenRequirement: data.token_requirement,
      tokenAddress: data.token_address,
      status: data.status,
      views: data.views,
      unlocks: data.unlocks,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    console.error(" Error fetching drop:", error)
    return null
  }
}

export async function getAllDrops(filters?: { status?: string; creatorAddress?: string }): Promise<Drop[]> {
  const supabase = getSupabaseBrowserClient()

  if (!supabase) {
    // Fallback to localStorage
    if (typeof window !== "undefined") {
      let drops = JSON.parse(localStorage.getItem("revel_drops") || "[]")
      if (filters?.status) {
        drops = drops.filter((d: Drop) => d.status === filters.status)
      }
      if (filters?.creatorAddress) {
        drops = drops.filter((d: Drop) => d.creatorAddress.toLowerCase() === filters.creatorAddress?.toLowerCase())
      }
      return drops
    }
    return []
  }

  try {
    let query = supabase.from("drops").select("*")

    if (filters?.status) {
      query = query.eq("status", filters.status)
    }
    if (filters?.creatorAddress) {
      query = query.eq("creator_address", filters.creatorAddress.toLowerCase())
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((drop) => ({
      id: drop.id,
      creatorAddress: drop.creator_address,
      creatorName: drop.creator_name,
      creatorImage: drop.creator_image,
      title: drop.title,
      description: drop.description,
      contentType: drop.content_type,
      contentUrl: drop.content_url,
      thumbnailUrl: drop.thumbnail_url,
      tokenRequirement: drop.token_requirement,
      tokenAddress: drop.token_address,
      status: drop.status,
      views: drop.views,
      unlocks: drop.unlocks,
      createdAt: drop.created_at,
      updatedAt: drop.updated_at,
    }))
  } catch (error) {
    console.error(" Error fetching drops:", error)
    return []
  }
}

export async function incrementDropViews(dropId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient()

  if (!supabase) return

  try {
    await supabase.rpc("increment_drop_views", { drop_id: dropId })
  } catch (error) {
    console.error(" Error incrementing views:", error)
  }
}

export async function recordUnlock(dropId: string, userAddress: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient()

  if (!supabase) {
    return { success: true }
  }

  try {
    // Insert unlock record
    const { error: unlockError } = await supabase.from("unlocks").insert({
      drop_id: dropId,
      user_address: userAddress.toLowerCase(),
    })

    if (unlockError) throw unlockError

    // Increment unlock count
    await supabase.rpc("increment_drop_unlocks", { drop_id: dropId })

    return { success: true }
  } catch (error) {
    console.error(" Error recording unlock:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function hasUserUnlocked(dropId: string, userAddress: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient()

  if (!supabase) return false

  try {
    const { data, error } = await supabase
      .from("unlocks")
      .select("id")
      .eq("drop_id", dropId)
      .eq("user_address", userAddress.toLowerCase())
      .single()

    if (error && error.code !== "PGRST116") throw error

    return !!data
  } catch (error) {
    console.error(" Error checking unlock status:", error)
    return false
  }
}

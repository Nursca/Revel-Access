"use client"

import { readContract } from "@wagmi/core"
import { formatUnits } from "viem"
import { config } from "@/lib/wagmi-config"

// ERC-20 ABI for balanceOf function
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
] as const

export async function checkTokenBalance(
  tokenAddress: string,
  userAddress: string,
  requiredAmount: string,
): Promise<{ hasAccess: boolean; balance: string; required: string }> {
  try {
    // Read token balance from contract
    const balance = await readContract(config, {
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [userAddress as `0x${string}`],
    })

    // Convert balance to readable format (assuming 18 decimals for Creator Coins)
    const balanceFormatted = formatUnits(balance as bigint, 18)
    const hasAccess = Number(balanceFormatted) >= Number(requiredAmount)

    return {
      hasAccess,
      balance: balanceFormatted,
      required: requiredAmount,
    }
  } catch (error) {
    console.error(" Error checking token balance:", error)
    return {
      hasAccess: false,
      balance: "0",
      required: requiredAmount,
    }
  }
}

export function formatTokenAmount(amount: string): string {
  const num = Number(amount)
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toFixed(2)
}

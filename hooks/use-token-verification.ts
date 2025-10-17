"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { checkTokenBalance } from "@/lib/token-verification"

export function useTokenVerification(tokenAddress: string, requiredAmount: string) {
  const { address, isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [balance, setBalance] = useState("0")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function verifyToken() {
      if (!isConnected || !address || !tokenAddress) {
        setIsLoading(false)
        setHasAccess(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await checkTokenBalance(tokenAddress, address, requiredAmount)
        setHasAccess(result.hasAccess)
        setBalance(result.balance)
      } catch (err) {
        console.error("Token verification error:", err)
        setError("Failed to verify token balance")
        setHasAccess(false)
      } finally {
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [address, isConnected, tokenAddress, requiredAmount])

  return { isLoading, hasAccess, balance, error }
}

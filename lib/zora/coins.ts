import { getProfileCoins, getProfileBalances } from "@zoralabs/coins-sdk"

export interface CoinBalance {
  address: string
  name: string
  symbol: string
  balance: number
  balanceRaw: string
  valueUsd: string
}

export async function fetchUserCoinBalances(walletAddress: string): Promise<CoinBalance[]> {
  try {
    console.log(`[TEST] Fetching balances for wallet: ${walletAddress}`) // Log input
    const response = await getProfileBalances({
      identifier: walletAddress.toLowerCase(),
      count: 100,
    })

    console.log("[TEST] Raw balances response:", response) // Log full API response

    const edges = response?.data?.profile?.coinBalances?.edges

    if (!edges || edges.length === 0) {
      console.log("[TEST] No balances found")
      return []
    }

    const balances = edges.map((edge: any) => {
      const balanceItem = {
        address: edge.node.token.address,
        name: edge.node.token.name,
        symbol: edge.node.token.symbol,
        balance: parseFloat(edge.node.amount.amountDecimal || "0"),
        balanceRaw: edge.node.amount.amountRaw || "0",
        valueUsd: edge.node.valueUsd || "0",
      }
      console.log(`[TEST] Parsed balance:`, balanceItem) // Log each parsed item
      return balanceItem
    })

    console.log(`[TEST] Total balances fetched: ${balances.length}`)
    return balances
  } catch (error) {
    console.error("Error fetching coin balances:", error)
    return []
  }
}

export async function fetchCreatorCoins(identifier: string) { 
  try {
    console.log(`[TEST] Fetching creator coins for: ${identifier}`) // Log input
    const response = await getProfileCoins({
      identifier: identifier.toLowerCase(),
      count: 10,
    })

    console.log("[TEST] Raw creator coins response:", response) // Log full API response

    const edges = response?.data?.profile?.createdCoins?.edges

    if (!edges || edges.length === 0) {
      console.log("[TEST] No creator coins found")
      return []
    }

    const coins = edges.map((edge: any) => {
      const coinItem = {
        address: edge.node.address,
        name: edge.node.name,
        symbol: edge.node.symbol,
        description: edge.node.description,
        marketCap: edge.node.marketCap,
        totalSupply: edge.node.totalSupply,
        uniqueHolders: edge.node.uniqueHolders,
        volume24h: edge.node.volume24h,
      }
      console.log(`[TEST] Parsed coin:`, coinItem) // Log each parsed item
      return coinItem
    })

    console.log(`[TEST] Total creator coins fetched: ${coins.length}`)
    return coins
  } catch (error) {
    console.error("Error fetching creator coins:", error)
    return []
  }
}
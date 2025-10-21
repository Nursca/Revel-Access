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
    const response = await getProfileBalances({
      identifier: walletAddress.toLowerCase(),
      count: 100,
    })

    const edges = response?.data?.profile?.coinBalances?.edges

    if (!edges || edges.length === 0) {
      return []
    }

    return edges.map((edge: any) => ({
      address: edge.node.token.address,
      name: edge.node.token.name,
      symbol: edge.node.token.symbol,
      balance: parseFloat(edge.node.amount.amountDecimal || "0"),
      balanceRaw: edge.node.amount.amountRaw || "0",
      valueUsd: edge.node.valueUsd || "0",
    }))
  } catch (error) {
    console.error("Error fetching coin balances:", error)
    return []
  }
}

export async function fetchCreatorCoins(identifier: string) {
  try {
    const response = await getProfileCoins({
      identifier: identifier.toLowerCase(),
      count: 10,
    })

    const edges = response?.data?.profile?.createdCoins?.edges

    if (!edges || edges.length === 0) {
      return []
    }

    return edges.map((edge: any) => ({
      address: edge.node.address,
      name: edge.node.name,
      symbol: edge.node.symbol,
      description: edge.node.description,
      marketCap: edge.node.marketCap,
      totalSupply: edge.node.totalSupply,
      uniqueHolders: edge.node.uniqueHolders,
      volume24h: edge.node.volume24h,
    }))
  } catch (error) {
    console.error("Error fetching creator coins:", error)
    return []
  }
}
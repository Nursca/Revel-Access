import { getProfileBalances } from "@zoralabs/coins-sdk"

export interface TokenBalance {
  coinAddress: string
  coinName: string
  coinSymbol: string
  balance: number
  valueUsd?: string
}

export async function checkTokenAccess(
  userWallet: string,
  creatorCoinAddress: string,
  requiredBalance: number
): Promise<{ hasAccess: boolean; userBalance: number; balances?: TokenBalance[] }> {
  try {
    const response = await getProfileBalances({
      identifier: userWallet.toLowerCase(),
      count: 100,
    })

    const balances = response?.data?.profile?.coinBalances?.edges as any[]

    if (!balances || balances.length === 0) {
      return { hasAccess: false, userBalance: 0, balances: [] }
    }

    const allBalances: TokenBalance[] = balances.map((edge) => ({
      coinAddress: edge.node.token.address,
      coinName: edge.node.token.name,
      coinSymbol: edge.node.token.symbol,
      balance: parseFloat(edge.node.amount.amountDecimal || "0"),
      valueUsd: edge.node.valueUsd,
    }))

    const userCoinBalance = balances.find(
      (edge) => edge.node.token.address.toLowerCase() === creatorCoinAddress.toLowerCase()
    )

    if (!userCoinBalance) {
      return { hasAccess: false, userBalance: 0, balances: allBalances }
    }

    const balance = parseFloat(userCoinBalance.node.amount.amountDecimal || "0")
    const hasAccess = balance >= requiredBalance

    return { hasAccess, userBalance: balance, balances: allBalances }
  } catch (error) {
    console.error("Error checking token access:", error)
    return { hasAccess: false, userBalance: 0 }
  }
}

export async function getUserCoinBalances(userWallet: string): Promise<TokenBalance[]> {
  try {
    const response = await getProfileBalances({
      identifier: userWallet.toLowerCase(),
      count: 100,
    })

    const balances = response?.data?.profile?.coinBalances?.edges as any[]

    if (!balances) return []

    return balances.map((edge) => ({
      coinAddress: edge.node.token.address,
      coinName: edge.node.token.name,
      coinSymbol: edge.node.token.symbol,
      balance: parseFloat(edge.node.amount.amountDecimal || "0"),
      valueUsd: edge.node.valueUsd,
    }))
  } catch (error) {
    console.error("Error fetching user balances:", error)
    return []
  }
}
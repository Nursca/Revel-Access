"use client"

import { useState } from "react"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Copy, LogOut } from "lucide-react"
import { toast } from "sonner"

const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

export function ConnectWallet() {
  const { ready, authenticated, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const [copied, setCopied] = useState(false)

  // Get the active wallet address
  const activeWallet = wallets[0]
  const address = activeWallet?.address

  const handleCopy = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      toast.success("Address copied!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDisconnect = async () => {
    await logout()
    toast.success("Wallet disconnected")
  }

  // Show loading state while Privy initializes
  if (!ready) {
    return (
      <Button
        disabled
        className="rounded-full bg-primary px-6 py-2 font-semibold text-background transition-all hover:bg-primary-hover hover:glow-primary disabled:opacity-50"
      >
        <span>Loading...</span>
      </Button>
    )
  }

  // Show connect button if not authenticated
  if (!authenticated || !address) {
    return (
      <Button
        onClick={login}
        className="rounded-full bg-primary px-6 py-2 font-semibold text-background transition-all hover:bg-primary-hover hover:glow-primary"
      >
        <span>Sign In With Base</span>
      </Button>
    )
  }

  // Show connected wallet dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-full bg-primary px-6 py-2 font-semibold text-background transition-all hover:bg-primary-hover hover:glow-primary">
          <span>{truncateAddress(address)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 z-[60]" align="end" sideOffset={4}>
        <DropdownMenuLabel className="flex flex-col space-y-1">
          <span className="text-sm font-medium leading-none">Connected</span>
          <p className="text-xs text-muted-foreground">{truncateAddress(address)}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className={`mr-2 h-4 w-4 ${copied ? "text-green-500" : ""}`} />
          {copied ? "Copied!" : "Copy address"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
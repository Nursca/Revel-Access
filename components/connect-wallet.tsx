"use client"

import { useState } from "react"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useUser } from "@/components/providers" // New: For profile UI
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Copy, LogOut, User } from "lucide-react" // Add User icon
import { toast } from "sonner"

const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

export function ConnectWallet() {
  const { ready, authenticated, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const { user } = useUser() // New: Global user for profile UI
  const [copied, setCopied] = useState(false)

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

  if (!authenticated || !address) {
    return (
      <Button
        onClick={login}
        className="rounded-full bg-primary px-6 py-2 font-semibold text-background transition-all hover:bg-primary-hover hover:glow-primary"
      >
        <span>Sign in with Base</span>
      </Button>
    )
  }

  // New: Prefer profile UI if Zora signed (has user), fallback to address
  const showProfile = user && user.zora_handle
  const displayName = showProfile ? user.display_name || user.zora_handle : truncateAddress(address)
  const avatar = showProfile ? user.profile_image : null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-full bg-primary px-6 py-2 font-semibold text-background transition-all hover:bg-primary-hover hover:glow-primary">
          {avatar ? (
            <img src={avatar} alt={displayName} className="w-6 h-6 rounded-full mr-2" />
          ) : (
            <User className="h-4 w-4 mr-2" />
          )}
          <span>{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 z-[60]" align="end" sideOffset={4}>
        <DropdownMenuLabel className="flex flex-col space-y-1">
          <span className="text-sm font-medium leading-none">Connected</span>
          {showProfile ? (
            <p className="text-xs text-muted-foreground">@{user.zora_handle}</p>
          ) : (
            <p className="text-xs text-muted-foreground">{truncateAddress(address)}</p>
          )}
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
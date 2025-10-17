"use client"

import { useState } from "react"
import { useAccount, useDisconnect, useConnect } from "wagmi"
import { coinbaseWallet } from '@wagmi/connectors'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Copy } from "lucide-react"
import { toast } from "sonner" // Or your toast lib; install if needed: npm i sonner

const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { connect } = useConnect()
  const [copied, setCopied] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const handleCopy = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      toast.success("Address copied!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connect({ connector: coinbaseWallet({ appName: "Revel" }) })
    } catch (error) {
      toast.error("Connection failed—try again?")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    toast.success("Wallet disconnected")
  }

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className="rounded-full bg-primary px-6 py-2 font-semibold text-background transition-all hover:bg-primary-hover hover:glow-primary disabled:opacity-50"
      >
        <span>{isConnecting ? "Connecting..." : "Sign in with Base"}</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-full bg-primary px-6 py-2 font-semibold text-background transition-all hover:bg-primary-hover hover:glow-primary">
          <span>{truncateAddress(address!)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 z-[60]" align="end" sideOffset={4}>
        <DropdownMenuLabel className="flex flex-col space-y-1">
          <span className="text-sm font-medium leading-none">Connected</span>
          <p className="text-xs text-muted-foreground">{address ? truncateAddress(address) : ""}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className={`mr-2 h-4 w-4 ${copied ? "text-green-500" : ""}`} />
          {copied ? "Copied!" : "Copy address"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect} variant="destructive">
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
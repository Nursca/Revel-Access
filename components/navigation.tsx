"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@/components/providers" // New: Global user (replaces local fetch)
import { ConnectWallet } from "@/components/connect-wallet"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Home, 
  Compass, 
  PlusCircle, 
  User, 
  Settings, 
  LogOut,
  Users,
  LayoutDashboard,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function Navigation() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useUser() // New: Use global user (no local state/fetch needed)
  const [localUser, setLocalUser] = useState<any>(null) // Keep for logout/legacy

  // New: Sync global user to local state for backward compat
  useEffect(() => {
    if (user) {
      setLocalUser(user)
    }
  }, [user])

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("revel_user_authenticated")
      localStorage.removeItem("revel_user_role")
    }
    setLocalUser(null)
    router.push("/")
  }

  const navLinks = [
    { href: "/", label: "Home", icon: Home, show: true },
    { href: "/explore", label: "Explore", icon: Compass, show: true },
    { href: "/profiles", label: "Profiles", icon: Users, show: true },
    { href: "/how-it-works", label: "How It Works", icon: Sparkles, show: true },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: user?.is_creator || localUser?.is_creator },
    { href: "/drops/create", label: "Create", icon: PlusCircle, show: user?.is_creator || localUser?.is_creator },
    { href: "/settings", label: "Settings", icon: Settings, show: true }
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-20 group-hover:opacity-30 transition-opacity blur-xl" />
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent p-[2px]">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                    <img src="/revel-logo.png" alt="revel logo" />
                  </div>
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Revel
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="flex items-center gap-8">
              {navLinks.filter(link => link.show).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors hover:text-primary relative ${
                    pathname === link.href 
                      ? "text-primary" 
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <div className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent" />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop Auth */}
            <div className="flex items-center gap-4">
              {isConnected && (user || localUser) ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="glass border-primary/30 gap-2 h-10">
                      {(user || localUser).profile_image ? (
                        <img 
                          src={(user || localUser).profile_image} 
                          alt={(user || localUser).display_name}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      <span className="max-w-[120px] truncate font-semibold">{(user || localUser).display_name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-strong border-primary/30 w-64">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold">{(user || localUser).display_name}</p>
                        <p className="text-xs text-muted-foreground">@{(user || localUser).zora_handle}</p>
                        <p className="text-xs font-mono text-muted-foreground">
                          {address?.slice(0, 6)}...{address?.slice(-4)}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem asChild>
                      <Link href={`/profiles/${(user || localUser).zora_handle}`} className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    {(user || localUser).is_creator && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <ConnectWallet />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50 md:hidden">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent p-[2px]">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <img src="/revel-logo.png" alt="revel logo" />
                </div>
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Revel
            </span>
          </Link>

          {isConnected && (user || localUser) ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="glass rounded-full">
                  {(user || localUser).profile_image ? (
                    <img 
                      src={(user || localUser).profile_image} 
                      alt={(user || localUser).display_name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-strong border-primary/30 w-64">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold">{(user || localUser).display_name}</p>
                    <p className="text-xs text-muted-foreground">@{(user || localUser).zora_handle}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/profiles/${(user || localUser).zora_handle}`}>
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <ConnectWallet />
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 md:hidden pb-safe">
        <div className="grid grid-cols-5 h-16">
          {navLinks.filter(link => link.show).slice(0, 5).map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                }`}
              >
                <div className={`relative ${isActive ? "scale-110" : ""} transition-transform`}>
                  <Icon className="h-5 w-5" />
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] font-semibold">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
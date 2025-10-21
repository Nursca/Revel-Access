import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Providers } from "@/components/providers"

import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

export const metadata: Metadata = {
  title: "Revel - Onchain Experiences for Creators",
  description: "Token-gated content platform for Web3 creators and their communities",
  icons: {
    icon: "/favicon.ico",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head />
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
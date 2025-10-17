import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Providers } from "@/components/providers"

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
    <html lang="en">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=mona-sans@400,500,600,700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

import Link from "next/link"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Home, Search, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-2xl">
          {/* 404 Text */}
          <div className="space-y-4">
            <h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-none">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold">
              Page Not Found
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="rounded-full bg-gradient-to-r from-primary to-accent px-8 py-6 text-lg font-bold">
                <Home className="mr-2 h-5 w-5" />
                Go Home
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" className="rounded-full glass border-primary/30 px-8 py-6 text-lg font-semibold">
                <Search className="mr-2 h-5 w-5" />
                Explore Drops
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="glass-strong rounded-2xl p-6 border border-primary/20 max-w-md mx-auto">
            <p className="text-sm text-muted-foreground">
              Need help? Visit our{" "}
              <Link href="/how-it-works" className="text-primary hover:underline">
                How It Works
              </Link>{" "}
              page or return to the{" "}
              <Link href="/" className="text-primary hover:underline">
                homepage
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
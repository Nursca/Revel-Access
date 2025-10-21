import { SignInWithZora } from "@/components/sign-in-with-zora"
import { AuroraBackground } from "@/components/aurora-background"
import { Navigation } from "@/components/navigation"

export default function AuthPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuroraBackground />
      <Navigation />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-24">
        <SignInWithZora />
      </div>
    </div>
  )
}
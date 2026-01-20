"use client"

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Chrome } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
    router.push("/")
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-lg">
        
        {/* App Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Discipline Tracker</h1>
          <p className="text-muted-foreground mt-2">
            Build habits. Stay consistent. Become unstoppable.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-border my-6" />

        {/* Google Sign In */}
        <Button
          onClick={loginWithGoogle}
          className="w-full h-12 flex items-center justify-center gap-3 text-base"
        >
          <Chrome className="w-5 h-5" />
          Sign in with Google
        </Button>

        {/* Footer text */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          By signing in, you agree to stay disciplined 😌
        </p>
      </div>
    </main>
  )
}

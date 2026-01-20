"use client"



import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, BookOpen, CheckSquare, Home, LogOut } from "lucide-react"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"


export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()

  const logout = async () => {
    await signOut(auth)
    router.push("/login")
  }


  const links = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/habits", label: "Habits", icon: CheckSquare },
    { href: "/progress", label: "Progress", icon: BarChart3 },
    { href: "/reflection", label: "Reflection", icon: BookOpen },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card">
      <div className="flex items-center justify-around max-w-2xl mx-auto">
  {links.map(({ href, label, icon: Icon }) => {
    const isActive = pathname === href
    return (
      <Link
        key={href}
        href={href}
        className={`flex flex-col items-center justify-center gap-1 px-4 py-3 text-sm transition-colors ${
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="text-xs">{label}</span>
      </Link>
    )
  })}

  {/* 🔴 Logout Button */}
  <button
    onClick={logout}
    className="flex flex-col items-center justify-center gap-1 px-4 py-3 text-sm text-muted-foreground hover:text-destructive"
  >
    <LogOut className="w-5 h-5" />
    <span className="text-xs">Logout</span>
  </button>
</div>

    </nav>
  )
}

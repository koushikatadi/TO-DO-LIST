"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Flame, Target, Settings } from "lucide-react"

import { Habit, getHabits, updateHabit } from "@/lib/firestore"

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export default function DashboardPage() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [todaysFocus, setTodaysFocus] = useState("")
  const [motivationalNote, setMotivationalNote] = useState("")
  const [showFocusInput, setShowFocusInput] = useState(false)
  const [showNoteInput, setShowNoteInput] = useState(false)

  /* 🔐 AUTH CHECK (ONLY ONCE) */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/login")
      } else {
        setUser(currentUser)
        setIsLoading(false)
      }
    })
    return () => unsub()
  }, [router])

  /* 🔥 LOAD HABITS FROM FIRESTORE */
  useEffect(() => {
    if (!user) return

    const loadHabits = async () => {
      const data = await getHabits(user.uid)
      setHabits(data)
    }

    loadHabits()
  }, [user])

  /* ✅ TOGGLE HABIT */
  const toggleHabit = async (id: string) => {
    if (!user) return

    const updated = habits.map((h) =>
      h.id === id ? { ...h, completedToday: !h.completedToday } : h
    )

    setHabits(updated)

    const habit = updated.find((h) => h.id === id)
    if (habit) {
      await updateHabit(user.uid, habit)
    }
  }

  if (isLoading) return null

  const completedCount = habits.filter((h) => h.completedToday).length

  return (
    <main className="min-h-screen pb-24 bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {getGreeting()}, {user?.displayName || "User"}
          </h1>
        </div>

        {/* Habit Streaks */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Habit Streaks</CardTitle>
            <CardDescription>
              {completedCount} of {habits.length} completed today
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className={`w-5 h-5 rounded-full border-2 ${
                        habit.completedToday
                          ? "bg-primary border-primary"
                          : "border-muted-foreground"
                      }`}
                    />
                    <span className={habit.completedToday ? "line-through" : ""}>
                      {habit.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-primary">
                    <Flame className="w-4 h-4" />
                    <span>{habit.streak}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
      <Navigation />
    </main>
  )
}

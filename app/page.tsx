
"use client"


import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../lib/firebase"
import { useRouter } from "next/navigation"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Flame, Target, Settings } from "lucide-react"
import {
  habitsStore,
  updateDailyProgress,
  resetDailyHabitsIfNeeded,
  Habit,
} from "@/lib/store"




const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

const getCurrentTime = () => {
  const now = new Date()
  return now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

const MOTIVATIONAL_QUOTES = [
  "The only way to do great work is to love what you do.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Your discipline today determines your destiny tomorrow.",
  "Progress over perfection, consistency over intensity.",
  "Every small step forward is a victory worth celebrating.",
  "You are capable of more than you know.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Discipline is choosing what you want most over what you want now.",
  "Your future self will thank you for the work you do today.",
  "Consistency is the bridge between goals and accomplishment.",
  "You don't have to see the whole staircase, just take the first step.",
  "Small actions compound into significant results.",
  "Today is the perfect day to build better habits.",
  "Your effort today is your advantage tomorrow.",
  "Believe in the process, trust the journey.",
]

const getDailyQuote = () => {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length]
}

export default function DashboardPage() {
 

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.push("/login") // 🔒 redirect if not logged in
    }
  })
  return () => unsubscribe()
}, [])

    const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  const [habits, setHabits] = useState<Habit[]>([])
  const [todaysFocus, setTodaysFocus] = useState("")
  const [motivationalNote, setMotivationalNote] = useState("")
  const [showFocusInput, setShowFocusInput] = useState(false)
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
  // 🔥 reset habits if a new day started
  resetDailyHabitsIfNeeded()

  const stored = habitsStore.get()
  setHabits(stored)

  const today = new Date().toISOString().split("T")[0]
  const dailyData = JSON.parse(localStorage.getItem(`dailyData-${today}`) || "{}")
  setTodaysFocus(dailyData.focus || "")
  setMotivationalNote(dailyData.note || "")

  setIsLoading(false)
}, [])


  useEffect(() => {
    setCurrentTime(getCurrentTime())
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const saveDailyData = () => {
    const today = new Date().toISOString().split("T")[0]
    localStorage.setItem(`dailyData-${today}`, JSON.stringify({ focus: todaysFocus, note: motivationalNote }))
  }

  useEffect(() => {
    saveDailyData()
  }, [todaysFocus, motivationalNote])

  const toggleHabit = (id: string) => {
    habitsStore.toggleCompletion(id)
    const updated = habitsStore.get()
    setHabits(updated)
    updateDailyProgress()
  }

  if (isLoading) return null

  const completedCount = habits.filter((h) => h.completedToday).length
  const totalHabits = habits.length
  const completionPercentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0

  return (
    <main className="min-h-screen pb-24 bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
  {getGreeting()}, {auth.currentUser?.displayName || "User"}
</h1>

          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <p className="text-muted-foreground font-mono text-sm">{currentTime}</p>
          </div>
        </div>

        {/* Daily Motivational Quote */}
        <Card className="mb-6 bg-accent/10 border-accent/30">
          <CardContent className="pt-6">
            <p className="text-lg italic text-foreground font-medium text-center leading-relaxed">
              "{getDailyQuote()}"
            </p>
          </CardContent>
        </Card>

        {/* Today's Focus */}
        <Card className="mb-6 border-accent/20 bg-accent/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                <CardTitle className="text-lg">Today's Focus</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowFocusInput(!showFocusInput)}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showFocusInput ? (
              <Input
                value={todaysFocus}
                onChange={(e) => setTodaysFocus(e.target.value)}
                placeholder="What's your main focus today?"
                className="w-full"
              />
            ) : (
              <p className="text-foreground font-medium">{todaysFocus || "Set your focus for today"}</p>
            )}
          </CardContent>
        </Card>

        {/* Habit Streaks */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Habit Streaks</CardTitle>
            <CardDescription>
              {completedCount} of {totalHabits} completed today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {habits.length === 0 ? (
                <p className="text-muted-foreground text-sm">No habits yet. Go to Habits to add one.</p>
              ) : (
                habits.map((habit) => (
                  <div key={habit.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className={`w-5 h-5 rounded-full border-2 transition-colors ${
                          habit.completedToday
                            ? "bg-primary border-primary"
                            : "border-muted-foreground hover:border-primary"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${habit.completedToday ? "line-through text-muted-foreground" : ""}`}
                      >
                        {habit.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm font-bold">{habit.streak}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Consistency */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Today's Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-border rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-lg font-bold text-primary">{completionPercentage}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Motivational Note */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Motivational Note</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowNoteInput(!showNoteInput)}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showNoteInput ? (
              <Input
                value={motivationalNote}
                onChange={(e) => setMotivationalNote(e.target.value)}
                placeholder="Add an inspiring note for yourself"
                className="w-full"
              />
            ) : (
              <p className="text-sm italic text-foreground">
                {motivationalNote || "Add an inspiring note to motivate yourself"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Navigation />
    </main>
  )
}

"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import {
  saveHabit,
  getHabits,
  deleteHabit,
  updateHabit,
  Habit,
} from "@/lib/firestore"
import { useRouter } from "next/navigation"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react"

import confetti from "canvas-confetti"

/* 🔥 FIRE LEVELS (1–30 DAYS) */
const getFireLevel = (streak: number) => {
  if (streak >= 15) return "🔥🔥🔥"
  if (streak >= 7) return "🔥🔥"
  if (streak >= 1) return "🔥"
  return ""
}

/* 🏆 BADGES (61+ DAYS) */
const getBadge = (streak: number) => {
  if (streak >= 180) return "🥇 Elite"
  if (streak >= 90) return "🥈 Disciplined"
  if (streak >= 61) return "🥉 Committed"
  return null
}

/* 🎉 CONFETTI */
const triggerConfetti = () => {
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
  })
}

export default function HabitsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabitName, setNewHabitName] = useState("")
  const [loading, setLoading] = useState(true)

  /* 🔐 AUTH CHECK */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/login")
      else {
        setUser(u)
        setLoading(false)
      }
    })
    return () => unsub()
  }, [router])

  /* 🔥 LOAD HABITS */
  useEffect(() => {
    if (!user) return
    getHabits(user.uid).then(setHabits)
  }, [user])

  /* ➕ ADD HABIT */
  const addHabit = async () => {
    if (!newHabitName.trim() || !user) return

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      streak: 0,
      completedToday: false,
      createdDate: new Date().toISOString().split("T")[0],
    }

    await saveHabit(user.uid, habit)
    setHabits([...habits, habit])
    setNewHabitName("")
  }

  /* ✅ TOGGLE HABIT */
  const toggleHabit = async (habit: Habit) => {
    if (!user) return

    const newStreak = habit.completedToday
      ? habit.streak - 1
      : habit.streak + 1

    const updated = {
      ...habit,
      completedToday: !habit.completedToday,
      streak: newStreak,
    }

    /* 🎉 CONFETTI PHASE (31–60 DAYS) */
    if ([31, 45, 60].includes(newStreak)) {
      triggerConfetti()
    }

    await updateHabit(user.uid, updated)
    setHabits(habits.map((h) => (h.id === habit.id ? updated : h)))
  }

  /* 🗑 DELETE */
  const removeHabit = async (id: string) => {
    if (!user) return
    await deleteHabit(user.uid, id)
    setHabits(habits.filter((h) => h.id !== id))
  }

  if (loading) return null

  return (
    <main className="min-h-screen pb-24 bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Manage Habits</h1>
          <p className="text-muted-foreground">
            Build consistency one habit at a time
          </p>
        </div>

        {/* Add Habit */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Add New Habit</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="e.g. Morning walk, Reading"
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && addHabit()}
            />
            <Button onClick={addHabit}>
              <Plus className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Habits List */}
        <div className="space-y-3">
          {habits.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No habits yet. Add your first habit above 👆
              </CardContent>
            </Card>
          ) : (
            habits.map((habit) => (
              <Card key={habit.id} className="hover:shadow-md transition">
                <CardContent className="p-4 flex justify-between items-center gap-4">

                  <div className="flex items-center gap-3 flex-1">
                    <button onClick={() => toggleHabit(habit)}>
                      {habit.completedToday ? (
                        <CheckCircle2 className="text-primary" />
                      ) : (
                        <Circle className="text-muted-foreground" />
                      )}
                    </button>

                    <div>
                      <p
                        className={`font-medium ${
                          habit.completedToday
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {habit.name}
                      </p>

                      {/* 🔥 FIRE (1–30) */}
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        Streak:
                        <span className="font-bold text-primary flex items-center gap-1">
                          {habit.streak}
                          {habit.streak > 0 &&
                            habit.streak <= 30 &&
                            getFireLevel(habit.streak)}
                        </span>
                      </p>

                      {/* 🏆 BADGE (61+) */}
                      {habit.streak >= 61 && (
                        <p className="text-xs font-semibold text-accent mt-1">
                          {getBadge(habit.streak)}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeHabit(habit.id)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Navigation />
    </main>
  )
}
